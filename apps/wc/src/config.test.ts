import { describe, expect, it } from 'vitest';
import { CAPTCHA_SITE_KEY, SITES_BASE_URL } from './config';

describe('config defaults', () => {
  it('falls back to a reCAPTCHA v3 site key when VITE_RECAPTCHA_SITE_KEY is not set', () => {
    // All reCAPTCHA v3 site keys begin with "6L"
    expect(CAPTCHA_SITE_KEY).toMatch(/^6L/);
    expect(CAPTCHA_SITE_KEY.length).toBeGreaterThan(30);
  });

  it('falls back to the prod sites CDN base when VITE_SITES_BASE_URL is not set', () => {
    expect(SITES_BASE_URL).toMatch(/^https:\/\//);
    expect(SITES_BASE_URL).not.toMatch(/\/$/); // no trailing slash
  });
});
