import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('loginTitle'),
    description: t('loginDesc'),
    openGraph: {
      title: t('loginTitle'),
      description: t('loginDesc'),
    },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
