import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { id: number; username: string } | null;
  setAuth: (token: string, user: { id: number; username: string }) => void;
  logout: () => void;
}

function decodeToken(token: string): { sub: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export { decodeToken };

function getInitialState(): { token: string | null; user: { id: number; username: string } | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { token: parsed.token || null, user: parsed.user || null };
    }
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
      const payload = decodeToken(legacyToken);
      return { token: legacyToken, user: { id: payload?.sub || 0, username: '' } };
    }
  } catch {}
  return { token: null, user: null };
}

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  setAuth: (token, user) => {
    localStorage.setItem('auth-storage', JSON.stringify({ token, user }));
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
