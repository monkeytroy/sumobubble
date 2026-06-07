import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { mailIt } from '@/src/services/mail';
import { apiMiddleware } from '@/src/lib/api-middleware';
import { verifyRecaptcha } from '@/src/lib/verify-recaptcha';
import connectMongo from '@/src/lib/mongoose';
import Site, { IContactCategory } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { ApiEmpty, ApiError, ErrorCode } from '@/src/lib/api-types';

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD']
});

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

type ContactRes = NextApiResponse<ApiEmpty | ApiError>;

export default async function handler(req: NextApiRequest, res: ContactRes) {
  await apiMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { code: ErrorCode.MethodNotAllowed, message: 'Only POST requests allowed' } });
  }

  try {
    const { section, category, email, name, phone, message, token }: ContactData = JSON.parse(req.body);

    // Verify the reCAPTCHA token with Google BEFORE doing any work
    // (DB lookups, sending mail). The wc executes recaptcha with
    // action: 'submit' — see apps/wc/src/composables/useRecaptcha.ts.
    const human = await verifyRecaptcha(token, 'submit');
    if (!human) {
      return res.status(403).json({ error: { code: 'recaptcha_failed', message: 'reCAPTCHA verification failed' } });
    }

    if (!(section && email && name && message && token)) {
      return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Bad contact data' } });
    }

    await connectMongo();
    const { siteId } = req.query;
    const site = await Site.findById(siteId);

    if (!site) {
      return res.status(404).json({ error: { code: ErrorCode.NotFound, message: 'Site not found' } });
    }

    const sectionRec = site.sections.get(section);
    if (!sectionRec) {
      return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'Invalid section for message destination' } });
    }

    // Resolve the destination email (per-category override, falling back
    // to the section's default email).
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
      return res.status(400).json({ error: { code: ErrorCode.ValidationError, message: 'No email destination configured for this section' } });
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

    res.status(200).json({});
  } catch (err) {
    log(`api/contact error: ${(<Error>err)?.message}`);
    res.status(500).json({ error: { code: ErrorCode.InternalError, message: (<Error>err)?.message } });
  }
}
