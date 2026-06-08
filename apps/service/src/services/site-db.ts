import mongoose from 'mongoose';
import Site from '@/src/models/site';
import type { ISite } from '@/src/models/site.types';
import connectMongo from '@/src/lib/mongoose';
import type { ISitesSummary } from '@/src/services/types';

/**
 * Fetch the customer sites by email. Server-only — touches the DB directly.
 */
export const fetchCustomerSites = async (email: string): Promise<ISitesSummary[]> => {
  await connectMongo();

  const sites: ISitesSummary[] = await Site.find({ customerEmail: email });
  return sites.map((val) => ({
    _id: val._id.toString(),
    title: val.title
  }));
};

/**
 * Fetch a site, scoped to the caller's email. Returns null if no site with
 * the given id is owned by that email — same shape as "not found" so a
 * mis-typed URL and a cross-account access attempt look identical to the
 * caller (no information leak about whether the id exists for someone else).
 */
export const fetchCustomerSite = async (siteId: string, customerEmail: string): Promise<ISite | null> => {
  if (!siteId || !mongoose.isValidObjectId(siteId) || !customerEmail) {
    return null;
  }

  await connectMongo();
  return Site.findOne({ _id: siteId, customerEmail }).select('-__v');
};
