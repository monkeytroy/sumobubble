import { toast } from 'react-toastify';
import type { ISite } from '@/src/models/site.types';

// Client-side HTTP helpers for the site API. Server-side DB calls live in
// site-db.ts so importing this module doesn't drag mongoose into the
// client bundle.

const toastErr = (label: string, json: { error?: { message?: string } } | null) => {
  toast.error(`Ooops! ${label}: ${json?.error?.message || 'Unknown error'}`, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true
  });
};

const toastOk = (msg: string) => {
  toast.success(msg, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true
  });
};

/**
 * Add a new site. Returns the created site on success, or null on failure.
 */
export const addNewSite = async (siteTitle: string): Promise<ISite | null> => {
  const res = await fetch(`/api/site`, {
    method: 'POST',
    body: JSON.stringify({ title: siteTitle })
  });
  const json = await res.json();

  if (res.ok) {
    toastOk('Created!');
    return json.data;
  }
  toastErr('New site was not created', json);
  return null;
};

/**
 * Remove a site. Returns true on success.
 */
export const removeSite = async (siteId: string): Promise<boolean> => {
  const res = await fetch(`/api/site/${siteId}`, { method: 'DELETE' });

  if (res.ok) {
    toastOk('Site was removed!');
    return true;
  }

  const json = await res.json().catch(() => null);
  toastErr('Site was not removed', json);
  return false;
};

/**
 * Save a site and toast on success/failure. Returns the saved site, or null.
 */
export const saveSite = async (site: ISite): Promise<ISite | null> => {
  const res = await fetch(`/api/site/${site._id}`, {
    method: 'PUT',
    body: JSON.stringify(site)
  });
  const json = await res.json();

  if (res.ok) {
    toastOk('Saved!');
    return json.data;
  }
  toastErr('Could not save', json);
  return null;
};

/**
 * Publish the site (writes its JSON to S3 storage). Returns the published
 * site, or null on failure.
 */
export const publishSite = async (siteId: string): Promise<ISite | null> => {
  const res = await fetch(`/api/site/${siteId}/publish`, { method: 'POST' });
  const json = await res.json();

  if (res.ok) {
    toastOk('Site was published! Time to deploy!');
    return json.data;
  }
  toastErr('Could not publish site', json);
  return null;
};
