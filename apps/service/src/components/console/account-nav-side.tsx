'use client';

import { HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { combineClassnames } from '@/src/lib/classnames';

export default function AccountNavSide() {
  const pathname = usePathname();
  const active = pathname === '/console';

  return (
    <div className="flex min-h-screen shrink-0 flex-col overflow-y-auto bg-indigo-600 px-4 pt-20">
      <nav>
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
      </nav>
    </div>
  );
}
