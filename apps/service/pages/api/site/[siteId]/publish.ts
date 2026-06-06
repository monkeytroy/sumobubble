import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import { requireSession } from '@/src/lib/require-session';
import { log } from '@/src/lib/log';
import Site from '@/src/models/site';
import { getS3Client } from '@/src/lib/s3';
import { PutObjectCommand, PutObjectRequest } from '@aws-sdk/client-s3';
import { ConfigRes } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfigRes>) {
  switch (req.method) {
    case 'POST':
      await publishSite(req, res);
      break;
    default:
      res.status(405).send({ success: false, message: 'Method unsupported' });
  }
}

const publishSite = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  log(`POST: api/site/${siteId}/publish`);

  try {
    await connectMongo();

    // Customer-scoped lookup: a user can only publish sites they own.
    const site = await Site.findOne({ _id: siteId, customerId: session.sub });

    if (site) {
      // remove unnecessary fields
      const { __v, ...siteRes } = site.toJSON();

      // write file to space.
      const s3Client = getS3Client();

      const objectKey = `sites/${siteId}.json`;

      const fileParams: PutObjectRequest = {
        Bucket: process.env.SPACES_BUCKET,
        ACL: 'public-read',
        Key: objectKey,
        // todo resolve this type issue where s3 library != spaces api types.
        // @ts-ignore
        Body: JSON.stringify(siteRes),
        ContentType: 'application/json'
      };

      log('Writing object to spaces: ', fileParams);
      const putObjectRes = await s3Client.send(new PutObjectCommand(fileParams));
      log(putObjectRes);

      if (putObjectRes.$metadata.httpStatusCode == 200) {
        res.status(200).json({ success: true, message: 'Published', data: siteRes });
      } else {
        res.status(500).json({ success: false, message: 'Failed to publish site file' });
      }
    } else {
      const message = `Site with id ${siteId} was not found.`;
      log(message);
      res.status(404).json({ success: false, message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};
