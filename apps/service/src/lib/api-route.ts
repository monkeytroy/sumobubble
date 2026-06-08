import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import { ErrorCode } from '@/src/lib/api-types';

export type AuthedSession = JWT & { sub: string; email: string };

/**
 * App-router auth gate. Returns either the decoded JWT or a 401 NextResponse.
 *
 *   const session = await requireSession(req);
 *   if (session instanceof NextResponse) return session;
 */
export const requireSession = async (
  req: NextRequest
): Promise<AuthedSession | NextResponse> => {
  const session = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!session?.sub || !session?.email) {
    return apiError(ErrorCode.Unauthorized, 'Unauthorized', 401);
  }
  return session as AuthedSession;
};

export const apiOk = <T>(data: T, status = 200): NextResponse =>
  NextResponse.json({ data }, { status });

export const apiEmpty = (status = 200): NextResponse =>
  NextResponse.json({}, { status });

export const apiError = (code: string, message: string, status: number): NextResponse =>
  NextResponse.json({ error: { code, message } }, { status });

// Open CORS for endpoints called from customer-embedded widgets (chat, contact).
export const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

export const withCors = (res: NextResponse): NextResponse => {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
};

export const corsPreflight = (): NextResponse =>
  new NextResponse(null, { status: 204, headers: CORS_HEADERS });
