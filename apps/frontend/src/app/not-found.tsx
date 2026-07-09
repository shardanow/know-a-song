import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <h2 className="text-xl text-text-primary">{t('notFound')}</h2>
      <p className="text-text-secondary text-sm">{t('notFoundDesc')}</p>
      <Link href="/" className="text-accent hover:underline text-sm mt-4">
        {t('goHome')}
      </Link>
    </div>
  );
}
