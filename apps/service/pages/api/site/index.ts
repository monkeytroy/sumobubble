import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import { requireSession } from '@/src/lib/require-session';
import Site, { ISite } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { ApiOk, ApiError, ErrorCode } from '@/src/lib/api-types';

type SiteRes = NextApiResponse<ApiOk<ISite> | ApiError>;

// Free-tier limit on sites per customer. Replace with a per-customer
// limit derived from the subscription tier when subscription handling
// is wired up (see Customer.subscription).
const SITE_LIMIT = 1;

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

    const total = await Site.find({ customerEmail: session.email }).countDocuments();
    if (total >= SITE_LIMIT) {
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
