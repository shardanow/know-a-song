import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('homeTitle'),
    description: t('homeDesc'),
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDesc'),
    },
  };
}

export default function Home() {
  return (
    <AppShell>
      <div />
    </AppShell>
  );
}
