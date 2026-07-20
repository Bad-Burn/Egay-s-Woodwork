import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// Guards the admin pages. API routes enforce auth themselves (defense in depth),
// but this gives unauthenticated users a clean redirect to the login screen
// instead of a flash of the dashboard.
export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything under /admin except the login page itself.
  matcher: ['/admin/dashboard/:path*'],
};
