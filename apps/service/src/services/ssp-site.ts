import { getSession } from 'next-auth/react';
import { log } from '../lib/log';
import { GetServerSideProps } from 'next/types';
import { fetchOrCreateCustomer } from './customer';
import { fetchCustomerSite } from './site';

/**
 * Server side props will read the session, params and get db data to return as props.
 *
 * @param context
 * @returns
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const customerId = session?.user.id;
  const email = session?.user.email;
  const username = session?.user.name;
  const siteId = context.query.siteId;

  const backToConsoleRes = {
    redirect: {
      permanent: false,
      destination: '/console'
    },
    props: {}
  };

  // if session but no email.. something is wrong. error out.
  if (!customerId || !email || !username) {
    log(`Missing customer info on session ${JSON.stringify(session)}`);
    // return empty props.. no config.
    return backToConsoleRes;
  }

  if (!siteId) {
    log(`Missing siteId`);
    return backToConsoleRes;
  }

  const customer = await fetchOrCreateCustomer({ customerId, username, email });

  // fetch customer site
  const site = await fetchCustomerSite(Array.isArray(siteId) ? siteId[0] : siteId);
  if (site) {
    // Pass data to the page via props
    return {
      props: {
        customer: customer,
        site: JSON.parse(JSON.stringify(site)),
        stripe: {
          key: process.env.STRIPE_KEY || null,
          homeId: process.env.STRIPE_HOME_ID || null,
          consoleId: process.env.STRIPE_CONSOLE_ID || null
        }
      }
    };
  } else {
    return backToConsoleRes;
  }
};
