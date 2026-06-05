import 'react-toastify/dist/ReactToastify.css';
import { ReactElement, useEffect } from 'react';
import { useAppStore } from '@/src/store/app-store';
import { getServerSideProps } from '@/src/services/ssp-site';
import { useRouter } from 'next/router';
import { sections } from '@/src/components/console/sections/sections';
import React from 'react';
import { ISiteProps } from '@/src/services/types';

export default function SectionPage(props: ISiteProps) {
  const router = useRouter();
  const { section } = router.query || 'contact';

  // app props on app state
  const setSite = useAppStore((state) => state.setSite);
  const setCustomer = useAppStore((state) => state.setCustomer);

  useEffect(() => {
    if (props.site) {
      setSite(props.site);
    }
    if (props.customer) {
      setCustomer(props.customer);
    }
  }, [setSite, setCustomer, props.site, props.customer]);

  const child: ReactElement | undefined = sections.find((val) => val.name.toLowerCase() == section)?.component;

  return <>{child && <div>{React.cloneElement(child, props)}</div>}</>;
}

export { getServerSideProps };
