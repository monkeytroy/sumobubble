import { redirect } from 'next/navigation';
import { AccountSettings } from '@/src/components/console/account-settings';
import StoreHydrator from '@/src/components/console/store-hydrator';
import { loadConsoleData } from '@/src/services/server-page-data';

export default async function ConsolePage() {
  const data = await loadConsoleData();
  if (!data) redirect('/');

  return (
    <StoreHydrator customer={data.customer} sites={data.sites}>
      <AccountSettings customer={data.customer || undefined} sites={data.sites} stripe={data.stripe} />
    </StoreHydrator>
  );
}
