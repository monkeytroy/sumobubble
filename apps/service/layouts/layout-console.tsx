import { ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';
import Footer from '@/src/components/footer';
import Nav from '@/src/components/nav';
import NavSide from '@/src/components/console/nav-side';
import AppScript from '@/src/components/app-script';

export default function Layout({ siteId, children }: { siteId: string; children: ReactElement }) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed w-full left-0 z-50">
        <Nav></Nav>
      </div>
      <div className="fixed min-h-screen w-48 md:w-64 overflow-hidden ">
        <NavSide></NavSide>
      </div>

      <div className="flex flex-col grow ml-48 md:ml-60 mt-16 px-6 overflow-hidden">
        <ToastContainer />
        <AppScript site={siteId} preview={true} />
        <div className="min-h-screen max-w-full overflow-hidden px-4">
          <main>{children}</main>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}
