import { redirect } from 'next/navigation';
import SectionRenderer from '@/src/components/console/section-renderer';
import { loadSiteData } from '@/src/services/server-page-data';

export default async function SectionPage({
  params
}: {
  params: Promise<{ siteId: string; section: string }>;
}) {
  const { siteId, section } = await params;
  const data = await loadSiteData(siteId);
  if (!data) redirect('/console');

  return <SectionRenderer section={section} stripe={data.stripe} />;
}
