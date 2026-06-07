import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import { requireSession } from '@/src/lib/require-session';
import Site, { ISite } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { ApiOk, ApiError, ErrorCode } from '@/src/lib/api-types';

type SiteRes = NextApiResponse<ApiOk<ISite> | ApiError>;

export default async function handler(req: NextApiRequest, res: SiteRes) {
  switch (req.method) {
    case 'POST':
      await createSite(req, res);
      break;
    default:
      res.status(405).json({ error: { code: ErrorCode.MethodNotAllowed, message: 'Method unsupported' } });
  }
}

const createSite = async (req: NextApiRequest, res: SiteRes) => {
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    await connectMongo();

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const siteTitle = body?.title;
    if (!siteTitle) {
      res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Site name was not provided' } });
      return;
    }

    // TODO check subscription limits
    const total = await Site.find({ customerEmail: session.email }).countDocuments();
    if (total >= 2) {
      res.status(409).json({ error: { code: 'site_limit_reached', message: 'Already at the max number of sites allowed.' } });
      return;
    }

    const newSite: ISite = {
      customerId: session.sub,
      customerEmail: session.email,
      title: siteTitle,
      summary: { enabled: false, content: '' },
      chatbot: { enabled: false },
      sections: {}
    };

    const created = await Site.create(newSite);
    const { __v, ...siteRes } = created.toJSON();

    res.status(201).json({ data: siteRes });
  } catch (err) {
    log(err);
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message || 'Something went wrong.' } });
  }
};
