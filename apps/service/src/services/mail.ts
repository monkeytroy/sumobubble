import nodemailer from 'nodemailer';
import { log } from '@/src/lib/log';
import { Email } from '@/src/services/types';

/**
 * Send an email via nodemailer.
 * @param {Email} email the details to send
 */
export const mailIt = async (email: Email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.BEACON_MAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.BEACON_MAIL_FROM,
      pass: process.env.BEACON_MAIL_AUTH
    }
  });

  const info = await transporter.sendMail({
    from: process.env.BEACON_MAIL_FROM,
    to: email.emailTo,
    subject: email.subject,
    html: email.body
  });

  log('Message sent: %s', info.messageId);
};
