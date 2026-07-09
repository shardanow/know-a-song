import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { ArtistList } from '@/components/artists/ArtistList';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('artistsTitle'),
    description: t('artistsDesc'),
    openGraph: {
      title: t('artistsTitle'),
      description: t('artistsDesc'),
    },
  };
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page } = await searchParams;

  return (
    <AppShell>
      <ArtistList searchQuery={search} pageQuery={page} />
    </AppShell>
  );
}
