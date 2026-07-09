'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export function AdminDashboardContent() {
  const t = useTranslations('admin');

  const sections = [
    { href: '/admin/users', label: t('users'), desc: t('manageUsers') },
    { href: '/admin/roles', label: t('roles'), desc: t('viewRoles') },
    { href: '/admin/films', label: t('films'), desc: t('addEditFilms') },
    { href: '/admin/songs', label: t('songs'), desc: t('manageSongs') },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-text-secondary">{t('selectSection')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block p-5 rounded-xl bg-bg-surface border border-border hover:bg-bg-elevated/50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-text-primary">{s.label}</h2>
            <p className="text-sm text-text-secondary mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
