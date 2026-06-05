import { IAppProps } from '@/src/services/types';
import { useAppStore } from '@/src/store/app-store';
import { useEffect } from 'react';

import HomePricing from '@/src/components/home-pricing';
import HomeFeatures from '@/src/components/home-features';
import HomeIntro from '@/src/components/home-intro';
import { getServerSideProps } from '@/src/services/ssp-default';

export default function Home(props: IAppProps) {
  const setCustomer = useAppStore((state) => state.setCustomer);

  useEffect(() => {
    if (props.customer) {
      setCustomer(props.customer);
    }
  }, [setCustomer, props]);

  return (
    <div className="flex flex-col gap-24">
      <div>
        <HomeIntro />
      </div>

      <div id="features">
        <HomeFeatures />
      </div>

      <div id="pricing">
        <HomePricing {...props}></HomePricing>
      </div>
    </div>
  );
}

export { getServerSideProps };
