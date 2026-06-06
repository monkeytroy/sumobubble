import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

/**
 * Per-route auth gate. Returns the decoded JWT on success. On failure,
 * writes a 401 response and returns null — the caller should early-exit.
 *
 *   const session = await requireSession(req, res);
 *   if (!session) return;
 */
// JWT with a guaranteed `sub` (customer id). requireSession refuses to
// return a session without one, so callers can use session.sub directly.
export type AuthedSession = JWT & { sub: string };

export const requireSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthedSession | null> => {
  const session = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!session?.sub) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return null;
  }
  return session as AuthedSession;
};
