'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api, unwrapData } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';

export default function RolesContent() {
  const t = useTranslations('adminRoles');
  const token = useAuthStore((s) => s.token);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: result, isLoading, isError, error } = useQuery({
    queryKey: ['admin-roles', search, page],
    queryFn: () => api.userTypes.list({ search: search || undefined, page, limit }),
    enabled: !!token,
  });

  const roles = unwrapData(result);
  const totalPages = result?.totalPages ?? 1;

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  if (!token) return <p className="text-text-secondary">{t('signInRequired')}</p>;
  if (isError) return <p className="text-red-500">Failed to load roles: {(error as Error).message}</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <div className="w-60">
            <SearchInput value={search} onChange={handleSearch} placeholder={t('searchPlaceholder')} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-text-secondary">{t('loading')}</p>
          ) : !roles || roles.length === 0 ? (
            <p className="text-text-secondary">{t('noneFound')}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="text-left py-2">{t('id')}</th>
                    <th className="text-left py-2">{t('titleField')}</th>
                    <th className="text-left py-2">{t('rights')}</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role: any) => (
                    <tr key={role.id} className="border-b border-border/50">
                      <td className="py-2">{role.id}</td>
                      <td className="py-2">{role.title}</td>
                      <td className="py-2 font-mono text-xs">{role.rights}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
