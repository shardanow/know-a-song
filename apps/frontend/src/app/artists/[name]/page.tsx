import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { ArtistDetail } from '@/components/artists/ArtistDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const t = await getTranslations('metadata');
  return {
    title: `${decodeURIComponent(name)} — ${t('artistsTitle')}`,
    description: t('artistsDesc'),
  };
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { name } = await params;
  const { page } = await searchParams;

  return (
    <AppShell>
      <ArtistDetail name={decodeURIComponent(name)} pageQuery={page} />
    </AppShell>
  );
}
