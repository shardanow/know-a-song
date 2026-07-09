'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrapData } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function UsersContent() {
  const t = useTranslations('adminUsers');
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: result, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => api.users.list({ search: search || undefined, page, limit }),
    enabled: !!token,
  });

  const users = unwrapData(result);
  const totalPages = result?.totalPages ?? 1;

  const { data: userTypesResult } = useQuery({
    queryKey: ['admin-user-types'],
    queryFn: () => api.userTypes.list(),
    enabled: !!token,
  });

  const userTypes = unwrapData(userTypesResult);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`${API}/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const adminType = (userTypes as any[])?.find((t: any) => t.title === 'Admin');
      if (!adminType) throw new Error('Admin role not found');
      await fetch(`${API}/user/type/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type_id: adminType.id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  if (!token) return <p className="text-text-secondary">{t('signInRequired')}</p>;
  if (isError) return <p className="text-red-500">Failed to load users: {(error as Error).message}</p>;

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
          ) : !users || users.length === 0 ? (
            <p className="text-text-secondary">{t('noneFound')}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="text-left py-2">{t('id')}</th>
                    <th className="text-left py-2">{t('username')}</th>
                    <th className="text-left py-2">{t('email')}</th>
                    <th className="text-left py-2">{t('role')}</th>
                    <th className="text-right py-2">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-border/50">
                      <td className="py-2">{user.id}</td>
                      <td className="py-2">{user.username}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.userType}</td>
                      <td className="py-2 text-right space-x-1">
                        {user.userType !== 'Admin' && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => makeAdminMutation.mutate(user.id)}
                            disabled={makeAdminMutation.isPending}
                          >
                            {t('makeAdmin')}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => deleteMutation.mutate(user.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {t('delete')}
                        </Button>
                      </td>
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
