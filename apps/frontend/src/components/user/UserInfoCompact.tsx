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

export function UserInfoCompact() {
  const t = useTranslations('common');
  const { user, token, logout } = useAuthStore();

  if (!token) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/login"
          className="h-[34px] px-3 rounded-[8px] text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors inline-flex items-center"
        >
          {t('login')}
        </Link>
        <Link
          href="/register"
          className="h-[34px] px-3 rounded-[8px] text-[13px] text-accent hover:text-accent-2 hover:bg-[rgba(255,70,88,.08)] transition-colors inline-flex items-center"
        >
          {t('register')}
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 shrink-0 h-16 px-1 hover:bg-bg-elevated/50 transition-colors">
        <div className="w-[34px] h-[34px] rounded-full grid place-items-center border border-border bg-bg-surface text-sm shrink-0">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-sm font-medium text-text-primary truncate">{user?.username || 'User'}</p>
          <p className="text-xs text-text-muted">Admin</p>
        </div>
        <DropdownMenuItem onClick={() => window.location.href = '/favorites'}>
          {t('favorites')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
          {t('settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>{t('signOut')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
