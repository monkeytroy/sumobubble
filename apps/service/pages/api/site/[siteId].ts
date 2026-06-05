import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import { log } from '@/src/lib/log';
import Site, { ISite } from '@/src/models/site';
import { ConfigRes } from '../types';
import { getToken } from 'next-auth/jwt';

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
 * Get site could be disabled as it's no longer needed after moving to a file based publish.
 * @param req
 * @param res
 */
const getSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  try {
    await connectMongo();

    const { siteId } = req.query;
    log(`GET: api/site/${siteId}`);

    const site = await Site.findById(siteId).select('-__v');

    // fetch the customer
    if (site) {
      res.status(200).json({ success: true, message: 'Message for you sir!', data: site.toJSON() });
    } else {
      const message = `Config was not found for site ${siteId}`;
      console.log(message);
      res.status(404).json({ success: false, message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};

/**
 * Update the site on user edits.
 * @param req
 * @param res
 */
const updateSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  // route should be protected
  // todo middleware or lib function for protected routes.
  const session = await getToken({ req, secret: process.env.JWT_SECRET });
  // early exit if not authorized.
  if (!session) {
    res.status(403).send({ success: false, message: 'Unauthorized' });
    return;
  }

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

    // find or create
    const site = await Site.findOneAndUpdate({ _id: siteId }, siteConfig, {
      new: true
    });

    if (site) {
      const { __v, ...siteRes } = site.toJSON();
      res.status(200).json({ success: true, message: 'Updated', data: siteRes });
    } else {
      log('Could not update siteId: ' + siteId);
      res.status(500).json({ success: false, message: 'Failed to update' });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};

/**
 * Delete a site
 * @param req
 * @param res
 */
const deleteSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  const { siteId } = req.query;
  log(`DELETE: api/site/${siteId}`);

  try {
    await connectMongo();

    const deleteRes = await Site.findOneAndDelete({ _id: siteId });

    if (deleteRes) {
      res.status(200).json({ success: true, message: 'Updated' });
    } else {
      res.status(404).json({ success: true, message: 'Could not remove site' });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};
