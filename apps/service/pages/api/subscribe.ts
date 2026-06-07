import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import connectMongo from '@/src/lib/mongoose';
import Customer, { SubscriptionStatus } from '@/src/models/customer';
import { log } from '@/src/lib/log';
import { ConfigRes } from './_types';

/**
 * Stripe webhook. Stripe sends signed payloads — we verify the signature
 * before trusting anything, otherwise an attacker could POST fabricated
 * subscription events and grant themselves access.
 *
 * Setup:
 *   1. STRIPE_SECRET_KEY    — your Stripe secret (sk_live_... / sk_test_...).
 *   2. STRIPE_WEBHOOK_SECRET — the endpoint's "Signing secret" (whsec_...).
 *      For local dev: `stripe listen --forward-to localhost:3000/api/subscribe`
 *      prints a whsec_... to put in .env.
 */

// We need the raw request body to verify the signature; Next's body parser
// would mutate it and the signature check would fail.
export const config = {
  api: { bodyParser: false }
};

// Minimal local shapes for the event payloads we actually handle. The full
// Stripe.* nested types aren't usable here because the Node SDK's CJS .d.ts
// entry only re-exports the constructor (no nested namespace) under our
// current moduleResolution. The signature verification happens at
// constructEvent regardless of these types.
interface StripeEventObjectBase {
  object: string;
  id: string;
}

interface StripeCustomer extends StripeEventObjectBase {
  object: 'customer';
  email: string | null;
}

interface StripeSubscription extends StripeEventObjectBase {
  object: 'subscription';
  customer: string | { id: string };
  status: string;
  items?: { data?: Array<{ plan?: { product?: string | { id: string } } }> };
}

const readRawBody = async (req: NextApiRequest): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfigRes>) {
  if (req.method !== 'POST') {
    res.status(405).send({ success: false, message: 'Method unsupported' });
    return;
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  if (!stripeSecret || !webhookSecret) {
    log('subscribe:: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not configured');
    res.status(500).send({ success: false, message: 'Stripe webhook not configured' });
    return;
  }

  if (!signature || Array.isArray(signature)) {
    res.status(400).send({ success: false, message: 'Missing stripe-signature header' });
    return;
  }

  const stripe = new Stripe(stripeSecret);
  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    log(`subscribe:: signature verification failed: ${(<Error>err)?.message}`);
    res.status(400).send({ success: false, message: 'Invalid signature' });
    return;
  }

  log(`Webhook verified: ${event.type}`);

  const eventObject = event.data?.object as StripeEventObjectBase | undefined;
  if (eventObject) {
    await Promise.all([
      linkCustomer(eventObject),
      updateSubscription(eventObject)
    ]);
  }

  res.status(200).send({ success: true, message: 'Success' });
}

/**
 * TODO Replace with queue event.
 */
const linkCustomer = async (eventObject: StripeEventObjectBase) => {
  if (eventObject.object !== 'customer') return;
  const customer = eventObject as StripeCustomer;

  if (!customer.id || !customer.email) {
    log('linkCustomer:: error - customer object but missing id or email.', customer);
    return;
  }

  try {
    await connectMongo();
    const rec = await Customer.findOne({ email: customer.email });
    if (rec) {
      rec.subscription.customerId = customer.id;
      await rec.save();
    } else {
      log(`linkCustomer:: error - customer was not found for email ${customer.email}.`, customer);
    }
  } catch (err) {
    log('linkCustomer:: error - failed linking customer to event object.', err, customer);
  }
};

/**
 * TODO Replace with queue
 */
const updateSubscription = async (eventObject: StripeEventObjectBase) => {
  if (eventObject.object !== 'subscription') return;
  const sub = eventObject as StripeSubscription;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

  let subscriptionId: string = sub.id;
  // Product id can be either a string or an expanded object depending on
  // how the webhook event was emitted. Handle both defensively.
  const firstItem = sub.items?.data?.[0];
  const rawProduct = firstItem?.plan?.product;
  let productId = typeof rawProduct === 'string' ? rawProduct : rawProduct?.id ?? '';
  let chatbot = false;

  if ((process.env.STRIPE_CHAT_PRODUCTS || '').split(',').includes(productId)) {
    chatbot = true;
  }

  if (sub.status !== SubscriptionStatus.Active) {
    chatbot = false;
    productId = '';
    subscriptionId = '';
  }

  if (!customerId) {
    log('updateSubscription:: error - customerId missing in event.', sub);
    return;
  }

  try {
    await connectMongo();
    const rec = await Customer.findOne({ 'subscription.customerId': customerId });
    if (rec) {
      rec.subscription.id = subscriptionId;
      rec.subscription.status = sub.status;
      rec.subscription.productId = productId;
      rec.subscription.metadata = { chatbot };
      await rec.save();
    } else {
      log(`updateSubscription:: error - could not find customer ${customerId} for event object.`, sub);
    }
  } catch (err) {
    log(`updateSubscription:: error - could not find customer ${customerId} for event object.`, err, sub);
  }
};
