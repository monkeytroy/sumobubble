import { log } from './log';

/**
 * Verify a reCAPTCHA v3 token with Google's siteverify endpoint.
 *
 * Set RECAPTCHA_SECRET in env (paired with the site key the wc ships).
 *
 * Returns true only if Google confirms the token, the action matches
 * what we expected, and the score is at or above the threshold. v3 scores
 * range 0.0 (bot) to 1.0 (human); 0.5 is Google's recommended default.
 */
export const verifyRecaptcha = async (
  token: string | undefined | null,
  expectedAction: string,
  threshold = 0.5
): Promise<boolean> => {
  if (!token) {
    log('reCAPTCHA: missing token');
    return false;
  }

  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    log('reCAPTCHA: RECAPTCHA_SECRET not configured; rejecting');
    return false;
  }

  try {
    const params = new URLSearchParams({ secret, response: token });
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const json = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      hostname?: string;
      'error-codes'?: string[];
    };

    if (!json.success) {
      log(`reCAPTCHA: rejected (errors: ${(json['error-codes'] || []).join(', ')})`);
      return false;
    }
    // Action may be absent (Google's dev/test keys don't echo it). Only
    // enforce when present.
    if (json.action && json.action !== expectedAction) {
      log(`reCAPTCHA: action mismatch (got '${json.action}', expected '${expectedAction}')`);
      return false;
    }
    // Score may be absent (Google's dev/test keys don't return one).
    // Only enforce when present.
    if (typeof json.score === 'number' && json.score < threshold) {
      log(`reCAPTCHA: score below threshold (got ${json.score}, threshold ${threshold})`);
      return false;
    }

    return true;
  } catch (err) {
    log(`reCAPTCHA: verification failed: ${(<Error>err)?.message}`);
    return false;
  }
};
