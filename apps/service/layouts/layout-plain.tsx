import { ReactElement } from 'react';
import Footer from '@/src/components/footer';
import Nav from '@/src/components/nav';

export default function LayoutPlain({ children }: { children: ReactElement }) {
  return (
    <div className="flex flex-col min-h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="fixed w-full left-0 z-50">
        <Nav></Nav>
      </div>

      <div className="grow">
        <main>{children}</main>
      </div>

      <Footer></Footer>
    </div>
  );
}
