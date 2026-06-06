import { SITES_BASE_URL } from '@/config';

export interface IChat {
  user: string;
  text: string;
}

// Module-level cache of the loaded site config so sendContact can read
// the Mongo _id. Marked for removal — see TODO in sendContact.
let config: Partial<ISite> = {};

/**
 * Read the site config by getting the script path as the service base url.
 * Use this for api calls inc getting the cust config.
 * @param {} customer 
 * @returns 
 */
export const getSiteConfig = async (siteId: string, preview: boolean) => {

  try {

    let siteUrl = `${SITES_BASE_URL}/${siteId}.json`;
    if (preview) {
      siteUrl = `/api/site/${siteId}`;
    }

    const res = await fetch(siteUrl);
    if (res.status === 200) {
      const json = await res.json();
      const site: ISite = preview ? json?.data : json;
      config = site;
      return site;
    }
  } catch {
    //
  }
  console.error('sumobubble: failed to load site config');
  return null;
}

/**
 * Send contact data
 * @param {*} param0 
 * @returns 
 */
export const sendContact = async (
  { section, token, contactInfo }:
  { section: string; token: string; contactInfo: IContactInfo }
) => {
  
  if (token) {

    const formbody = {
      section, 
      token,
      ...contactInfo
    }
  
    // call contact with token
    const res = await fetch(`${getServiceBase()}api/contact/${config._id}`, {
      method: 'POST',
      body: JSON.stringify(formbody)
    });

    return (res.status == 200);

  } else {
    console.warn('sumobubble: captcha validation failed');
  }

  return false;
}

const getServiceBase = (): string => {
  // calc serviceBase. Needed because the api calls are to the same
  // url the app web component was loaded from.
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
}