import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/src/lib/mongoose';
import Customer, { ICustomer, SubscriptionStatus } from '@/src/models/customer';
import { log } from '@/src/lib/log';
import { ConfigRes } from './types';

/**
 * The following stripe hook 'event' objects are most important currently.
 *  customer.updated
 *  customer.created
 *  customer.subscription.created
 *  customer.deleted
 *  customer.subscription.deleted
 *
 * TODO potentially capture invoices to show to the user
 *  invoice.created
 *  invoice.finalized
 *  invoice.paid
 *  invoice.payment_succeeded
 *
 *  product.updated - when metadata changed..
 *    should capture and update local md based on data.object.id 'prod_O1AZsc9SaxmdVK' for object 'product'
 *
 * The following stripe hook 'subscription' object is the main thing.
 * Things to possibly collect include...
 *
 *   customer: string id of customer on stripe
 *   id: subscription id
 *
 *   cancel_at_period_end: boolean
 *   cancel_at: ? null
 *   cancleed_at: timestamp?
 *   cancellation_details.reason | feedback | comment
 *   current_period_end: timestamp?
 *   current_period_start: timestamp?
 *   discount: object w dtails
 *   ended_at: timestamp?
 *   metadata: object
 *   plan: {
 *     metadata: object?
 *     nickname?
 *   }
 *   quantity: number
 *   start_date: timestamp?
 *   trial_end, _start, _settings
 */

interface StripeEvent {
  object: string;
  id: string;
  email: string;
  customer: string;
  status: string;
  plan: {
    product: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfigRes>) {
  switch (req.method) {
    case 'POST':
      await post(req, res);
      break;
    default:
      res.status(405).send({ success: false, message: 'Method unsupported' });
  }
}

const post = async (req: NextApiRequest, res: NextApiResponse<ConfigRes>) => {
  log('Webhook called ------------------------------------------------------');

  // handle invoice status.
  const event = req.body;
  const eventObject = event.data?.object;

  if (eventObject) {
    linkCustomer(eventObject);
    updateSubscription(eventObject);
  }

  res.status(200).send({ success: true, message: 'Success' });
};

/**
 * TODO Replace with queue event.
 * @param eventObject
 */
const linkCustomer = async (eventObject: StripeEvent) => {
  if (eventObject.object == 'customer') {
    const id = eventObject.id;
    const email = eventObject.email;

    //console.log(eventObject)

    if (id && email) {
      try {
        connectMongo();

        const customer = await Customer.findOne({ email: email });
        if (customer) {
          customer.subscription.customerId = id;
          customer.save();
        } else {
          log(`linkCustomer:: error - customer was not found for email ${email}.`, eventObject);
        }
      } catch (err) {
        log(`linkCustomer:: error - failed linking customer to event object.`, err, eventObject);
      }
    } else {
      log(`linkCustomer:: error - customer object but missing id or email.`, eventObject);
    }
  }
};

/**
 * TODO Replace with queue
 * @param eventObject
 */
const updateSubscription = async (eventObject: StripeEvent) => {
  if (eventObject.object == 'subscription') {
    const customerId = eventObject.customer;
    const status = eventObject.status;

    let subscriptionId = eventObject.id;
    let productId = eventObject.plan.product;
    let chatbot = false;

    // todo store more info like dates.

    // todo more.. query the product for metadata instead of
    // storing the product id's here
    if ((process.env.STRIPE_CHAT_PRODUCTS || ['']).includes(productId)) {
      chatbot = true;
    }

    if (status != SubscriptionStatus.Active) {
      chatbot = false;
      productId = '';
      subscriptionId = '';
    }

    if (customerId) {
      try {
        connectMongo();

        const customer = await Customer.findOne({ 'subscription.customerId': customerId });
        if (customer) {
          customer.subscription.id = subscriptionId;
          customer.subscription.status = status;
          customer.subscription.productId = productId;
          customer.subscription.metadata = {
            chatbot
          };
          customer.save();
        } else {
          log(`updateSubscription:: error - could not find customer ${customerId} for event object.`, eventObject);
        }
      } catch (err) {
        log(`updateSubscription:: error - could not find customer ${customerId} for event object.`, err, eventObject);
      }
    } else {
      log(`updateSubscription:: error - customerId missing in event.`, eventObject);
    }
  }
};
