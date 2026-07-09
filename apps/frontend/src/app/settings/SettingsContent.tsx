'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsContent() {
  const ts = useTranslations('settings');
  const tc = useTranslations('common');
  const { user, token, logout: clearAuth } = useAuthStore();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {});
    localStorage.removeItem('token');
    clearAuth();
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.auth.changePassword(currentPassword, newPassword);
      setMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err?.message || ts('failedChangePassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ts('title')}</CardTitle>
        <CardDescription>{ts('desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {token ? (
          <>
            <p className="text-sm text-text-secondary">
              {ts('signedInAs', { username: user?.username || '' })}
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">{ts('changePassword')}</h3>
              {message && <p className="text-sm text-green-500">{message}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Input
                type="password"
                placeholder={ts('currentPassword')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder={ts('newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
              />
              <Button type="submit" disabled={loading}>
                {loading ? ts('updating') : ts('updatePassword')}
              </Button>
            </form>

            <hr className="border-border" />

            <Button variant="outline" onClick={handleLogout}>
              {tc('signOut')}
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">{ts('notSignedIn')}</p>
            <Button onClick={() => router.push('/login')}>{tc('login')}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
