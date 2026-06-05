import type { NextComponentType, NextPageContext, NextLayoutComponentType } from 'next';
import type { AppProps } from 'next/app';
import { DefaultSession, DefaultUser } from 'next-auth';

declare global {
  interface Window {
    onPreviewUpdate: any;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sumobubble-wc': any; //React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'stripe-pricing-table': any; //React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare module 'next-auth' {
  interface Session {
    user: DefaultUser;
  }
}
