import type { NextApiRequest, NextApiResponse } from 'next';
import { log } from '@/src/lib/log';
import { requireSession } from '@/src/lib/require-session';
import { AskSourceRes } from '@/src/lib/api-types';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<AskSourceRes>) {
  switch (req.method) {
    case 'GET':
      await getSourceDocs(req, res);
      break;
    case 'POST':
      await addSourceDoc(req, res);
      break;
    default:
      res.status(405).send({ success: false, message: 'Method unsupported' });
  }
}

/**
 * Not sure.  Maybe get chat history?
 */
const getSourceDocs = async (req: NextApiRequest, res: NextApiResponse<AskSourceRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;
  log(`api/chat/${siteIdVal}/source`);

  if (!siteIdVal) {
    return res.status(400).send({ success: false, message: 'Missing site id' });
  }

  try {
    await connectMongo();

    // Verify site ownership by email; if the caller owns the site, return
    // sources scoped to that siteId.
    const ownsSite = await Site.exists({ _id: siteIdVal, customerEmail: session.email });
    if (!ownsSite) {
      return res.status(404).send({ success: false, message: 'Site not found' });
    }

    const sources = await AskSource.find(
      { siteId: siteIdVal, isMaster: false },
      {
        customerId: 1,
        siteId: 1,
        contents: 1,
        origFilename: 1
      }
    );

    res.status(200).send({ success: true, message: `Sources for site ${siteIdVal}`, data: sources });
  } catch (err) {
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
    return;
  }
};

/**
 * User posted chat message - todo figure out
 *
 * @param req
 * @param res
 * @returns
 */
const addSourceDoc = async (req: NextApiRequest, res: NextApiResponse<AskSourceRes>) => {
  const session = await requireSession(req, res);
  if (!session) return;

  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;

  log(`api/chat/${siteIdVal}/source`);

  if (!siteIdVal) {
    return res.status(400).send({ success: false, message: 'Missing site id' });
  }

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) {
    return res.status(500).send({ success: false, message: 'AI is not configured' });
  }

  // Customer-scoped ownership check: the caller must own this site.
  await connectMongo();
  const ownsSite = await Site.exists({ _id: siteIdVal, customerEmail: session.email });
  if (!ownsSite) {
    return res.status(404).send({ success: false, message: 'Site not found' });
  }

  try {
    // read the file data.
    const form = new IncomingForm();
    const [fields, files]: [Fields, Files] = await form.parse(req);
    const uploadFiles: File[] | undefined = files['upload'];

    if (!uploadFiles) {
      const message = 'Failed to get upload file';
      return res.status(404).json({ success: false, message });
    }

    // for all files..
    const processFiles = uploadFiles.map((v) => ({
      filepath: v.filepath,
      mimetype: v.mimetype,
      originalFilename: v.originalFilename,
      success: false,
      message: ''
    }));

    await connectMongo();

    for (const file of processFiles) {
      const originalFilename = file.originalFilename;

      if (file.mimetype !== 'text/plain') {
        file.success = false;
        file.message = 'File type not supported.  Must be text/plain';
      } else if (!originalFilename) {
        file.success = false;
        file.message = 'Filename was not found.';
      } else {
        // extract file contents
        // first draft only support text files.
        const contents = await fs.readFileSync(file.filepath, 'utf8');
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

        const askSourceRec = await AskSource.findOneAndUpdate({ origFilename: file.originalFilename }, askSource, {
          new: true,
          upsert: true
        });
      }
    }

    // regenerate the master source doc and store
    // get all the docs for this site.
    const sources = await AskSource.find({ siteId: siteIdVal });

    // join using separator
    let masterSource = '';
    for (const source of sources) {
      masterSource += '/n----------DocStart----------' + source.contents;
    }

    // ai gen a master doc
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

    // write to source record
    const masterRec = await AskSource.findOneAndReplace(
      { siteId: siteIdVal, isMaster: true },
      {
        customerId: session.sub,
        siteId: siteIdVal,
        isMaster: true,
        contents: masterDocContents
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(200).json({ success: true, message: 'Ok' });
  } catch (err) {
    log(`api/chat/${siteIdVal}/source error: ${(<Error>err)?.message}`);
    res.status(500).send({ success: false, message: `Error ${(<Error>err)?.message}` });
    return;
  }
};
