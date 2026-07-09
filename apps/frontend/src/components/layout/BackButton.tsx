import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ href = '/films' }: { href?: string }) {
  const t = useTranslations('common');
  return (
    <Link
      href={href}
      className="h-[46px] px-[18px] rounded-[8px] border border-border bg-bg-surface text-text-primary text-[16px] flex items-center gap-[10px] cursor-pointer hover:bg-bg-overlay transition-colors"
    >
      <ArrowLeft size={22} strokeWidth={1.9} />
      {t('back')}
    </Link>
  );
}
