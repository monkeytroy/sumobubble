import { SessionProvider } from 'next-auth/react';
import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Session } from 'next-auth';

interface PageOptions {
  session?: Session;
}

const TestShell = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col min-h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <main>{children}</main>
  </div>
);

export const customRender = (ui: ReactElement, { session }: PageOptions) => {
  return render(
    <SessionProvider session={session}>
      <TestShell>{ui}</TestShell>
    </SessionProvider>
  );
};
