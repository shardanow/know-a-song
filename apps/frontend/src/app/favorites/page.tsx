import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import FavoritesContent from './FavoritesContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('favoritesTitle'),
    description: t('favoritesDesc'),
    openGraph: {
      title: t('favoritesTitle'),
      description: t('favoritesDesc'),
    },
  };
}

export default function FavoritesPage() {
  return (
    <AppShell>
      <FavoritesContent />
    </AppShell>
  );
}
