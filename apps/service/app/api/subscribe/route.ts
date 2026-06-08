import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import connectMongo from '@/src/lib/mongoose';
import Customer, { SubscriptionStatus } from '@/src/models/customer';
import { log } from '@/src/lib/log';
import { apiEmpty, apiError } from '@/src/lib/api-route';
import { ErrorCode } from '@/src/lib/api-types';

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

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');

  if (!stripeSecret || !webhookSecret) {
    log('subscribe:: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not configured');
    return apiError(ErrorCode.InternalError, 'Stripe webhook not configured', 500);
  }

  if (!signature) {
    return apiError(ErrorCode.ValidationError, 'Missing stripe-signature header', 400);
  }

  const stripe = new Stripe(stripeSecret);
  let event;

  try {
    // Raw text body required for signature verification — req.json() would mutate it.
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    log(`subscribe:: signature verification failed: ${(<Error>err)?.message}`);
    return apiError('invalid_signature', 'Invalid signature', 400);
  }

  log(`Webhook verified: ${event.type}`);

  const eventObject = event.data?.object as StripeEventObjectBase | undefined;
  if (eventObject) {
    await Promise.all([linkCustomer(eventObject), updateSubscription(eventObject)]);
  }

  return apiEmpty();
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
      rec.subscription.status = sub.status as SubscriptionStatus;
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
