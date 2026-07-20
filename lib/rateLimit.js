// Lightweight in-memory rate limiter (sliding window per key).
//
// NOTE: This lives in module memory, so it only protects a single running
// instance. On serverless (Vercel) each cold start resets it and concurrent
// instances don't share state -- it's best-effort defense against casual abuse
// and brute-force. For production-grade limiting, back this with Upstash Redis.

const buckets = new Map();

// Periodically drop stale buckets so memory doesn't grow unbounded.
function sweep(now, windowMs) {
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

// Returns { allowed, remaining, retryAfter(seconds) }.
export function rateLimit(key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) sweep(now, windowMs);
  return { allowed: true, remaining: limit - hits.length, retryAfter: 0 };
}

// Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
