import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RolesClient from './RolesClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminRolesTitle'),
    description: t('adminRolesDesc'),
  };
}

export default function AdminRolesPage() {
  return <RolesClient />;
}
