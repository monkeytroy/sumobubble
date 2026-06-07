import type { NextApiRequest, NextApiResponse } from 'next';
import { log } from '@/src/lib/log';
import { requireSession } from '@/src/lib/require-session';
import { ApiOk, ApiEmpty, ApiError, ErrorCode } from '@/src/lib/api-types';
import { Fields, Files, IncomingForm, File } from 'formidable';
import fs from 'node:fs';
import connectMongo from '@/src/lib/mongoose';
import AskSource, { IAskSource } from '@/src/models/askSource';
import Site from '@/src/models/site';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: false // Disable Next.js's default body parser
  }
};

type SourceListRes = NextApiResponse<ApiOk<IAskSource[]> | ApiError>;
type SourceUploadRes = NextApiResponse<ApiEmpty | ApiError>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await getSourceDocs(req, res as SourceListRes);
      break;
    case 'POST':
      await addSourceDoc(req, res as SourceUploadRes);
      break;
    default:
      res.status(405).json({ error: { code: ErrorCode.MethodNotAllowed, message: 'Method unsupported' } });
  }
}

const getSourceDocs = async (req: NextApiRequest, res: SourceListRes) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;
  log(`GET api/chat/${siteIdVal}/source`);

  if (!siteIdVal) {
    return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Missing site id' } });
  }

  try {
    await connectMongo();

    // Verify site ownership by email; if the caller owns the site, return
    // sources scoped to that siteId.
    const ownsSite = await Site.exists({ _id: siteIdVal, customerEmail: session.email });
    if (!ownsSite) {
      return res.status(404).json({ error: { code: ErrorCode.NotFound, message: 'Site not found' } });
    }

    const sources = await AskSource.find(
      { siteId: siteIdVal, isMaster: false },
      { customerId: 1, siteId: 1, contents: 1, origFilename: 1 }
    );

    res.status(200).json({ data: sources });
  } catch (err) {
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message } });
  }
};

const addSourceDoc = async (req: NextApiRequest, res: SourceUploadRes) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;
  log(`POST api/chat/${siteIdVal}/source`);

  if (!siteIdVal) {
    return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Missing site id' } });
  }

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) {
    return res.status(500).json({ error: { code: ErrorCode.InternalError, message: 'AI is not configured' } });
  }

  await connectMongo();
  const ownsSite = await Site.exists({ _id: siteIdVal, customerEmail: session.email });
  if (!ownsSite) {
    return res.status(404).json({ error: { code: ErrorCode.NotFound, message: 'Site not found' } });
  }

  try {
    const form = new IncomingForm();
    const [fields, files]: [Fields, Files] = await form.parse(req);
    const uploadFiles: File[] | undefined = files['upload'];

    if (!uploadFiles) {
      return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Failed to get upload file' } });
    }

    const processFiles = uploadFiles.map((v) => ({
      filepath: v.filepath,
      mimetype: v.mimetype,
      originalFilename: v.originalFilename,
      success: false,
      message: ''
    }));

    for (const file of processFiles) {
      const originalFilename = file.originalFilename;

      if (file.mimetype !== 'text/plain') {
        file.success = false;
        file.message = 'File type not supported.  Must be text/plain';
      } else if (!originalFilename) {
        file.success = false;
        file.message = 'Filename was not found.';
      } else {
        // first draft only support text files.
        const contents = fs.readFileSync(file.filepath, 'utf8');
        file.success = true;

        // todo consider how to de-dup contents best.
        // option 1 to start - unique file name
        // option 2 check for dup contents in other files?

        const askSource: IAskSource = {
          customerId: session.sub,
          siteId: siteIdVal,
          isMaster: false,
          origFilename: originalFilename,
          contents
        };

        await AskSource.findOneAndUpdate(
          { origFilename: file.originalFilename },
          askSource,
          { new: true, upsert: true }
        );
      }
    }

    // Regenerate the master source doc and store.
    const sources = await AskSource.find({ siteId: siteIdVal });
    let masterSource = '';
    for (const source of sources) {
      masterSource += '/n----------DocStart----------' + source.contents;
    }

    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // todo configure
    const prompt = `
      I have a document with a bunch of information about an organization or individual.
      I need a highly detailed summary of the document, grouped by topic,
      and including all information that person might ask about the document
      contents and the organization. This summary will be used in future AI
      queries to answer user questions. This summary should include the
      full text of as much of the document that makes sense. Be very verbose.
    `;

    const masterDocResult = await model.generateContent([prompt, masterSource]);
    const masterDocContents = masterDocResult.response.text();

    await AskSource.findOneAndReplace(
      { siteId: siteIdVal, isMaster: true },
      {
        customerId: session.sub,
        siteId: siteIdVal,
        isMaster: true,
        contents: masterDocContents
      },
      { new: true, upsert: true }
    );

    res.status(200).json({});
  } catch (err) {
    log(`api/chat/${siteIdVal}/source error: ${(<Error>err)?.message}`);
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message } });
  }
};
