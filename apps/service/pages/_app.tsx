import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LayoutPlain from '@/layouts/layout-plain';
import LayoutConsole from '@/layouts/layout-console';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import '@/styles/summary.scss';

/**
 * Module only types
 */

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const ThisLayoutPlain = (page: ReactElement) => {
  return <LayoutPlain>{page}</LayoutPlain>;
};

const ThisLayoutConsole = (page: ReactElement) => {
  const router = useRouter();
  const siteId = Array.isArray(router.query.siteId) ? router.query.siteId[0] : router.query.siteId;
  return <LayoutConsole siteId={siteId || ''}>{page}</LayoutConsole>;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const router = useRouter();

  const getLayout = Component.getLayout || (router.route.startsWith('/console') ? ThisLayoutConsole : ThisLayoutPlain);

  return (
    <>
      <Head>
        <title>SumoBubble</title>
        <meta
          name="description"
          content="Welcome. SumoBubble is a powerful and easy to use helper for your website providing AI Q&A and simple summary details to your visitors."
        />
      </Head>
      <SessionProvider session={pageProps.session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>
    </>
  );
};

export default App;
