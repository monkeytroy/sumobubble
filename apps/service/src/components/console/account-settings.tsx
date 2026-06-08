'use client';

import SiteList from '@/src/components/console/site-list';
import ConsolePricing from '@/src/components/console/console-pricing';
import SiteAdd from '@/src/components/console/site-add';
import { useAppStore } from '@/src/store/app-store';
import { IAppProps } from '@/src/services/types';

export function AccountSettings(props: IAppProps) {
  const sites = useAppStore((state) => state.sites);
  const customer = useAppStore((state) => state.customer);

  return (
    <div className="flex flex-col gap-8 relative">
      {customer?.subscription?.status != 'active' && (
        <div className="absolute top-4 right-0">
          <ConsolePricing {...props}></ConsolePricing>
        </div>
      )}

      <div className="relative max-w-2xl">
        <div className="flex flex-col gap-4">
          <p className="text-3xl font-bold tracking-tight text-gray-800 sm:text-3xl py-4">Welcome!</p>
          <p className="text-base leading-7 text-gray-600">Ready to get started?</p>
          <dl className="space-y-8 text-base leading-7 text-gray-600">
            <div className="relative pl-9">
              <dt className="inline font-semibold text-gray-900">1. Create a Site - </dt>{' '}
              <dd className="inline">Create your Site by name, then select it!</dd>
            </div>
            <div className="relative pl-9">
              <dt className="inline font-semibold text-gray-900">2. Configure the Site</dt>{' '}
              <dd className="inline">
                Once selected, add a summary for your organization that will display when someone opens SumoBubble. You can also enable and
                configure additional sections.
              </dd>
            </div>
            <div className="relative pl-9">
              <dt className="inline font-semibold text-gray-900">3. Publish!</dt>{' '}
              <dd className="inline">When you have Info Chat all setup... publish to make it public using the provided instructions on the Site Setup page.</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="font-semibold text-2xl text-gray-800">Sites</div>
        <div className="text-gray-600">
          Each site represents a location or website where SumoBubble can be installed with common information, widgets
          and theme.
        </div>
      </div>

      <div className="flex flex-col gap-16">
        {sites?.length < 1 && <SiteAdd></SiteAdd>}

        <SiteList></SiteList>
      </div>
    </div>
  );
}
