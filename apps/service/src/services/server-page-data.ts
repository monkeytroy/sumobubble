import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth-options';
import { log } from '@/src/lib/log';
import { fetchOrCreateCustomer } from './customer';
import { fetchCustomerSite, fetchCustomerSites } from './site-db';
import { ICustomer } from '@/src/models/customer';
import { ISite } from '@/src/models/site';
import { ISitesSummary } from './types';

export interface ConsolePageData {
  customer: ICustomer | null;
  sites: ISitesSummary[];
  stripe: { key: string; homeId: string; consoleId: string };
}

export interface SitePageData {
  customer: ICustomer | null;
  site: ISite | null;
  stripe: { key: string; homeId: string; consoleId: string };
}

const stripeFromEnv = () => ({
  key: process.env.STRIPE_KEY || '',
  homeId: process.env.STRIPE_HOME_ID || '',
  consoleId: process.env.STRIPE_CONSOLE_ID || ''
});

/**
 * Server-side data for /console — loads or creates the customer and lists their sites.
 * Returns null when there is no session (caller redirects via proxy/middleware).
 */
export const loadConsoleData = cache(async (): Promise<ConsolePageData | null> => {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id;
  const email = session?.user?.email;
  const username = session?.user?.name;

  if (!customerId || !email) {
    log(`loadConsoleData: missing session info ${JSON.stringify(session)}`);
    return null;
  }

  const customer = await fetchOrCreateCustomer({ customerId, username, email });
  const sites = await fetchCustomerSites(email);

  return { customer, sites, stripe: stripeFromEnv() };
});

/**
 * Server-side data for /console/site/[siteId]. Email-scoped — returns null if the
 * site isn't owned by the caller (caller redirects to /console).
 */
export const loadSiteData = cache(async (siteId: string): Promise<SitePageData | null> => {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id;
  const email = session?.user?.email;
  const username = session?.user?.name;

  if (!customerId || !email || !username) {
    log(`loadSiteData: missing session info ${JSON.stringify(session)}`);
    return null;
  }

  const customer = await fetchOrCreateCustomer({ customerId, username, email });
  const site = await fetchCustomerSite(siteId, email);
  if (!site) return null;

  return {
    customer,
    site: JSON.parse(JSON.stringify(site)),
    stripe: stripeFromEnv()
  };
});
