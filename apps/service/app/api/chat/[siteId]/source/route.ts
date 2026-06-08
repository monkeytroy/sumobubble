import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/src/lib/log';
import { requireSession, apiOk, apiEmpty, apiError } from '@/src/lib/api-route';
import { ErrorCode } from '@/src/lib/api-types';
import connectMongo from '@/src/lib/mongoose';
import AskSource, { IAskSource } from '@/src/models/askSource';
import Site from '@/src/models/site';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Ctx = { params: Promise<{ siteId: string }> };

// Accept anything that's just text-with-structure — the AI ingests it
// verbatim, no parsing/conversion. Browsers are inconsistent about MIME
// for .md/.csv (sometimes empty), so also accept by extension.
const TEXT_LIKE_MIMES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'text/csv',
  'text/html',
  'text/xml',
  'application/json',
  'application/xml',
  'application/x-yaml',
  'application/yaml'
]);
const TEXT_LIKE_EXTS = ['.txt', '.md', '.markdown', '.csv', '.json', '.html', '.htm', '.xml', '.yaml', '.yml', '.log'];

const isTextLike = (mime: string, filename: string): boolean => {
  if (mime && (mime.startsWith('text/') || TEXT_LIKE_MIMES.has(mime))) return true;
  const lower = filename.toLowerCase();
  return TEXT_LIKE_EXTS.some((ext) => lower.endsWith(ext));
};

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  const id = req.nextUrl.searchParams.get('id');
  log(`DELETE api/chat/${siteId}/source?id=${id}`);

  if (!siteId) return apiError(ErrorCode.ValidationError, 'Missing site id', 400);
  if (!id) return apiError(ErrorCode.ValidationError, 'Missing source id', 400);

  try {
    await connectMongo();

    const ownsSite = await Site.exists({ _id: siteId, customerEmail: session.email });
    if (!ownsSite) return apiError(ErrorCode.NotFound, 'Site not found', 404);

    // Scope the delete by siteId too — defence-in-depth against a caller
    // who owns site A trying to delete a source under site B by id.
    const deleted = await AskSource.findOneAndDelete({ _id: id, siteId, isMaster: false });
    if (!deleted) return apiError(ErrorCode.NotFound, 'Source not found', 404);

    return apiEmpty();
  } catch (err) {
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`GET api/chat/${siteId}/source`);

  if (!siteId) return apiError(ErrorCode.ValidationError, 'Missing site id', 400);

  try {
    await connectMongo();

    const ownsSite = await Site.exists({ _id: siteId, customerEmail: session.email });
    if (!ownsSite) return apiError(ErrorCode.NotFound, 'Site not found', 404);

    const sources = await AskSource.find(
      { siteId, isMaster: false },
      { customerId: 1, siteId: 1, contents: 1, origFilename: 1 }
    );

    return apiOk(sources);
  } catch (err) {
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const { siteId } = await ctx.params;
  log(`POST api/chat/${siteId}/source`);

  if (!siteId) return apiError(ErrorCode.ValidationError, 'Missing site id', 400);

  const aiApiKey = process.env.GEMINI_API_KEY;
  if (!aiApiKey) return apiError(ErrorCode.InternalError, 'AI is not configured', 500);

  await connectMongo();
  const ownsSite = await Site.exists({ _id: siteId, customerEmail: session.email });
  if (!ownsSite) return apiError(ErrorCode.NotFound, 'Site not found', 404);

  try {
    const form = await req.formData();
    const entries = form.getAll('upload');
    const uploads = entries.filter((e): e is File => e instanceof File);

    log(`upload: received ${uploads.length} file(s)`);

    if (uploads.length === 0) {
      return apiError(ErrorCode.ValidationError, 'Failed to get upload file', 400);
    }

    let savedCount = 0;
    for (const file of uploads) {
      const originalFilename = file.name;
      log(`upload: file=${originalFilename} type=${file.type} size=${file.size}`);
      if (!originalFilename) {
        log('  -> skipped: no filename');
        continue;
      }
      if (!isTextLike(file.type, originalFilename)) {
        log(`  -> skipped: not text-like (mime=${file.type})`);
        continue;
      }

      const contents = await file.text();

      const askSource: IAskSource = {
        customerId: session.sub,
        siteId,
        isMaster: false,
        origFilename: originalFilename,
        contents
      };

      // Scope the upsert by site too — without siteId in the filter, the
      // same filename uploaded to a different site would steal/move the
      // existing record instead of creating a new one.
      const saved = await AskSource.findOneAndUpdate(
        { siteId, origFilename: originalFilename, isMaster: false },
        askSource,
        { new: true, upsert: true }
      );
      log(`  -> saved id=${saved?._id} siteId=${saved?.siteId}`);
      savedCount++;
    }

    log(`upload: saved ${savedCount}/${uploads.length}`);

    // Regenerate the master source doc and store.
    const sources = await AskSource.find({ siteId });
    let masterSource = '';
    for (const source of sources) {
      masterSource += '/n----------DocStart----------' + source.contents;
    }

    const genAI = new GoogleGenerativeAI(aiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
      { siteId, isMaster: true },
      {
        customerId: session.sub,
        siteId,
        isMaster: true,
        contents: masterDocContents
      },
      { new: true, upsert: true }
    );

    return apiEmpty();
  } catch (err) {
    log(`api/chat/${siteId}/source error: ${(<Error>err)?.message}`);
    return apiError(ErrorCode.InternalError, (<Error>err)?.message, 500);
  }
}
