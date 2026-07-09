'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface SuggestionsTabProps {
  filmId: number;
}

export function SuggestionsTab({ filmId }: SuggestionsTabProps) {
  const t = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState('');
  const [link, setLink] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['suggestions', filmId],
    queryFn: () => api.suggestions.byFilm(filmId),
  });

  const createMutation = useMutation({
    mutationFn: () => api.suggestions.create({ filmId, title, author, type: type || undefined, link: link || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions', filmId] });
      setShowForm(false);
      setTitle('');
      setAuthor('');
      setType('');
      setLink('');
    },
  });

  const suggestions = Array.isArray(data) ? data : data?.data ?? [];

  const statusLabel = (status: string) => {
    switch (status) {
      case 'approved': return t('approved');
      case 'rejected': return t('rejected');
      default: return t('pending');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{t('suggestions')}</h2>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-[40px] px-3 rounded-[9px] border border-border bg-bg-elevated text-text-secondary font-semibold text-[14px] cursor-pointer"
          >
            {showForm ? t('cancel') : t('suggestSong')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 rounded-[10px] bg-bg-elevated border border-border space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('songName')}
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-[14px] outline-0 focus:border-accent"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t('artist')}
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-[14px] outline-0 focus:border-accent"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-[14px] outline-0 focus:border-accent"
          >
            <option value="">{t('type')}</option>
            <option value="OP">Opening</option>
            <option value="ED">Ending</option>
            <option value="OST">OST</option>
          </select>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={t('link')}
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-[14px] outline-0 focus:border-accent"
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={!title || !author || createMutation.isPending}
            className="px-4 py-2 rounded-lg bg-accent text-white font-bold text-[14px] disabled:opacity-50 cursor-pointer"
          >
            {createMutation.isPending ? t('sending') : t('send')}
          </button>
        </div>
      )}

      {isLoading && <div className="text-text-secondary">{t('loading')}</div>}

      {suggestions.length === 0 && !isLoading && (
        <div className="text-text-secondary">{t('noSuggestions')}</div>
      )}

      <div className="space-y-2">
        {suggestions.map((s: any) => (
          <div
            key={s.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-elevated border border-border"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] truncate">{s.title}</div>
              <div className="text-text-muted text-[13px]">{s.author}</div>
            </div>
            {s.type && (
              <span className="text-text-muted border border-border rounded-[7px] px-[9px] py-[3px] text-[12px] font-semibold">
                {s.type}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[12px] font-bold ${
              s.status === 'approved' ? 'bg-green/20 text-green' :
              s.status === 'rejected' ? 'bg-accent/20 text-accent' :
              'bg-bg-overlay text-text-muted'
            }`}>
              {statusLabel(s.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
