import { NextRequest } from 'next/server';
import { log } from '@/src/lib/log';
import { apiOk, apiError, corsPreflight, withCors } from '@/src/lib/api-route';
import { ErrorCode } from '@/src/lib/api-types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AskSource from '@/src/models/askSource';
import connectMongo from '@/src/lib/mongoose';

type Ctx = { params: Promise<{ siteId: string }> };

export const OPTIONS = corsPreflight;

/**
 * TBD - need to store or cache chats for reloads
 */
export async function GET() {
  return withCors(apiError('not_implemented', 'Chat history not implemented yet.', 501));
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { siteId } = await ctx.params;
  log(`api/chat/${siteId}`);

  if (!siteId) {
    return withCors(apiError(ErrorCode.ValidationError, 'Missing site id', 400));
  }

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) {
    return withCors(apiError(ErrorCode.InternalError, 'AI is not configured', 500));
  }

  try {
    const body = await req.json().catch(() => null);
    const query = body?.query;

    await connectMongo();

    // Use the raw uploaded source docs directly. Gemini 2.5-flash has a
    // large enough context window to take them verbatim; the previous
    // approach summarized them first into a single "master" doc, which
    // compressed out the specifics that user questions actually depend on.
    const sources = await AskSource.find({ siteId, isMaster: false }, { contents: 1, origFilename: 1 });

    if (sources.length === 0) {
      return withCors(
        apiOk({ reply: "Sorry, I don't have any information to answer your questions at the moment." })
      );
    }

    const corpus = sources
      .map((s) => `----- ${s.origFilename || 'document'} -----\n${s.contents}`)
      .join('\n\n');

    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a friendly, helpful assistant called Sumo Bubble Assistant.
      You answer visitors' questions about the organization or person
      described in the source documents below.

      Match the depth of your answer to the question:
        - Broad / open-ended questions ("what can you tell me?",
          "who is this about?", "summarize") → respond with a short
          high-level overview (2–4 sentences, ~50–80 words). Don't dump
          the documents. Offer to go deeper on any aspect.
        - Specific questions ("when did they work at X?", "what skills?")
          → answer concretely with the details from the documents.

      Ground every answer in the source documents and don't invent facts
      that aren't supported there. If a question genuinely can't be
      answered from the documents, say so briefly and offer to help with
      something else.

      Don't reference "the document" or "the summary" — speak as if the
      information is simply known.

      Source documents follow.
    `;

    const result = await model.generateContent([prompt, corpus, 'User question:', query]);
    const text = result.response.text();

    if (!text) {
      log(`Chat returned empty text siteId: ${siteId}`);
      return withCors(apiError('ai_empty_response', 'AI returned no response', 502));
    }

    return withCors(apiOk({ reply: text }));
  } catch (err) {
    log(`api/chat/${siteId} error: ${(<Error>err)?.message}`);
    return withCors(apiError(ErrorCode.InternalError, (<Error>err)?.message, 500));
  }
}
