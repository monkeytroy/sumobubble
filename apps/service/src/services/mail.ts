import nodemailer from 'nodemailer';
import { log } from '@/src/lib/log';
import { Email } from '@/src/services/types';

/**
 * Send an email via nodemailer. Throws if SMTP isn't configured or the
 * send fails; the caller decides how to respond.
 */
export const mailIt = async (email: Email): Promise<void> => {
  const host = process.env.SUMOBUBBLE_MAIL_HOST;
  const user = process.env.SUMOBUBBLE_MAIL_FROM;
  const pass = process.env.SUMOBUBBLE_MAIL_AUTH;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP not configured (missing SUMOBUBBLE_MAIL_HOST / SUMOBUBBLE_MAIL_FROM / SUMOBUBBLE_MAIL_AUTH)'
    );
  }
  if (!email.emailTo) {
    throw new Error('mailIt: emailTo is empty');
  }

  const transporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: { user, pass }
  });

  const info = await transporter.sendMail({
    from: user,
    to: email.emailTo,
    subject: email.subject,
    html: email.body
  });

  log(`Message sent: ${info.messageId}`);
};
