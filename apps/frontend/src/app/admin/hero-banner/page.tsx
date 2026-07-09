import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HeroBannerClient from './HeroBannerClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminHeroBannerTitle'),
    description: t('adminHeroBannerDesc'),
  };
}

export default function AdminHeroBannerPage() {
  return <HeroBannerClient />;
}
