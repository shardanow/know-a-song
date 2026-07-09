'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrapData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {children}
    </label>
  );
}

const emptyForm = { slug: '', apiTmdbId: '', apiShikiId: '', tvSeries: false };

export default function FilmsContent() {
  const t = useTranslations('adminFilms');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: result, isLoading, isError, error } = useQuery({
    queryKey: ['admin-films', search, page],
    queryFn: () => api.films.list({ search: search || undefined, page, limit }),
  });

  const films = unwrapData(result);
  const totalPages = result?.totalPages ?? 1;

  const createMutation = useMutation({
    mutationFn: () =>
      api.films.create({
        slug: form.slug,
        apiTmdbId: form.apiTmdbId ? Number(form.apiTmdbId) : null,
        apiShikiId: form.apiShikiId ? Number(form.apiShikiId) : null,
        tvSeries: form.tvSeries,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
      setForm(emptyForm);
      setShowAdd(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.films.update(editingId!, {
        slug: form.slug,
        apiTmdbId: form.apiTmdbId ? Number(form.apiTmdbId) : null,
        apiShikiId: form.apiShikiId ? Number(form.apiShikiId) : null,
        tvSeries: form.tvSeries,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.films.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
      setDeleteConfirmId(null);
    },
  });

  const startEdit = (film: any) => {
    setEditingId(film.id);
    setShowAdd(false);
    setForm({
      slug: film.slug,
      apiTmdbId: film.apiTmdbId?.toString() || '',
      apiShikiId: film.apiShikiId?.toString() || '',
      tvSeries: film.tvSeries,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  if (isError) return <p className="text-red-500">Failed to load films: {(error as Error).message}</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-60">
              <SearchInput value={search} onChange={handleSearch} placeholder={t('searchPlaceholder')} />
            </div>
            <Button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm(emptyForm); }}>
              {showAdd ? t('cancel') : t('addFilm')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAdd && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 rounded-lg bg-bg-elevated/50 border border-border">
              <h3 className="text-sm font-semibold text-text-primary">{t('newFilm')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('slug')}>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={t('slugPlaceholder')} required />
                </Field>
                <div className="flex items-end gap-2">
                  <Field label={t('tvSeries')}>
                    <input
                      type="checkbox"
                      checked={form.tvSeries}
                      onChange={(e) => setForm({ ...form, tvSeries: e.target.checked })}
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('tmdbId')}>
                  <Input type="number" value={form.apiTmdbId} onChange={(e) => setForm({ ...form, apiTmdbId: e.target.value })} placeholder={t('optional')} />
                </Field>
                <Field label={t('shikiId')}>
                  <Input type="number" value={form.apiShikiId} onChange={(e) => setForm({ ...form, apiShikiId: e.target.value })} placeholder={t('optional')} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('creating') : t('create')}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setForm(emptyForm); }}>
                  {t('cancel')}
                </Button>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-red-500">{t('failedCreate')}: {(createMutation.error as Error).message}</p>
              )}
            </form>
          )}

          {isLoading ? (
            <p className="text-text-secondary">{t('loading')}</p>
          ) : !films || films.length === 0 ? (
            <p className="text-text-secondary">{t('noneFound')}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="text-left py-2">{t('id')}</th>
                    <th className="text-left py-2">{t('slug')}</th>
                    <th className="text-left py-2">{t('tmdbId')}</th>
                    <th className="text-left py-2">{t('shikiId')}</th>
                    <th className="text-left py-2">{t('type')}</th>
                    <th className="text-right py-2">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {films.map((film: any) => (
                    <tr key={film.id} className="border-b border-border/50">
                      {editingId === film.id ? (
                        <td colSpan={6} className="py-3">
                          <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg bg-bg-elevated/50 border border-border">
                            <h3 className="text-sm font-semibold text-text-primary">{t('editFilm')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label={t('slug')}>
                                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                              </Field>
                              <div className="flex items-end gap-2">
                                <Field label={t('tvSeries')}>
                                  <input
                                    type="checkbox"
                                    checked={form.tvSeries}
                                    onChange={(e) => setForm({ ...form, tvSeries: e.target.checked })}
                                    className="h-4 w-4 rounded border-border accent-accent"
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label={t('tmdbId')}>
                                <Input type="number" value={form.apiTmdbId} onChange={(e) => setForm({ ...form, apiTmdbId: e.target.value })} placeholder={t('optional')} />
                              </Field>
                              <Field label={t('shikiId')}>
                                <Input type="number" value={form.apiShikiId} onChange={(e) => setForm({ ...form, apiShikiId: e.target.value })} placeholder={t('optional')} />
                              </Field>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? t('saving') : t('save')}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                                {t('cancel')}
                              </Button>
                            </div>
                            {updateMutation.isError && (
                              <p className="text-sm text-red-500">{t('failedUpdate')}: {(updateMutation.error as Error).message}</p>
                            )}
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="py-2">{film.id}</td>
                          <td className="py-2 font-medium">{film.slug}</td>
                          <td className="py-2 font-mono text-xs">{film.apiTmdbId ?? '—'}</td>
                          <td className="py-2 font-mono text-xs">{film.apiShikiId ?? '—'}</td>
                          <td className="py-2">{film.tvSeries ? t('tvSeries') : t('movie')}</td>
                          <td className="py-2 text-right space-x-1">
                            <Button variant="outline" size="xs" onClick={() => startEdit(film)}>{t('edit')}</Button>
                            <Button variant="outline" size="xs" onClick={() => router.push(`/admin/songs?filmId=${film.id}`)}>{t('songs')}</Button>
                            {deleteConfirmId === film.id ? (
                              <span className="inline-flex gap-1 ml-1">
                                <Button variant="destructive" size="xs" onClick={() => deleteMutation.mutate(film.id)} disabled={deleteMutation.isPending}>
                                  {t('confirm')}
                                </Button>
                                <Button variant="outline" size="xs" onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
                              </span>
                            ) : (
                              <Button variant="destructive" size="xs" onClick={() => setDeleteConfirmId(film.id)}>{t('delete')}</Button>
                            )}
                          </td>
                        </>
                      )}
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
