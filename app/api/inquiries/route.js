import { executeQuery } from '@/lib/db';
import { isAuthenticated, unauthorized } from '@/lib/auth';
import { inquirySchema, validate } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { rateLimitDb } from '@/lib/rateLimitDb';
import { spamReason, messageFingerprint } from '@/lib/spam';

// Admin only: viewing the inbox.
export async function GET() {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const query = 'SELECT * FROM inquiries ORDER BY created_at DESC';
    const inquiries = await executeQuery(query);
    return Response.json({ inquiries }, { status: 200 });
  } catch (error) {
    console.error('GET /api/inquiries error:', error);
    return Response.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// A bot should not learn which of its messages were dropped, so every silent
// rejection returns the same success-shaped response a real submission gets.
const SILENT_OK = () =>
  Response.json({ message: 'Inquiry created' }, { status: 201 });

// Public: contact / artwork inquiry form.
export async function POST(request) {
  try {
    const ip = clientIp(request);

    // Layer 1: in-memory burst guard. Free, instant, and catches the common
    // case of one client hammering a single warm instance.
    const burst = rateLimit(`inquiry:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!burst.allowed) {
      return Response.json(
        { error: `Too many messages. Try again in ${Math.ceil(burst.retryAfter / 60)} min.` },
        { status: 429, headers: { 'Retry-After': String(burst.retryAfter) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { data, error } = validate(inquirySchema, body);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    // Honeypot filled => silently accept but drop (don't tip off bots).
    if (data.website) return SILENT_OK();

    // Layer 2: content heuristics. Dropped silently so bots get no feedback.
    const reason = spamReason(data);
    if (reason) {
      console.warn(`Inquiry rejected (${reason}) from ${ip}`);
      return SILENT_OK();
    }

    // Layer 3: shared limits that survive cold starts and span every instance.
    const [perIp, perEmail, global] = await Promise.all([
      rateLimitDb(`inq:ip:${ip}`, { limit: 5, windowSeconds: 10 * 60 }),
      rateLimitDb(`inq:mail:${data.email.toLowerCase()}`, { limit: 3, windowSeconds: 60 * 60 }),
      // Site-wide ceiling: a botnet spreading across many IPs still can't
      // flood the inbox or run up the database.
      rateLimitDb('inq:global', { limit: 200, windowSeconds: 24 * 60 * 60 }),
    ]);

    if (!perIp.allowed || !perEmail.allowed) {
      const retryAfter = Math.max(perIp.retryAfter, perEmail.retryAfter);
      return Response.json(
        { error: `Too many messages. Try again in ${Math.ceil(retryAfter / 60)} min.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    if (!global.allowed) {
      console.warn('Inquiry rejected: global daily cap reached');
      return Response.json(
        { error: 'We are receiving an unusual number of messages. Please email us directly.' },
        { status: 429 }
      );
    }

    // Layer 4: reject an identical message resent within 24 hours.
    const fingerprint = messageFingerprint(data.message);
    const dupes = await executeQuery(
      `SELECT COUNT(*) AS n FROM inquiries
        WHERE email = ? AND LEFT(LOWER(message), 255) = ?
          AND created_at > (NOW() - INTERVAL 1 DAY)`,
      [data.email, fingerprint]
    );
    if (Number(dupes[0]?.n) > 0) return SILENT_OK();

    const query = `
      INSERT INTO inquiries
      (artwork_id, name, email, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    await executeQuery(query, [
      data.artwork_id || null,
      data.name,
      data.email,
      data.message,
    ]);

    // Deliberately identical to SILENT_OK: a bot must not be able to tell an
    // accepted submission from a dropped one by the response body.
    return SILENT_OK();
  } catch (error) {
    console.error('POST /api/inquiries error:', error);
    return Response.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}
