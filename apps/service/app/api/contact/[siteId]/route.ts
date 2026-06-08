import { NextRequest } from 'next/server';
import { mailIt } from '@/src/services/mail';
import { verifyRecaptcha } from '@/src/lib/verify-recaptcha';
import connectMongo from '@/src/lib/mongoose';
import Site, { IContactCategory } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { apiEmpty, apiError, corsPreflight, withCors } from '@/src/lib/api-route';
import { ErrorCode } from '@/src/lib/api-types';

type ContactData = {
  section: string;
  category?: string;
  email: string;
  name: string;
  message: string;
  phone?: string;
  moreInfo?: boolean;
  token: string;
};

type Ctx = { params: Promise<{ siteId: string }> };

export const OPTIONS = corsPreflight;

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { section, category, email, name, phone, message, token }: ContactData = await req.json();

    // Verify the reCAPTCHA token with Google BEFORE doing any work
    // (DB lookups, sending mail). The wc executes recaptcha with
    // action: 'submit' — see apps/wc/src/composables/useRecaptcha.ts.
    const human = await verifyRecaptcha(token, 'submit');
    if (!human) {
      return withCors(apiError('recaptcha_failed', 'reCAPTCHA verification failed', 403));
    }

    if (!(section && email && name && message && token)) {
      return withCors(apiError(ErrorCode.ValidationError, 'Bad contact data', 400));
    }

    await connectMongo();
    const { siteId } = await ctx.params;
    const site = await Site.findById(siteId);

    if (!site) return withCors(apiError(ErrorCode.NotFound, 'Site not found', 404));

    const sectionRec = site.sections.get(section);
    if (!sectionRec) {
      return withCors(apiError(ErrorCode.ValidationError, 'Invalid section for message destination', 400));
    }

    let emailTo = '';
    if (category) {
      const categoryRec = sectionRec.props?.categories?.find(
        (val: IContactCategory) => val.title.toLowerCase() == category.toLowerCase()
      );
      emailTo = categoryRec?.email || '';
    } else {
      emailTo = sectionRec.props?.email?.[0] || '';
    }

    if (!emailTo) {
      return withCors(apiError(ErrorCode.ValidationError, 'No email destination configured for this section', 400));
    }

    const bodyText =
      `<p><b>The following content was entered by an SumoBubble user on your website</b></p>` +
      `<b>Name: ${name}  |  Email: ${email}  |  Phone: ${phone || 'Not Provided'}</b> <br/><hr/><br/>` +
      `<p>${message}</p>`;

    await mailIt({
      emailTo,
      name,
      subject: `SumoBubble contact from ${name}`,
      body: bodyText
    });

    return withCors(apiEmpty());
  } catch (err) {
    log(`api/contact error: ${(<Error>err)?.message}`);
    return withCors(apiError(ErrorCode.InternalError, (<Error>err)?.message, 500));
  }
}
