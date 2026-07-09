import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SongsClient from './SongsClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminSongsTitle'),
    description: t('adminSongsDesc'),
  };
}

export default function AdminSongsPage() {
  return <SongsClient />;
}
