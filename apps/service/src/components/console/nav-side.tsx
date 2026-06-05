import { HomeIcon } from '@heroicons/react/24/outline';
import { sections } from '@/src/components/console/sections/sections';
import { useRouter } from 'next/router';
import { useAppStore } from '@/src/store/app-store';
import { useEffect, useState } from 'react';
import { publishSite } from '@/src/services/site';
import { toast } from 'react-toastify';
import { SubscriptionStatus } from '@/src/models/customer';
import { ISection } from './types';
import { combineClassnames } from '@/src/lib/classnames';

// configuration so 'current' works.
const navigation: Array<ISection> = [...sections];

export default function NavSide() {
  const router = useRouter();
  const { section, siteId } = router.query;
  const currentRoute = router.route;

  const customer = useAppStore((state) => state.customer);
  const configuration = useAppStore((state) => state.site);
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const current = (item: ISection) => {
    return currentRoute.endsWith(`/${item.name}`) || section == item.name.toLowerCase();
  };

  useEffect(() => {
    setSubscribed(customer?.subscription?.status === SubscriptionStatus.Active);
  }, [customer]);

  const onPublish = async () => {
    if (configuration?._id) {
      setSaving(true);

      try {
        await publishSite(configuration._id);
      } finally {
        setTimeout(() => setSaving(false), 2000);
      }
    } else {
      toast.warn('No site loaded... cannot publish.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  };

  return (
    <div
      className="flex min-h-screen shrink-0 
      flex-col overflow-y-auto bg-indigo-600 px-4 pt-20">
      <nav className="">
        <ul role="list" className="flex flex-col gap-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              <a
                href={`/console`}
                className={combineClassnames(
                  currentRoute == '/console'
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                  'group flex gap-x-3 rounded-md p-2 leading-6 font-semibold'
                )}>
                <span
                  className={combineClassnames(
                    currentRoute == '/console' ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true">
                  <HomeIcon></HomeIcon>
                </span>
                Account
              </a>
            </ul>
          </li>

          <li>
            <div className="border-t border-gray-400 py-2 text-xs font-semibold leading-6 text-indigo-200">
              Site Name
            </div>
            <div className="text-white group rounded-md leading-6 font-semibold truncate">
              {configuration?.title || 'Create or Select'}
            </div>
            <button
              type="button"
              disabled={!configuration || saving || !subscribed}
              onClick={() => onPublish()}
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

            <div className={configuration ? '' : 'pointer-events-none select-none opacity-50'}>
              <ul role="list" className="-mx-2 space-y-1 text-sm">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={`/console/site/${siteId}/${item.name}`}
                      className={combineClassnames(
                        item.class,
                        current(item)
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                        'group flex gap-x-3 rounded-md p-2 leading-6 font-semibold'
                      )}>
                      <span
                        className={combineClassnames(
                          current(item) ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li className="mt-auto"></li>
        </ul>
      </nav>
    </div>
  );
}
