import { executeQuery } from '@/lib/db';

// Database-backed rate limiting.
//
// The in-memory limiter in ./rateLimit.js only sees one instance's traffic.
// On Vercel every cold start gets a fresh module, and concurrent lambdas each
// keep their own counter, so a determined spammer effectively bypasses it.
// Counting hits in MySQL gives one shared window across every instance.
//
// Requires the `rate_hits` table (see ensureRateLimitTable below).

let tableReady = false;

async function ensureRateLimitTable() {
  if (tableReady) return;
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS rate_hits (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      bucket VARCHAR(190) NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_bucket_time (bucket, created_at)
    )
  `);
  tableReady = true;
}

/**
 * Sliding-window counter shared by all instances.
 * Returns { allowed, retryAfter } where retryAfter is in seconds.
 */
export async function rateLimitDb(bucket, { limit, windowSeconds }) {
  try {
    await ensureRateLimitTable();

    const [{ hits, oldest }] = await executeQuery(
      `SELECT COUNT(*) AS hits, MIN(created_at) AS oldest
         FROM rate_hits
        WHERE bucket = ? AND created_at > (NOW() - INTERVAL ? SECOND)`,
      [bucket, windowSeconds]
    );

    if (Number(hits) >= limit) {
      const elapsed = oldest ? (Date.now() - new Date(oldest).getTime()) / 1000 : 0;
      return { allowed: false, retryAfter: Math.max(1, Math.ceil(windowSeconds - elapsed)) };
    }

    await executeQuery('INSERT INTO rate_hits (bucket, created_at) VALUES (?, NOW())', [bucket]);

    // Opportunistic cleanup so the table cannot grow without bound.
    if (Math.random() < 0.02) {
      await executeQuery('DELETE FROM rate_hits WHERE created_at < (NOW() - INTERVAL 1 DAY)');
    }

    return { allowed: true, retryAfter: 0 };
  } catch (error) {
    // Fail open. If the database is unreachable this must not lock the owner
    // out of admin login or reject every genuine enquiry -- the in-memory
    // limiter in ./rateLimit.js still applies as a floor.
    console.error(`rateLimitDb unavailable for "${bucket}":`, error.message);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Count rows in a window without recording a hit. */
export async function countDb(bucket, windowSeconds) {
  try {
    await ensureRateLimitTable();
    const [{ hits }] = await executeQuery(
      `SELECT COUNT(*) AS hits FROM rate_hits
        WHERE bucket = ? AND created_at > (NOW() - INTERVAL ? SECOND)`,
      [bucket, windowSeconds]
    );
    return Number(hits);
  } catch {
    return 0;
  }
}
