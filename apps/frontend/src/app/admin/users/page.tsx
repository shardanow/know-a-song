import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import UsersClient from './UsersClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('adminUsersTitle'),
    description: t('adminUsersDesc'),
  };
}

export default function AdminUsersPage() {
  return <UsersClient />;
}
