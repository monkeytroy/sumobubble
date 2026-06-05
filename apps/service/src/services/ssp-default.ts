import { getSession } from 'next-auth/react';
import { log } from '@/src/lib/log';
import { fetchOrCreateCustomer } from './customer';
import { fetchCustomerSites } from '@/src/services/site';
import { GetServerSideProps } from 'next';

/**
 * Any page that gets server side props will read the session, the the customer id,
 * then load the configuration for that customer and pass it to the page in the props.
 *
 * @param context
 * @returns
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  log('getServerSideProps:: ');

  const session = await getSession(context);
  const customerId = session?.user?.id;
  const email = session?.user.email;
  const username = session?.user.name;
  // const siteId = context?.query.siteId;

  // if session but no email.. something is wrong. error out.
  if (!customerId || !email) {
    log(`Customer or email is missing for session ${JSON.stringify(session)}`);
    return { props: {} };
  }

  const customer = await fetchOrCreateCustomer({ customerId, username, email });

  // fetch customer sites
  const sitesRes = await fetchCustomerSites(email);

  // Pass data to the page via props
  return {
    props: {
      customer: customer,
      sites: sitesRes,
      stripe: {
        key: process.env.STRIPE_KEY || null,
        homeId: process.env.STRIPE_HOME_ID || null,
        consoleId: process.env.STRIPE_CONSOLE_ID || null
      }
    }
  };
};
