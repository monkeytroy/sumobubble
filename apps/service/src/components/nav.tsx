import { Fragment } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition
} from '@headlessui/react';
import { Bars3Icon, BellIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, signOut, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { combineClassnames } from '@/src/lib/classnames';

export default function Nav() {
  const { data: session } = useSession();

  const navigation = [
    { name: 'Product', href: '/#product' },
    { name: 'Features', href: '/#features' },
    { name: 'Price', href: '/#pricing' }
  ];

  return (
    <Disclosure as="nav" className="bg-white border-b-2 border-gray-200">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-6 px-4 sm:px-6 lg:px-6 text-gray-600">
            <div className="flex h-16 justify-between">
              <div className="flex flex-1">
                <div className="flex flex-shrink-0 items-center">
                  <div className="text-2xl font-bold tracking-tight flex gap-4 items-center">SumoBubble</div>
                </div>
                <div className="hidden sm:flex flex-1 items-center justify-center sm:space-x-12">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href} className="text-normal font-semibold leading-6">
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center">
                  {session && (
                    <Link data-testid="link-console" href="/console" className="text-normal font-semibold leading-6">
                      Console
                    </Link>
                  )}
                  {!session && (
                    <a
                      href="#"
                      onClick={() => signIn('auth0', { callbackUrl: `${window.location.origin}/console` })}
                      className="text-normal font-semibold leading-6">
                      Sign In
                    </a>
                  )}
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {session && session?.user?.name && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <MenuButton className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open customer menu</span>
                        <div className="h-8 w-8 rounded-full flex justify-center items-center text-gray-500 hover:text-gray-800">
                          <UserCircleIcon></UserCircleIcon>
                        </div>
                      </MenuButton>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95">
                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <MenuItem>
                          <div className="flex items-center px-2 py-2">
                            <div>
                              {session?.user?.image && (
                                <Image
                                  className="inline-block h-9 w-9 rounded-full"
                                  referrerPolicy="no-referrer"
                                  src={session.user.image}
                                  width="36"
                                  height="36"
                                  alt="user"
                                />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {session?.user.name}
                              </p>
                              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                {session?.user.email}
                              </p>
                            </div>
                          </div>
                        </MenuItem>
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <a
                              href="#"
                              className={combineClassnames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={() => signOut({ callbackUrl: '/' })}>
                              Sign out
                            </a>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </Menu>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700">
                Setup
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Image
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session?.user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{session?.user.email}</div>
                </div>
                <button
                  type="button"
                  className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 
                    hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <DisclosureButton
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                  Sign out
                </DisclosureButton>
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
