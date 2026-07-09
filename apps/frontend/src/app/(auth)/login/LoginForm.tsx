'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import { api } from '@/lib/api';
import { useAuthStore, decodeToken } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const t = useTranslations('auth');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(username, password);
      const payload = decodeToken(res.accessToken);
      setAuth(res.accessToken, { id: payload?.sub || 0, username });
      router.push('/');
    } catch (err) {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('signIn')}</CardTitle>
        <CardDescription>{t('signInDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Input
            type="text"
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </Button>
          <p className="text-sm text-center text-text-secondary">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-accent hover:underline">
              {t('register')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
