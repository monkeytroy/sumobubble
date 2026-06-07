import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { apiMiddleware } from '@/src/lib/api-middleware';
import { log } from '@/src/lib/log';
import { ApiOk, ApiError, ErrorCode } from '@/src/lib/api-types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AskSource from '@/src/models/askSource';
import connectMongo from '@/src/lib/mongoose';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD']
});

type ChatReply = { reply: string };
type ChatRes = NextApiResponse<ApiOk<ChatReply> | ApiError>;

export default async function handler(req: NextApiRequest, res: ChatRes) {
  await apiMiddleware(req, res, cors);

  switch (req.method) {
    case 'GET':
      await get(req, res);
      break;
    case 'POST':
      await post(req, res);
      break;
    default:
      res.status(405).json({ error: { code: ErrorCode.MethodNotAllowed, message: 'Method unsupported' } });
  }
}

/**
 * TBD - need to store or cache chats for reloads
 */
const get = async (_req: NextApiRequest, res: ChatRes) => {
  res.status(501).json({ error: { code: 'not_implemented', message: 'Chat history not implemented yet.' } });
};

const post = async (req: NextApiRequest, res: ChatRes) => {
  const { siteId } = req.query;
  const siteIdVal = Array.isArray(siteId) ? siteId[0] : siteId;
  log(`api/chat/${siteId}`);

  if (!siteIdVal) {
    return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Missing site id' } });
  }

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) {
    return res.status(500).json({ error: { code: ErrorCode.InternalError, message: 'AI is not configured' } });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const query = body?.query;

    await connectMongo();

    const masterSource = await AskSource.findOne(
      { siteId: siteIdVal, isMaster: true },
      { siteId: 1, contents: 1 }
    );

    if (!masterSource) {
      return res.status(404).json({ error: { code: 'no_corpus', message: 'No source content has been uploaded for this site.' } });
    }

    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

      Here is the summary text to  answer questions.
    `;

    const result = await model.generateContent([prompt, masterSource.contents, 'Here is the users question:', query]);
    const text = result.response.text();

    if (text) {
      res.status(200).json({ data: { reply: text } });
    } else {
      log(`Chat returned empty text siteId: ${siteId}`);
      res.status(502).json({ error: { code: 'ai_empty_response', message: 'AI returned no response' } });
    }
  } catch (err) {
    log(`api/chat/${siteId} error: ${(<Error>err)?.message}`);
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message } });
  }
};
