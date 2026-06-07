import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import { ErrorCode } from '@/src/lib/api-types';

/**
 * Per-route auth gate. Returns the decoded JWT on success. On failure,
 * writes a 401 response and returns null — the caller should early-exit.
 *
 *   const session = await requireSession(req, res);
 *   if (!session) return;
 */
// JWT with guaranteed `sub` and `email`. requireSession refuses to return
// a session missing either, so callers can use session.email directly.
// We key ownership off `email` (stable user identity across User._id
// resets in mongo). `sub` is exposed for logging / legacy code paths.
export type AuthedSession = JWT & { sub: string; email: string };

export const requireSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthedSession | null> => {
  const session = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!session?.sub || !session?.email) {
    res.status(401).json({ error: { code: ErrorCode.Unauthorized, message: 'Unauthorized' } });
    return null;
  }
  return session as AuthedSession;
};
