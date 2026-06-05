// Build-time configuration. Values come from .env (VITE_*-prefixed)
// at build time and are inlined into the bundle. The fallbacks keep
// the prod CDN + public reCAPTCHA site key as the default behavior
// when no .env is provided.

export const CAPTCHA_SITE_KEY: string =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ??
  '6LdHNPIkAAAAAHi7HsTDq-RFRKGFMwt6ZOWSFEGn';

export const SITES_BASE_URL: string =
  import.meta.env.VITE_SITES_BASE_URL ??
  'https://sumobubble-space.nyc3.digitaloceanspaces.com/sites';
