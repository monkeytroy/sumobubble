// Build-time configuration. Values come from .env (VITE_*-prefixed)
// at build time and are inlined into the bundle. The fallbacks keep
// the prod CDN + public reCAPTCHA site key as the default behavior
// when no .env is provided — except SITES_BASE_URL which defaults to
// /sites in dev so the local dev-server.js mount works without any
// .env setup.

export const CAPTCHA_SITE_KEY: string =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ??
  '6LdHNPIkAAAAAHi7HsTDq-RFRKGFMwt6ZOWSFEGn';

const PROD_SITES_BASE_URL = 'https://sumobubble-space.nyc3.digitaloceanspaces.com/sites';
const DEV_SITES_BASE_URL = '/sites';

export const SITES_BASE_URL: string =
  import.meta.env.VITE_SITES_BASE_URL ??
  (import.meta.env.MODE === 'development' ? DEV_SITES_BASE_URL : PROD_SITES_BASE_URL);
