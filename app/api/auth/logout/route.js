import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    return Response.json({ error: 'Logout failed' }, { status: 500 });
  }
}
