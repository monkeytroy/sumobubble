import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { sections } from '@/src/components/console/sections/sections';
import { useRouter } from 'next/router';
import { useAppStore } from '@/src/store/app-store';
import { useEffect, useState } from 'react';
import { publishSite } from '@/src/services/site';
import { toast } from 'react-toastify';
import { SubscriptionStatus } from '@/src/models/customer';
import { ISection } from './types';
import { combineClassnames } from '@/src/lib/classnames';

const navigation: Array<ISection> = [...sections];

export default function NavSide() {
  const router = useRouter();
  const { section, siteId } = router.query;
  const currentRoute = router.route;

  const customer = useAppStore((state) => state.customer);
  const configuration = useAppStore((state) => state.site);
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Two distinct contexts: account-level (/console) vs site-level
  // (/console/site/[siteId]/...). The sidebar shows different items in
  // each — keeps "managing sites" visually separate from "editing this site".
  const inSiteContext = currentRoute.startsWith('/console/site/');

  const isCurrentSection = (item: ISection) =>
    currentRoute.endsWith(`/${item.name}`) || section == item.name.toLowerCase();

  useEffect(() => {
    setSubscribed(customer?.subscription?.status === SubscriptionStatus.Active);
  }, [customer]);

  const onPublish = async () => {
    if (!configuration?._id) {
      toast.warn('No site loaded... cannot publish.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true
      });
      return;
    }
    setSaving(true);
    try {
      await publishSite(configuration._id);
    } finally {
      setTimeout(() => setSaving(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen shrink-0 flex-col overflow-y-auto bg-indigo-600 px-4 pt-20">
      <nav>
        {inSiteContext ? (
          <SiteContextNav
            siteTitle={configuration?.title}
            sections={navigation}
            siteId={Array.isArray(siteId) ? siteId[0] : (siteId ?? '')}
            isCurrentSection={isCurrentSection}
            saving={saving}
            subscribed={subscribed}
            canPublish={!!configuration}
            onPublish={onPublish}
          />
        ) : (
          <AccountContextNav active={currentRoute === '/console'} />
        )}
      </nav>
    </div>
  );
}

// --- /console (account-level) -------------------------------------------

const AccountContextNav = ({ active }: { active: boolean }) => (
  <ul role="list" className="-mx-2 space-y-1">
    <li>
      <Link
        href="/console"
        className={combineClassnames(
          active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
          'group flex gap-x-3 rounded-md p-2 leading-6 font-semibold'
        )}>
        <HomeIcon
          aria-hidden="true"
          className={combineClassnames(
            active ? 'text-white' : 'text-indigo-200 group-hover:text-white',
            'h-6 w-6 shrink-0'
          )}
        />
        Sites Management
      </Link>
    </li>
  </ul>
);

// --- /console/site/[siteId]/* (site-level) ------------------------------

interface SiteContextNavProps {
  siteTitle: string | undefined;
  sections: ISection[];
  siteId: string;
  isCurrentSection: (item: ISection) => boolean;
  saving: boolean;
  subscribed: boolean;
  canPublish: boolean;
  onPublish: () => void;
}

const SiteContextNav = ({
  siteTitle,
  sections,
  siteId,
  isCurrentSection,
  saving,
  subscribed,
  canPublish,
  onPublish
}: SiteContextNavProps) => (
  <ul role="list" className="flex flex-col gap-4">
    <li>
      <Link
        href="/console"
        className="group flex gap-x-3 rounded-md p-2 leading-6 font-semibold text-indigo-200 hover:text-white hover:bg-indigo-700">
        <ArrowLeftIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white" />
        All sites
      </Link>
    </li>

    <li>
      <div className="border-t border-gray-400 py-2 text-xs font-semibold leading-6 text-indigo-200">Site</div>
      <div className="text-white group rounded-md leading-6 font-semibold truncate">
        {siteTitle || 'Untitled site'}
      </div>
      <button
        type="button"
        disabled={!canPublish || saving || !subscribed}
        onClick={onPublish}
        title="Site changes only available to user after a publish!"
        className="w-full mt-6 rounded-md bg-blue-500 py-2 px-3 text-sm font-semibold
          text-white shadow-sm hover:bg-blue-600 disabled:opacity-25
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Publish Site Now
      </button>
    </li>

    <li>
      <div className="border-t border-gray-400 py-2 text-xs font-semibold leading-6 text-indigo-200">
        Site Settings
      </div>
      <ul role="list" className="-mx-2 space-y-1 text-sm">
        {sections.map((item) => {
          const active = isCurrentSection(item);
          return (
            <li key={item.name}>
              <Link
                href={`/console/site/${siteId}/${item.name}`}
                className={combineClassnames(
                  item.class,
                  active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                  'group flex gap-x-3 rounded-md p-2 leading-6 font-semibold'
                )}>
                <span
                  aria-hidden="true"
                  className={combineClassnames(
                    active ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                    'h-6 w-6 shrink-0'
                  )}>
                  {item.icon}
                </span>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  </ul>
);
