import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { apiMiddleware } from '@/src/lib/api-middleware';
import { log } from '@/src/lib/log';
import { IApiRes } from '../../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AskSource from '@/src/models/askSource';
import connectMongo from '@/src/lib/mongoose';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD']
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await apiMiddleware(req, res, cors);

  switch (req.method) {
    case 'GET':
      await get(req, res);
      break;
    case 'POST':
      await post(req, res);
      break;
    default:
      res.status(405).send({ success: false, message: 'Method unsupported' });
  }
}

/**
 * TBD - need to store or cache chats for reloads
 */
const get = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).send({ success: false, message: 'No chat history yet.' });
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
const post = async (req: NextApiRequest, res: NextApiResponse<IApiRes>) => {
  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;
  log(`api/chat/${siteId}`);

  if (!siteIdVal) {
    return res.status(500).send({ success: false, message: 'Missing site id' });
  }

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) {
    return res.status(500).send({ success: false, message: 'AI is not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const query = body?.query;

    await connectMongo();

    const masterSource = await AskSource.findOne(
      { siteId: siteIdVal, isMaster: true },
      {
        siteId: 1,
        contents: 1
      }
    );

    // do AI req
    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // todo configure
    const prompt = `
      You are a happy, playful, and helpful assistant called Sumo Bubble Assistant. You will be provided 
      some summary information about an organization or individual and then asked 
      questions about that organization or individual. 

      You will only answer questions based on the provided summary, not from any 
      other source.  If you cannot answer the question from the summary, simply 
      say 'I am not sure about that'.

      Do not respond or converse with the user outside answering questions about the
      summary information.

      Important: When responding to queries, do not directly reference the summary 
      itself. Instead, present the information as if it were common knowledge 
      or a well-known fact.

      For example, if the document contains a biography of a person, and you're 
      asked "What is this about?", you might respond with "This is about the 
      life and accomplishments of [Person's Name]."

      Here is the summary text to  answer questions. 
    `;

    console.log(prompt, masterSource.contents, query);

    const result = await model.generateContent([prompt, masterSource.contents, 'Here is the users question:', query]);

    const text = result.response.text();

    console.log(text);

    // return it
    if (text) {
      res.status(200).json({ success: true, message: text });
    } else {
      const msg = `Chat failed siteId: ${siteId}`;
      log(msg);
      res.status(500).send({ success: false, message: msg });
    }
  } catch (err) {
    res.status(405).send({ success: false, message: `Error ${(<Error>err)?.message}` });
  }
};
