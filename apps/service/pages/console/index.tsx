import { AccountSettings } from '@/src/components/console/account-settings';
import { getServerSideProps } from '@/src/services/ssp-default';
import { IAppProps } from '@/src/services/types';
import { useAppStore } from '@/src/store/app-store';
import { useEffect } from 'react';

export default function Console(props: IAppProps) {
  // app props on app state
  const setSites = useAppStore((state) => state.setSites);
  const setCustomer = useAppStore((state) => state.setCustomer);

  useEffect(() => {
    setSites(props.sites || []);
    if (props.customer) {
      setCustomer(props.customer);
    }
  }, [setSites, setCustomer, props.sites, props.customer]);

  return <AccountSettings {...props} />;
}

export { getServerSideProps };
