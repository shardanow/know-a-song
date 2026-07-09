import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('suggestionsTitle') || 'Suggestions — Know A Song',
    description: t('suggestionsDesc') || 'Song suggestions',
  };
}

export default function SuggestionsPage() {
  return (
    <AppShell>
      <p className="text-text-secondary p-6">Suggestions are shown per-film on the film detail page.</p>
    </AppShell>
  );
}
