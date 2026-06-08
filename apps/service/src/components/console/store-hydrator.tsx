'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/src/store/app-store';
import { ICustomer } from '@/src/models/customer';
import { ISite } from '@/src/models/site';
import { ISitesSummary } from '@/src/services/types';

interface Props {
  customer?: ICustomer | null;
  sites?: ISitesSummary[];
  site?: ISite | null;
  children: ReactNode;
}

export default function StoreHydrator({ customer, sites, site, children }: Props) {
  const setCustomer = useAppStore((state) => state.setCustomer);
  const setSites = useAppStore((state) => state.setSites);
  const setSite = useAppStore((state) => state.setSite);

  useEffect(() => {
    if (customer) setCustomer(customer);
  }, [customer, setCustomer]);

  useEffect(() => {
    if (sites) setSites(sites);
  }, [sites, setSites]);

  useEffect(() => {
    if (site) setSite(site);
  }, [site, setSite]);

  return <>{children}</>;
}
