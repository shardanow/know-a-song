'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { api, unwrapData } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';
import { Tooltip } from '@/components/Tooltip';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {children}
    </label>
  );
}

const LIMIT = 20;

export default function SongsContent() {
  const t = useTranslations('adminSongs');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [filmResults, setFilmResults] = useState<any[]>([]);
  const [filmSearchLoading, setFilmSearchLoading] = useState(false);

  const [selectedFilm, setSelectedFilm] = useState<any | null>(null);

  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingSongId, setEditingSongId] = useState<number | null>(null);

  const [songSearch, setSongSearch] = useState('');
  const [songPage, setSongPage] = useState(1);

  const [filmSearchQuery, setFilmSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filmDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [artistId, setArtistId] = useState<number | null>(null);
  const [artistSearch, setArtistSearch] = useState('');
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const artistDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [season, setSeason] = useState('0');
  const [episode, setEpisode] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [spotifyId, setSpotifyId] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [appleMId, setAppleMId] = useState('');
  const [appleMLink, setAppleMLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const headers = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const loadFilms = useCallback((q: string) => {
    setFilmSearchLoading(true);
    api.films.list({ search: q || undefined, limit: 20 })
      .then((data: any) => {
        setFilmResults(unwrapData(data));
        setFilmSearchLoading(false);
      })
      .catch(() => setFilmSearchLoading(false));
  }, []);

  const loadArtists = useCallback((q: string) => {
    if (!q.trim()) { setArtistResults([]); return; }
    api.artists.dbList({ search: q, limit: 10 })
      .then((res: any) => setArtistResults(res.data || []))
      .catch(() => setArtistResults([]));
  }, []);

  useEffect(() => {
    loadFilms('');
  }, [loadFilms]);

  useEffect(() => {
    if (filmDebounceRef.current) clearTimeout(filmDebounceRef.current);
    filmDebounceRef.current = setTimeout(() => {
      loadFilms(filmSearchQuery);
    }, 300);
    return () => { if (filmDebounceRef.current) clearTimeout(filmDebounceRef.current); };
  }, [filmSearchQuery, loadFilms]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filmId = params.get('filmId');
    if (filmId) {
      const id = Number(filmId);
      api.films.byId(id).then((data: any) => {
        const film = Array.isArray(data) ? data[0] : data;
        if (film) {
          setFilmSearchQuery(film.slug);
          setSelectedFilm(film);
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!selectedFilm?.id) return;
    loadSongs();
  }, [selectedFilm?.id, songPage, songSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectFilm = (film: any) => {
    setFilmSearchQuery(film.slug);
    setShowDropdown(false);
    setSongSearch('');
    setSongPage(1);
    setSelectedFilm(film);
  };

  const handleClearFilm = () => {
    setSelectedFilm(null);
    setFilmSearchQuery('');
    setSongs([]);
    setSongSearch('');
  };

  const loadSongs = () => {
    setLoading(true);
    api.songs.byFilm(selectedFilm!.id, {
      search: songSearch || undefined,
      page: songPage,
      limit: LIMIT,
    })
      .then((data: any) => {
        setSongs(unwrapData(data));
        setTotalPages(data.totalPages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSongSearch = (q: string) => {
    setSongSearch(q);
    setSongPage(1);
  };

  const startEdit = (s: any) => {
    setEditingSongId(s.id);
    setTitle(s.title);
    setAuthor(s.author);
    setArtistId(s.artistId ?? null);
    setArtistSearch(s.artistName || '');
    setSeason(String(s.season ?? '0'));
    setEpisode(s.episode ? String(s.episode) : '');
    setIsOpening(s.isOpening);
    setIsEnding(s.isEnding);
    setStartTime(s.startTime ? String(s.startTime) : '');
    setYoutubeId(s.youtubeId || '');
    setYoutubeLink(s.youtubeLink || '');
    setSpotifyId(s.spotifyId || '');
    setSpotifyLink(s.spotifyLink || '');
    setAppleMId(s.appleMId || '');
    setAppleMLink(s.appleMLink || '');
    setSubmitMessage(null);
  };

  const cancelEdit = () => {
    setEditingSongId(null);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setArtistId(null);
    setArtistSearch('');
    setSeason('0');
    setEpisode('');
    setIsOpening(false);
    setIsEnding(false);
    setStartTime('');
    setYoutubeId('');
    setYoutubeLink('');
    setSpotifyId('');
    setSpotifyLink('');
    setAppleMId('');
    setAppleMLink('');
    setSubmitMessage(null);
    setEditingSongId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilm?.id || !title || !author || !user) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      if (editingSongId) {
        const res = await fetch(`${API}/song/${editingSongId}`, {
          method: 'PUT', headers: headers(),
          body: JSON.stringify({ title, author, artistId, season: Number(season), isOpening, isEnding, startTime: startTime ? Number(startTime) : null }),
        });
        if (!res.ok) throw new Error('Failed to update');

        if (episode) {
          await fetch(`${API}/song/${editingSongId}/episode`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ season: Number(season), episode: Number(episode) }),
          }).catch(() => {});
        }

        if (youtubeId || youtubeLink || spotifyId || spotifyLink || appleMId || appleMLink) {
          const sourceRes = await fetch(`${API}/song_source/${editingSongId}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ youtubeId, youtubeLink, spotifyId, spotifyLink, appleMId, appleMLink }),
          });
          const updatedSources = await sourceRes.json();
          if (updatedSources.length === 0) {
            await fetch(`${API}/song_source/${editingSongId}`, {
              method: 'POST', headers: headers(),
              body: JSON.stringify({ ownerId: user.id, youtubeId, youtubeLink, spotifyId, spotifyLink, appleMId, appleMLink }),
            });
          }
        }

        setSubmitMessage({ type: 'success', text: t('updatedSuccess') });
      } else {
        const res = await fetch(`${API}/song`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({ ownerId: user.id, filmId: selectedFilm.id, title, author, artistId, season: Number(season), isOpening, isEnding, startTime: startTime ? Number(startTime) : null }),
        });
        if (!res.ok) throw new Error('Failed');
        const [song] = await res.json();

        if (youtubeId || youtubeLink || spotifyId || spotifyLink || appleMId || appleMLink) {
          await fetch(`${API}/song_source/${song.id}`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ ownerId: user.id, youtubeId, youtubeLink, spotifyId, spotifyLink, appleMId, appleMLink }),
          });
        }

        if (episode) {
          await fetch(`${API}/song/${song.id}/episode`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ season: Number(season), episode: Number(episode) }),
          }).catch(() => {});
        }

        setSubmitMessage({ type: 'success', text: t('addedSuccess') });
      }

      resetForm();
      if (selectedFilm?.id) loadSongs();
    } catch {
      setSubmitMessage({ type: 'error', text: editingSongId ? t('failedUpdate') : t('failedAdd') });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSong = async (id: number) => {
    await fetch(`${API}/song/${id}`, { method: 'DELETE', headers: headers() });
    setDeleteConfirmId(null);
    if (selectedFilm?.id) loadSongs();
  };

  const sectionClass = 'space-y-3 border-t border-border/50 pt-3 first:border-t-0 first:pt-0';
  const sectionTitleClass = 'text-xs font-semibold uppercase tracking-wider text-text-secondary';

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardHeader><CardTitle>{t('title')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label={t('film')}>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 py-1 text-sm text-text-primary transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder={t('searchFilms')}
                  value={filmSearchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => { setFilmSearchQuery(e.target.value); setShowDropdown(true); }}
                />
                {selectedFilm && (
                  <Tooltip text={t('clearSelection')}>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    onClick={handleClearFilm}
                  >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip>
                )}
              </div>
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-bg-surface shadow-lg max-h-60 overflow-y-auto">
                  {filmSearchLoading ? (
                    <div className="px-3 py-2 text-sm text-text-secondary">{t('searching')}</div>
                  ) : filmResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-text-secondary">{t('noFilms')}</div>
                  ) : (
                    filmResults.map((f: any) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-bg-elevated/50 ${
                          f.id === selectedFilm?.id ? 'bg-bg-elevated text-text-primary' : 'text-text-secondary'
                        }`}
                        onClick={() => selectFilm(f)}
                      >
                        <span className="text-text-primary">{f.slug}</span>
                        <span className="ml-2 text-xs text-text-secondary">
                          {f.apiTmdbId && `${t('tmdb')}: ${f.apiTmdbId}`}
                          {f.apiTmdbId && f.apiShikiId && ' · '}
                          {f.apiShikiId && `${t('shiki')}: ${f.apiShikiId}`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </Field>

          {selectedFilm && (
            <div className="w-60">
              <SearchInput value={songSearch} onChange={handleSongSearch} placeholder={t('searchSongs')} />
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-2/3 rounded-lg" />
            </div>
          ) : songs.length > 0 ? (
            <>
              <div className="space-y-1">
                {songs.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-elevated text-sm">
                    <span className="flex-1">{s.title} — {s.author}</span>
                    {s.isOpening && <Badge className="bg-green-700">{t('opening')}</Badge>}
                    {s.isEnding && <Badge className="bg-red-700">{t('ending')}</Badge>}
                    {s.episode ? (
                      <span className="text-xs text-text-secondary">S{s.season} E{s.episode}</span>
                    ) : s.season > 0 ? (
                      <span className="text-xs text-text-secondary">S{s.season}</span>
                    ) : null}
                    {s.startTime != null && (
                      <span className="text-xs font-mono text-text-secondary">{formatTime(s.startTime)}</span>
                    )}
                    <Button variant="outline" size="xs" onClick={() => startEdit(s)}>{t('edit')}</Button>
                    {deleteConfirmId === s.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteSong(s.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">{t('confirm')}</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-text-secondary hover:text-text-primary text-xs">{t('cancel')}</button>
                      </div>
                    ) : (
                      <Button variant="destructive" size="xs" onClick={() => setDeleteConfirmId(s.id)}>{t('delete')}</Button>
                    )}
                  </div>
                ))}
              </div>
              <Pagination page={songPage} totalPages={totalPages} onPageChange={setSongPage} />
            </>
          ) : selectedFilm ? (
            <p className="text-sm text-text-secondary py-2">{t('noSongs')}</p>
          ) : null}
        </CardContent>
      </Card>

      {selectedFilm && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{editingSongId ? t('editSong') : t('addSong')}</CardTitle>
            <div className="flex items-center gap-2">
              {editingSongId && (
                <Button type="button" variant="outline" size="xs" onClick={cancelEdit}>{t('cancel')}</Button>
              )}
              <span className="text-xs text-text-secondary truncate max-w-[200px]">{selectedFilm.slug}</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('songInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('titleField')}>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('titlePlaceholder')} required />
                  </Field>
                  <Field label={t('author')}>
                    <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t('authorPlaceholder')} required />
                  </Field>
                  <Field label="TMDB Artist (optional)">
                    <div className="relative">
                      <Input
                        value={artistSearch}
                        onChange={(e) => {
                          setArtistSearch(e.target.value);
                          if (artistDebounceRef.current) clearTimeout(artistDebounceRef.current);
                          artistDebounceRef.current = setTimeout(() => loadArtists(e.target.value), 300);
                          setShowArtistDropdown(true);
                        }}
                        onFocus={() => setShowArtistDropdown(true)}
                        placeholder="Search linked artists..."
                      />
                      {artistId && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green">✓ Linked</span>
                      )}
                      {showArtistDropdown && artistResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-surface border border-border rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto" onMouseDown={() => setTimeout(() => setShowArtistDropdown(false), 200)}>
                          {artistResults.map((a: any) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setArtistId(a.id);
                                setArtistSearch(a.name);
                                setShowArtistDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-bg-elevated transition-colors cursor-pointer"
                            >
                              {a.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('episodeOptional')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('season')}>
                    <Input type="number" value={season} onChange={(e) => setSeason(e.target.value)} placeholder={t('seasonPlaceholder')} />
                  </Field>
                  <Field label={t('episode')}>
                    <Input type="number" value={episode} onChange={(e) => setEpisode(e.target.value)} placeholder={t('episodePlaceholder')} />
                  </Field>
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('startTimeOptional')}</h4>
                <Field label={t('startTime')}>
                  <Input type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder={t('startTimePlaceholder')} />
                </Field>
                {startTime && <p className="text-xs text-text-secondary">{formatTime(Number(startTime))}</p>}
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('youtubeOptional')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('youtubeId')}>
                    <Input value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)} placeholder={t('youtubeIdPlaceholder')} />
                  </Field>
                  <Field label={t('youtubeLink')}>
                    <Input value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder={t('youtubeLinkPlaceholder')} />
                  </Field>
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('spotifyOptional')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('spotifyId')}>
                    <Input value={spotifyId} onChange={(e) => setSpotifyId(e.target.value)} placeholder={t('spotifyIdPlaceholder')} />
                  </Field>
                  <Field label={t('spotifyLink')}>
                    <Input value={spotifyLink} onChange={(e) => setSpotifyLink(e.target.value)} placeholder={t('spotifyLinkPlaceholder')} />
                  </Field>
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('appleMusicOptional')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('appleMusicId')}>
                    <Input value={appleMId} onChange={(e) => setAppleMId(e.target.value)} placeholder={t('appleMusicIdPlaceholder')} />
                  </Field>
                  <Field label={t('appleMusicLink')}>
                    <Input value={appleMLink} onChange={(e) => setAppleMLink(e.target.value)} placeholder={t('appleMusicLinkPlaceholder')} />
                  </Field>
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className={sectionTitleClass}>{t('typeLabel')}</h4>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOpening}
                      onChange={(e) => setIsOpening(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-accent text-accent focus:ring-accent/30 focus:ring-2"
                    />
                    {t('opening')}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isEnding}
                      onChange={(e) => setIsEnding(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-accent text-accent focus:ring-accent/30 focus:ring-2"
                    />
                    {t('ending')}
                  </label>
                </div>
              </div>

              {submitMessage && (
                <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {submitMessage.text}
                </p>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? t('saving') : editingSongId ? t('saveChanges') : t('addSong')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
