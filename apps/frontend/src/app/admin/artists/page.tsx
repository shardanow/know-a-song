import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ArtistsClient from './ArtistsClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminArtistsTitle') || 'Manage Artists — Know A Song',
    description: t('adminArtistsDesc') || 'Create and manage artists',
  };
}

export default function ArtistsPage() {
  return <ArtistsClient />;
}
