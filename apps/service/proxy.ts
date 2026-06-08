import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { log } from './src/lib/log';

const UNAUTH_PAGE = '/';

// Page routes that require a signed-in user. Unauthenticated requests are
// redirected to UNAUTH_PAGE. API-route auth is handled per-route via
// requireSession() in src/lib/require-session.ts — that gives each handler
// access to the session for ownership checks.
const protectedRoutes = ['/console/*', '/sections/*'];

export enum Role {
  user = 'user',
  admin = 'admin'
}

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const isProtected =
    protectedRoutes.includes(pathname) ||
    protectedRoutes.some((val) => val.endsWith('/*') && pathname.startsWith(val.replace('/*', '')));

  if (!isProtected) {
    return NextResponse.next();
  }

  const jwt = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!jwt) {
    log(`Redirecting unauthenticated request: ${pathname}`);
    return NextResponse.redirect(new URL(UNAUTH_PAGE, req.url));
  }

  return NextResponse.next();
};
