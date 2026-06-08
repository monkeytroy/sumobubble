import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import connectMongo from '@/src/lib/mongoose';
import { requireSession, apiOk, apiError } from '@/src/lib/api-route';
import { log } from '@/src/lib/log';
import Site from '@/src/models/site';
import { getS3Client } from '@/src/lib/s3';
import { PutObjectCommand, PutObjectRequest } from '@aws-sdk/client-s3';
import { ErrorCode } from '@/src/lib/api-types';

// In dev, publish writes a single file the wc test page always reads.
// "Last published wins" — no siteId in the URL needed in the test page.
const DEV_PUBLISH_PATH =
  process.env.DEV_PUBLISH_PATH ??
  path.resolve(process.cwd(), '..', 'wc', 'dev-sites', 'dev-site.json');

type Ctx = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`POST: api/site/${siteId}/publish`);

  try {
    await connectMongo();

    const site = await Site.findOne({ _id: siteId, customerEmail: session.email });
    if (!site) return apiError(ErrorCode.NotFound, 'Site not found', 404);

    const { __v, ...siteRes } = site.toJSON();
    const body = JSON.stringify(siteRes);

    if (process.env.NODE_ENV !== 'production') {
      await publishToLocal(body);
      log(`Published to ${DEV_PUBLISH_PATH}`);
      return apiOk(siteRes);
    }

    await publishToS3(`sites/${siteId}.json`, body);
    return apiOk(siteRes);
  } catch (err) {
    log(`publish error: ${(<Error>err)?.message}`);
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}

const publishToLocal = async (body: string) => {
  await fs.mkdir(path.dirname(DEV_PUBLISH_PATH), { recursive: true });
  await fs.writeFile(DEV_PUBLISH_PATH, body, 'utf8');
};

const publishToS3 = async (objectKey: string, body: string) => {
  const s3Client = getS3Client();
  const fileParams: PutObjectRequest = {
    Bucket: process.env.SPACES_BUCKET,
    ACL: 'public-read',
    Key: objectKey,
    // @ts-ignore - s3 library vs spaces api type mismatch
    Body: body,
    ContentType: 'application/json'
  };

  const putObjectRes = await s3Client.send(new PutObjectCommand(fileParams));
  if (putObjectRes.$metadata.httpStatusCode !== 200) {
    throw new Error('S3 PutObject returned non-200');
  }
};
