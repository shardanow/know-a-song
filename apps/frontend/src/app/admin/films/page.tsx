import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FilmsClient from './FilmsClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminFilmsTitle'),
    description: t('adminFilmsDesc'),
  };
}

export default function AdminFilmsPage() {
  return <FilmsClient />;
}
