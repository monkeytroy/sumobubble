import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import connectMongo from '@/src/lib/mongoose';
import { requireSession } from '@/src/lib/require-session';
import { log } from '@/src/lib/log';
import Site, { ISite } from '@/src/models/site';
import { getS3Client } from '@/src/lib/s3';
import { PutObjectCommand, PutObjectRequest } from '@aws-sdk/client-s3';
import { ApiOk, ApiError, ErrorCode } from '@/src/lib/api-types';

type PublishRes = NextApiResponse<ApiOk<ISite> | ApiError>;

// In dev, publish writes a single file the wc test page always reads.
// "Last published wins" — no siteId in the URL needed in the test page.
// Override the path with DEV_PUBLISH_PATH if your wc lives elsewhere.
const DEV_PUBLISH_PATH =
  process.env.DEV_PUBLISH_PATH ??
  path.resolve(process.cwd(), '..', 'wc', 'dev-sites', 'dev-site.json');

export default async function handler(req: NextApiRequest, res: PublishRes) {
  switch (req.method) {
    case 'POST':
      await publishSite(req, res);
      break;
    default:
      res.status(405).json({ error: { code: ErrorCode.MethodNotAllowed, message: 'Method unsupported' } });
  }
}

const publishSite = async (req: NextApiRequest, res: PublishRes) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  log(`POST: api/site/${siteId}/publish`);

  try {
    await connectMongo();

    // Customer-scoped lookup: a user can only publish sites they own.
    const site = await Site.findOne({ _id: siteId, customerEmail: session.email });

    if (!site) {
      res.status(404).json({ error: { code: ErrorCode.NotFound, message: 'Site not found' } });
      return;
    }

    const { __v, ...siteRes } = site.toJSON();
    const body = JSON.stringify(siteRes);

    if (process.env.NODE_ENV !== 'production') {
      await publishToLocal(body);
      log(`Published to ${DEV_PUBLISH_PATH}`);
      res.status(200).json({ data: siteRes });
      return;
    }

    await publishToS3(`sites/${siteId}.json`, body);
    res.status(200).json({ data: siteRes });
  } catch (err) {
    log(`publish error: ${(<Error>err)?.message}`);
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message } });
  }
};

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
    // todo resolve this type issue where s3 library != spaces api types.
    // @ts-ignore
    Body: body,
    ContentType: 'application/json'
  };

  const putObjectRes = await s3Client.send(new PutObjectCommand(fileParams));
  if (putObjectRes.$metadata.httpStatusCode !== 200) {
    throw new Error('S3 PutObject returned non-200');
  }
};
