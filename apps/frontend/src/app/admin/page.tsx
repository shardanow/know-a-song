import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminTitle'),
    description: t('adminDesc'),
    openGraph: {
      title: t('adminTitle'),
      description: t('adminDesc'),
    },
  };
}

export default function AdminPage() {
  return <AdminDashboardContent />;
}
