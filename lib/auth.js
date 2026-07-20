import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Name of the httpOnly session cookie set after a successful admin login.
export const SESSION_COOKIE = 'egay_admin_session';

// How long an admin session stays valid.
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'AUTH_SECRET is missing or too short. Set a long random value in .env.local'
    );
  }
  return new TextEncoder().encode(secret);
}

// Create a signed JWT for an authenticated admin session.
export async function signSession() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

// Verify a session token. Returns the payload on success, null on failure.
// Edge-safe (used by middleware) and Node-safe (used by route handlers).
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload?.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

// Set the session cookie. Call from a route handler after verifying the password.
export async function setSessionCookie() {
  const token = await signSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

// Clear the session cookie (logout).
export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// Guard for route handlers. Returns true if the request carries a valid session.
export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return (await verifySession(token)) !== null;
}

// Standard 401 response for unauthenticated mutating requests.
export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
