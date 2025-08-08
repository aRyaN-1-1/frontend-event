import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, setTokens, getRefreshToken } from '@/lib/api';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string; phone?: string }) => Promise<{ error: any } | void>;
  signIn: (email: string, password: string) => Promise<{ error: any } | void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Attempt to load current user from backend using stored access token
    (async () => {
      try {
        const me = await apiFetch<{ user: any; roles: string[] }>(`/auth/me`);
        setUser(me.user);
        setIsAdmin((me.roles || []).includes('admin'));
      } catch {
        // Try refresh
        const refresh = getRefreshToken();
        if (refresh) {
          try {
            const result = await apiFetch<{ user: any; session: { access_token: string; refresh_token?: string } }>(`/auth/refresh`, { method: 'POST', body: { refresh_token: refresh }, auth: false });
            setTokens(result.session.access_token, result.session.refresh_token ?? refresh);
            const me = await apiFetch<{ user: any; roles: string[] }>(`/auth/me`);
            setUser(me.user);
            setIsAdmin((me.roles || []).includes('admin'));
          } catch {
            setTokens(null, null);
            setUser(null);
            setIsAdmin(false);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Admin flag comes from /auth/me; separate endpoint if needed later

  const signUp = async (email: string, password: string, metadata?: { name?: string; phone?: string }) => {
    await apiFetch(`/auth/signup`, { method: 'POST', body: { email, password, ...metadata }, auth: false });
  };

  const signIn = async (email: string, password: string) => {
    const result = await apiFetch<{ user: any; session: { access_token: string; refresh_token?: string } }>(`/auth/signin`, {
      method: 'POST',
      body: { email, password },
      auth: false
    });
    setTokens(result.session.access_token, result.session.refresh_token);
    setUser(result.user);
    // Fetch roles
    try {
      const me = await apiFetch<{ user: any; roles: string[] }>(`/auth/me`);
      setIsAdmin((me.roles || []).includes('admin'));
    } catch {}
  };

  const signOut = async () => {
    try { await apiFetch(`/auth/signout`, { method: 'POST' }); } catch {}
    setTokens(null, null);
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}