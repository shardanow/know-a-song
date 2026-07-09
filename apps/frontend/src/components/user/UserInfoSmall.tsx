'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserInfoSmall() {
  const t = useTranslations('common');
  const { user, token, logout } = useAuthStore();

  if (!token) {
    return (
      <div className="border-t border-border pt-[18px] flex flex-col gap-3">
        <Link
          href="/login"
          className="text-[13px] text-text-muted hover:text-text-primary transition-colors text-center"
        >
          {t('login')}
        </Link>
        <Link
          href="/register"
          className="text-[13px] text-accent hover:text-accent-2 transition-colors text-center"
        >
          {t('register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-[18px]">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 w-full">
          <div className="w-[46px] h-[46px] rounded-full grid place-items-center border border-border bg-bg-surface text-xl shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <strong className="block text-[15px] text-text-primary truncate">{user?.username || 'User'}</strong>
            <span className="text-[13px] text-text-muted">Admin</span>
          </div>
          <span className="text-text-secondary text-[25px] leading-none ml-auto">›</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => window.location.href = '/favorites'}>
            {t('favorites')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
            {t('settings')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>{t('signOut')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
