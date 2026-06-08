import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/src/lib/mongoose';
import { requireSession, apiOk, apiEmpty, apiError } from '@/src/lib/api-route';
import { log } from '@/src/lib/log';
import Site, { ISite } from '@/src/models/site';
import { ErrorCode } from '@/src/lib/api-types';

type Ctx = { params: Promise<{ siteId: string }> };

/**
 * Fetch a site, customer-scoped. Used by the wc in preview mode (loaded
 * inside the authenticated /console/* pages) to render the in-progress
 * config without going through the published S3 file.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`GET: api/site/${siteId}`);

  try {
    await connectMongo();

    const site = await Site.findOne({ _id: siteId, customerEmail: session.email }).select('-__v');
    if (!site) return apiError(ErrorCode.NotFound, 'Site not found', 404);

    return apiOk(site.toJSON());
  } catch (err) {
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}

/**
 * Update the site on user edits. Customer-scoped: callers can only update
 * sites they own.
 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`PUT: api/site/${siteId}`);

  try {
    await connectMongo();

    const siteConfig: ISite = await req.json();

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

    if (!site) {
      log(`Could not update siteId ${siteId} for ${session.email}`);
      return apiError(ErrorCode.NotFound, 'Site not found', 404);
    }

    const { __v, ...siteRes } = site.toJSON();
    return apiOk(siteRes);
  } catch (err) {
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}

/**
 * Delete a site. Customer-scoped: callers can only delete sites they own.
 */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`DELETE: api/site/${siteId}`);

  try {
    await connectMongo();

    const deleteRes = await Site.findOneAndDelete({ _id: siteId, customerEmail: session.email });
    if (!deleteRes) return apiError(ErrorCode.NotFound, 'Site not found', 404);

    return apiEmpty();
  } catch (err) {
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}
