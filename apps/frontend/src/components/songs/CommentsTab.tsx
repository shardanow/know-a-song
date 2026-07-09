'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface CommentsTabProps {
  filmId: number;
}

export function CommentsTab({ filmId }: CommentsTabProps) {
  const t = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', filmId],
    queryFn: () => api.comments.byFilm(filmId),
  });

  const createMutation = useMutation({
    mutationFn: () => api.comments.create(filmId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', filmId] });
      setContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => api.comments.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', filmId] });
    },
  });

  const comments = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">{t('comments')}</h2>

      {user && (
        <div className="mb-6 flex gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('writeComment')}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-[14px] outline-0 focus:border-accent"
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={!content.trim() || createMutation.isPending}
            className="px-4 py-2 rounded-lg bg-accent text-white font-bold text-[14px] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {createMutation.isPending ? '...' : t('send')}
          </button>
        </div>
      )}

      {isLoading && <div className="text-text-secondary">{t('loading')}</div>}

      {comments.length === 0 && !isLoading && (
        <div className="text-text-secondary">{t('noComments')}</div>
      )}

      <div className="space-y-3">
        {comments.map((c: any) => (
          <div
            key={c.id}
            className="p-4 rounded-lg bg-bg-elevated border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[28px] h-[28px] rounded-full bg-bg-overlay grid place-items-center text-[12px] font-bold">
                {(c.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold">{c.username || 'User'}</span>
              <span className="text-[12px] text-text-muted ml-auto">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
              </span>
              {user && c.ownerId === user.id && (
                <button
                  onClick={() => deleteMutation.mutate(c.id)}
                  className="text-text-muted hover:text-accent text-[12px] cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
            <p className="text-[14px] leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
