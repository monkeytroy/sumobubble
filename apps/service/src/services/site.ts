import Site, { ISite } from '@/src/models/site';
import { toast } from 'react-toastify';
import connectMongo from '@/src/lib/mongoose';
import { ISitesSummary } from '@/src/services/types';
import mongoose from 'mongoose';

/**
 * Fetch the customer sites by email.
 */
export const fetchCustomerSites = async (email: string): Promise<ISitesSummary[]> => {
  await connectMongo();

  const sites: ISitesSummary[] = await Site.find({ customerEmail: email });
  const sitesRes = sites.map((val) => {
    return {
      _id: val._id.toString(),
      title: val.title
    };
  });
  return sitesRes;
};

/**
 * Fetch a site, scoped to the caller's email. Returns null if no site with
 * the given id is owned by that email — same shape as "not found" so a
 * mis-typed URL and a cross-account access attempt look identical to the
 * caller (no information leak about whether the id exists for someone else).
 */
export const fetchCustomerSite = async (
  siteId: string,
  customerEmail: string
): Promise<ISite | null> => {
  if (!siteId || !mongoose.isValidObjectId(siteId) || !customerEmail) {
    return null;
  }

  await connectMongo();
  const site = await Site.findOne({ _id: siteId, customerEmail }).select('-__v');
  return site;
};

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
