import Site, { ISite } from '@/src/models/site';
import { toast } from 'react-toastify';
import connectMongo from '@/src/lib/mongoose';
import { ISitesSummary } from '@/src/services/types';
import mongoose from 'mongoose';

/**
 * Fetch the customer sites by customer id.
 * @param {string} customerId
 * @returns {ISitesSummary[]} the site id and title in array
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
 * Fetch the site
 * @param {string} siteId get a site by the site id
 * @returns {ISite} the site config
 */
export const fetchCustomerSite = async (siteId: string): Promise<ISite | null> => {
  if (!siteId || !mongoose.isValidObjectId(siteId)) {
    return null;
  }

  await connectMongo();
  const site = await Site.findById(siteId).select('-__v');
  return site;
};

/**
 * Add a new site.
 * @param {string} siteTitle the title of the new site to add
 * @returns
 */
export const addNewSite = async (siteTitle: string) => {
  const res = await fetch(`/api/site`, {
    method: 'POST',
    body: JSON.stringify({ title: siteTitle })
  });

  const fetchRes = await res.json();

  return fetchRes;
};

/**
 * Remove a site.
 * @param {string} siteId the id of the site to remove
 * @returns
 */
export const removeSite = async (siteId: string) => {
  const res = await fetch(`/api/site/${siteId}`, {
    method: 'DELETE'
  });

  const json = await res.json();

  if (json.success) {
    toast.success('Site was removed!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return json.data;
  } else {
    toast.error('Ooops! Site was not removed. ' + json.message, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return null;
  }
};

/**
 * save a site and toast it's success.
 * @param {ISite} config the site to save
 * @returns
 */
export const saveSite = async (site: ISite) => {
  const res = await fetch(`/api/site/${site._id}`, {
    method: 'PUT',
    body: JSON.stringify(site)
  });

  const json = await res.json();

  if (json.success) {
    toast.success('Saved!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return json.data;
  } else {
    toast.error('Ooops! Could not save!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return null;
  }
};

/**
 * Publish the site which writes the site config json to a
 * file on S3 storage (or spaces)
 * @param {string} siteId id of the site to publish
 * @returns
 */
export const publishSite = async (siteId: string) => {
  const res = await fetch(`/api/site/${siteId}/publish`, {
    method: 'POST'
  });

  const json = await res.json();

  if (json.success) {
    toast.success('Site was published! Time to deploy!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return json.data;
  } else {
    toast.error('Oops... could not publish site!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true
    });

    return null;
  }
};
