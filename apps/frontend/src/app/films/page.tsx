import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { FilmList } from '@/components/films/FilmList';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('filmsTitle'),
    description: t('filmsDesc'),
    openGraph: {
      title: t('filmsTitle'),
      description: t('filmsDesc'),
    },
  };
}

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  return (
    <AppShell mainClassName="px-[48px]">
      <FilmList searchQuery={search} />
    </AppShell>
  );
}
