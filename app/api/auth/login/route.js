import { timingSafeEqual } from 'crypto';
import { setSessionCookie } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { rateLimitDb } from '@/lib/rateLimitDb';

// Constant-time string comparison to avoid leaking the password via timing.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still do a comparison to keep timing uniform, then fail.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request) {
  try {
    // Throttle login attempts per IP to blunt brute-force. The in-memory pass
    // is the fast path; the database pass is what actually holds on serverless,
    // where cold starts would otherwise hand an attacker a fresh counter.
    const ip = clientIp(request);
    const burst = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!burst.allowed) {
      return Response.json(
        { error: `Too many attempts. Try again in ${burst.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(burst.retryAfter) } }
      );
    }

    const shared = await rateLimitDb(`login:${ip}`, { limit: 10, windowSeconds: 15 * 60 });
    if (!shared.allowed) {
      return Response.json(
        { error: `Too many attempts. Try again in ${Math.ceil(shared.retryAfter / 60)} min.` },
        { status: 429, headers: { 'Retry-After': String(shared.retryAfter) } }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not configured.');
      return Response.json(
        { error: 'Server is not configured for login.' },
        { status: 500 }
      );
    }

    const { password } = await request.json().catch(() => ({}));
    if (!password || !safeEqual(password, adminPassword)) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    await setSessionCookie();
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
