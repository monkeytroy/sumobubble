// Gated console.log. Fires in any non-production NODE_ENV (so it works
// in `next dev` / tests by default without setting a custom env var)
// and goes silent in `next start` with NODE_ENV=production.
const isDev = process.env.NODE_ENV !== 'production';

export const log = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};
