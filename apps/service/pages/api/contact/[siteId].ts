import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { mailIt } from '@/src/services/mail';
import { apiMiddleware } from '@/src/lib/api-middleware';
import { verifyRecaptcha } from '@/src/lib/verify-recaptcha';
import connectMongo from '@/src/lib/mongoose';
import Site, { IContactCategory } from '@/src/models/site';
import { log } from '@/src/lib/log';
import { IApiRes } from '@/pages/api/_types';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<IApiRes>) {
  await apiMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    res.status(405).send({ success: false, message: 'Only POST requests allowed' });
    return;
  }

  let resultStatus = 400;

  const result = {
    success: false,
    message: 'Could not send message'
  };

  try {
    const { section, category, email, name, phone, moreInfo, message, token }: ContactData = JSON.parse(req.body);

    // Verify the reCAPTCHA token with Google BEFORE doing any work
    // (DB lookups, sending mail). The wc executes recaptcha with
    // action: 'submit' — see apps/wc/src/composables/useRecaptcha.ts.
    const human = await verifyRecaptcha(token, 'submit');
    if (!human) {
      res.status(403).json({ success: false, message: 'reCAPTCHA verification failed' });
      return;
    }

    if (section && email && name && message && token) {
      // get the config.
      await connectMongo();
      const { siteId } = req.query;
      const site = await Site.findById(siteId);
      log(`Site: ${JSON.stringify(site)}`);

      if (site) {
        const sectionRec = site.sections.get(section);
        log(`Section: ${sectionRec}`);

        if (sectionRec) {
          // setup email message
          let bodyText = `<p><b>The following content was entered by an SumoBubble user on your website</b></p><b>Name: ${name}  |  Email: ${email}  |  Phone: ${
            phone || 'Not Provided'
          }</b> <br/> <hr/><br/>`;
          bodyText += `<p>${message}</p>`;

          const mailBody = {
            emailTo: '',
            name,
            subject: `SumoBubble contact from ${name}`,
            body: bodyText
          };

          // if category was provided.. get contact info.
          if (category) {
            const categoryRec = sectionRec?.props.categories.find(
              (val: IContactCategory) => val.title.toLowerCase() == category.toLowerCase()
            );
            log(`Category: ${JSON.stringify(categoryRec)}`);

            if (categoryRec) {
              mailBody.emailTo = categoryRec.email;
              await mailIt(mailBody);

              resultStatus = 200;
              result.success = true;
              result.message = 'Submitted';
            }
          } else {
            const emailRec = sectionRec?.props.email;

            if (emailRec && emailRec[0]) {
              mailBody.emailTo = emailRec[0];
              await mailIt(mailBody);

              resultStatus = 200;
              result.success = true;
              result.message = 'Submitted';
            } else {
              result.message = 'No email for selected section';
            }
          }
        } else {
          result.message = 'Invalid section for message destination';
        }
      } else {
        result.message = 'Invalid customer';
      }
    } else {
      result.message = 'Bad contact data';
    }
  } catch (err) {
    resultStatus = 500;
    result.message = `Error ${(<Error>err)?.message}`;
  }

  res.status(resultStatus).json(result);
}
