import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import { requireSession } from '@/src/lib/require-session';
import { log } from '@/src/lib/log';
import Site, { ISite } from '@/src/models/site';
import { ConfigRes } from '../_types';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfigRes>) {
  switch (req.method) {
    case 'GET':
      await getSite(req, res);
      break;
    case 'PUT':
      await updateSite(req, res);
      break;
    case 'DELETE':
      await deleteSite(req, res);
      break;
    default:
      res.status(405).send({ success: false, message: 'Method unsupported' });
  }
}

/**
 * Fetch a site, customer-scoped. Used by the wc in preview mode (loaded
 * inside the authenticated /console/* pages) to render the in-progress
 * config without going through the published S3 file.
 */
const getSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  log(`GET: api/site/${siteId}`);

  try {
    await connectMongo();

    const site = await Site.findOne({ _id: siteId, customerEmail: session.email }).select('-__v');

    if (site) {
      res.status(200).json({ success: true, message: 'OK', data: site.toJSON() });
    } else {
      res.status(404).json({ success: false, message: 'Site not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};

/**
 * Update the site on user edits. Customer-scoped: callers can only update
 * sites they own.
 */
const updateSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  log(`PUT: api/site/${siteId}`);

  try {
    await connectMongo();

    const siteConfig: ISite = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // massage the spotlight url if needed
    const spotlight = siteConfig.sections['spotlight'];
    if (spotlight?.url) {
      const YT_KEY = 'watch?v=';
      if (spotlight.url.indexOf(YT_KEY) > 0) {
        const urlParts = spotlight.url.split(YT_KEY);
        if (urlParts.length > 1) {
          spotlight.url = `https://www.youtube.com/embed/${urlParts[1]}`;
        }
      }
    }

    siteConfig.title = siteConfig.title.trim();

    const site = await Site.findOneAndUpdate(
      { _id: siteId, customerEmail: session.email },
      siteConfig,
      { new: true }
    );

    if (site) {
      const { __v, ...siteRes } = site.toJSON();
      res.status(200).json({ success: true, message: 'Updated', data: siteRes });
    } else {
      log(`Could not update siteId ${siteId} for ${session.email}`);
      res.status(404).json({ success: false, message: 'Site not found' });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};

/**
 * Delete a site. Customer-scoped: callers can only delete sites they own.
 */
const deleteSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  log(`DELETE: api/site/${siteId}`);

  try {
    await connectMongo();

    const deleteRes = await Site.findOneAndDelete({ _id: siteId, customerEmail: session.email });

    if (deleteRes) {
      res.status(200).json({ success: true, message: 'Deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Site not found' });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};
