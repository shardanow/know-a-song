import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { SongsContent } from '@/components/songs/SongsContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('songsTitle'),
    description: t('songsDesc'),
    openGraph: {
      title: t('songsTitle'),
      description: t('songsDesc'),
    },
  };
}

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { q, type, page } = await searchParams;

  return (
    <AppShell>
      <SongsContent q={q} type={type} pageQuery={page} />
    </AppShell>
  );
}
