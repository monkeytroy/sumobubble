import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import Footer from '@/src/components/footer';
import Nav from '@/src/components/nav';
import SiteNavSide from '@/src/components/console/site-nav-side';
import AppScript from '@/src/components/app-script';
import StoreHydrator from '@/src/components/console/store-hydrator';
import { loadSiteData } from '@/src/services/server-page-data';

export default async function ConsoleSiteLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const data = await loadSiteData(siteId);
  if (!data) redirect('/console');

  return (
    <StoreHydrator customer={data.customer} site={data.site}>
      <div className="flex min-h-screen">
        <div className="fixed w-full left-0 z-50">
          <Nav />
        </div>
        <div className="fixed min-h-screen w-48 md:w-64 overflow-hidden">
          <SiteNavSide />
        </div>

        <div className="flex flex-col grow ml-48 md:ml-60 mt-16 px-6 overflow-hidden">
          <ToastContainer />
          <AppScript site={siteId} preview={true} />
          <div className="min-h-screen max-w-full overflow-hidden px-4">
            <main>{children}</main>
          </div>
          <Footer />
        </div>
      </div>
    </StoreHydrator>
  );
}
