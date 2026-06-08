import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import Footer from '@/src/components/footer';
import Nav from '@/src/components/nav';
import AccountNavSide from '@/src/components/console/account-nav-side';

export default function ConsoleAccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed w-full left-0 z-50">
        <Nav />
      </div>
      <div className="fixed min-h-screen w-48 md:w-64 overflow-hidden">
        <AccountNavSide />
      </div>

      <div className="flex flex-col grow ml-48 md:ml-60 mt-16 px-6 overflow-hidden">
        <ToastContainer />
        <div className="min-h-screen max-w-full overflow-hidden px-4">
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
