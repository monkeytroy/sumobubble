import { SITES_BASE_URL } from '@/config';

export interface IChat {
  user: string;
  text: string;
  isError?: boolean;
}

/**
 * Fetch the published site config. In preview mode hits the local Next API
 * (which wraps the doc in { data }); otherwise pulls the published JSON from
 * the CDN. Returns null on any failure (network, non-200, parse, missing
 * preview wrapper).
 */
export const getSiteConfig = async (siteId: string, preview: boolean): Promise<ISite | null> => {
  try {
    const siteUrl = preview
      ? `/api/site/${siteId}`
      : `${SITES_BASE_URL}/${siteId}.json`;

    const res = await fetch(siteUrl);
    if (res.status === 200) {
      const json = await res.json();
      return preview ? json?.data : json;
    }
  } catch {
    //
  }
  console.error('sumobubble: failed to load site config');
  return null;
};

/**
 * Submit a contact / info-request form. Caller passes the site id so this
 * function has no hidden dependency on prior calls.
 */
export const sendContact = async (
  siteId: string,
  { section, token, contactInfo }:
  { section: string; token: string; contactInfo: IContactInfo }
): Promise<boolean> => {
  if (!token) {
    console.warn('sumobubble: captcha validation failed');
    return false;
  }

  const res = await fetch(`${getServiceBase()}api/contact/${siteId}`, {
    method: 'POST',
    body: JSON.stringify({ section, token, ...contactInfo })
  });

  return res.status === 200;
};

const getServiceBase = (): string => {
  // The wc's API base is whatever origin the bundle was loaded from
  // (the host page's <script src=...> attribute). In dev we hit the
  // local Next service directly.
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3000/';
  }
  const scriptTag = document.querySelector<HTMLScriptElement>('#sumobubble-app-scriptastic');
  const src = scriptTag?.src ?? '';
  const match = src.match(/http[s]?:\/\/.+?\//);
  return match ? match[0] : '/';
};

export const sendChat = async (siteId: string, query: string) => {
  try {
    const res = await fetch(`${getServiceBase()}api/chat/${siteId}`, {
      method: 'POST',
      body: JSON.stringify({ query })
    });

    if (res.status === 200) {
      return await res.json();
    }
  } catch {
    //
  }
  return null;
};
