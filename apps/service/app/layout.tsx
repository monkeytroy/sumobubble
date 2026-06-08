import type { Metadata } from 'next';
import Script from 'next/script';
import { ReactNode } from 'react';
import Providers from './providers';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import '@/styles/summary.scss';

export const metadata: Metadata = {
  title: 'SumoBubble',
  description:
    'Welcome. SumoBubble is a powerful and easy to use helper for your website providing AI Q&A and simple summary details to your visitors.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Script src="https://js.stripe.com/v3/pricing-table.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
