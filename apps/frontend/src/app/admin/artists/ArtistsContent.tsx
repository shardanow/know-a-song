'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ArtistsContent() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);

  const load = () => {
    setLoading(true);
    api.artists.dbList({ search: search || undefined, page, limit: 20 })
      .then((res: any) => {
        setArtists(res.data || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const searchTmdb = async () => {
    if (!tmdbQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await apiClient.searchPerson(tmdbQuery);
      setTmdbResults(res.results || []);
    } catch { setTmdbResults([]); }
    setTmdbSearching(false);
  };

  const createFromTmdb = async (person: any) => {
    try {
      await api.artists.create({ name: person.name, tmdbPersonId: person.id });
      setShowCreate(false);
      setTmdbQuery('');
      setTmdbResults([]);
      load();
    } catch {}
  };

  const deleteArtist = async (id: number) => {
    if (!confirm('Delete this artist?')) return;
    try {
      await api.artists.delete(id);
      load();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('artists')}</h1>
        <Button onClick={() => setShowCreate(true)}>{t('addArtist')}</Button>
      </div>

      <div className="mb-4 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder={tc('search')} />
      </div>

      {loading && <div className="text-text-secondary">{tc('loading')}</div>}

      {!loading && artists.length === 0 && (
        <div className="text-text-secondary">{tc('noData')}</div>
      )}

      {!loading && artists.length > 0 && (
        <>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-surface border-b border-border text-left">
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Photo</th>
                  <th className="p-3 font-semibold">{tc('name')}</th>
                  <th className="p-3 font-semibold">TMDB ID</th>
                  <th className="p-3 font-semibold">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist: any) => (
                  <tr key={artist.id} className="border-b border-border last:border-0 hover:bg-bg-surface/50">
                    <td className="p-3 text-text-secondary">{artist.id}</td>
                    <td className="p-3">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold">
                          {artist.name?.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{artist.name}</td>
                    <td className="p-3 text-text-secondary">{artist.tmdbPersonId || '-'}</td>
                    <td className="p-3">
                      <Button variant="destructive" size="xs" onClick={() => deleteArtist(artist.id)}>
                        {tc('delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addArtist')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                placeholder={t('searchTmdb')}
                onKeyDown={(e) => e.key === 'Enter' && searchTmdb()}
              />
              <Button onClick={searchTmdb} disabled={tmdbSearching}>
                {tc('search')}
              </Button>
            </div>

            {tmdbSearching && <div className="text-text-secondary">{tc('loading')}</div>}

            {tmdbResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {tmdbResults.slice(0, 10).map((person: any) => (
                  <button
                    key={person.id}
                    onClick={() => createFromTmdb(person)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-surface transition-colors text-left cursor-pointer"
                  >
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-bold">
                        {person.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{person.name}</div>
                      <div className="text-xs text-text-secondary">
                        {person.known_for_department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tmdbResults.length === 0 && tmdbQuery && !tmdbSearching && (
              <div className="text-text-secondary">{tc('noData')}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
