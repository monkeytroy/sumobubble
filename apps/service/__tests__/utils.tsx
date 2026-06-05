import LayoutPlain from '@/layouts/layout-plain';
import { SessionProvider } from 'next-auth/react';
import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Session } from 'next-auth';
import { IAppProps } from '@/src/services/types';

interface PageOptions {
  session?: Session;
}

export const customRender = (ui: ReactElement, { session }: PageOptions) => {
  return render(
    <SessionProvider session={session}>
      <LayoutPlain>{ui}</LayoutPlain>
    </SessionProvider>
  );
};
