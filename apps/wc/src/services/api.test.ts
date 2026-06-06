import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSiteConfig } from './api';

const SITE_ID = 'abc123';

describe('getSiteConfig', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the published site JSON from the CDN when not in preview', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      json: async () => ({ _id: SITE_ID, title: 'Site' }),
    });

    const out = await getSiteConfig(SITE_ID, false);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain(`/${SITE_ID}.json`);
    expect(out).toEqual({ _id: SITE_ID, title: 'Site' });
  });

  it('hits the local /api/site preview endpoint in preview mode and unwraps .data', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      json: async () => ({ data: { _id: SITE_ID, title: 'Preview' } }),
    });

    const out = await getSiteConfig(SITE_ID, true);

    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toBe(`/api/site/${SITE_ID}`);
    expect(out).toEqual({ _id: SITE_ID, title: 'Preview' });
  });

  it('returns null on non-200 responses', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 404,
      json: async () => ({}),
    });

    const out = await getSiteConfig(SITE_ID, false);
    expect(out).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'));

    const out = await getSiteConfig(SITE_ID, false);
    expect(out).toBeNull();
  });
});
