import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import SettingsPageClient from './SettingsPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settingsTitle'),
    description: t('settingsDesc'),
    openGraph: {
      title: t('settingsTitle'),
      description: t('settingsDesc'),
    },
  };
}

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-6">
        <SettingsPageClient />
      </div>
    </AppShell>
  );
}
