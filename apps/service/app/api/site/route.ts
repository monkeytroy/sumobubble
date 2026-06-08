import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/src/lib/mongoose';
import { requireSession, apiOk, apiError } from '@/src/lib/api-route';
import Site, { ISite } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { ErrorCode } from '@/src/lib/api-types';

// Free-tier limit on sites per customer. Replace with a per-customer
// limit derived from the subscription tier when subscription handling
// is wired up (see Customer.subscription).
const SITE_LIMIT = 10;

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    await connectMongo();

    const body = await req.json().catch(() => null);
    const siteTitle = body?.title;
    if (!siteTitle) {
      return apiError(ErrorCode.ValidationError, 'Site name was not provided', 400);
    }

    const total = await Site.find({ customerEmail: session.email }).countDocuments();
    if (total >= SITE_LIMIT) {
      return apiError('site_limit_reached', 'Already at the max number of sites allowed.', 409);
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

    return apiOk(siteRes, 201);
  } catch (err) {
    log(err);
    return apiError(ErrorCode.InternalError, (<Error>err)?.message || 'Something went wrong.', 500);
  }
}
