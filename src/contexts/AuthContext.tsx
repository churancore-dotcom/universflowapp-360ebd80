import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isOffline: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin?: boolean }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => checkAdminStatus(session.user.id), 0);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const ensureShareCode = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('share_code')
        .eq('user_id', userId)
        .single();

      if (profile && !profile.share_code) {
        const code = Math.random().toString(36).substring(2, 10);
        await supabase.from('profiles').update({ share_code: code }).eq('user_id', userId);
      }
    } catch {
      // non-blocking
    }
  };

  const resolveAdminStatus = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      const adminStatus = !!roleData;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  const signInViaXhr = (email: string, password: string) => {
    return new Promise<{ access_token: string; refresh_token: string; user?: User }>((resolve, reject) => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
      const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.timeout = 12000;
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.setRequestHeader('apikey', apikey);
      xhr.setRequestHeader('authorization', `Bearer ${apikey}`);

      xhr.onload = () => {
        try {
          const payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          if (xhr.status >= 200 && xhr.status < 300 && payload?.access_token && payload?.refresh_token) {
            resolve(payload);
            return;
          }
          const message = payload?.msg || payload?.error_description || payload?.error || 'Sign in failed';
          reject(new Error(message));
        } catch {
          reject(new Error('Sign in failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error while signing in'));
      xhr.ontimeout = () => reject(new Error('Sign in request timed out'));
      xhr.send(JSON.stringify({ email, password, gotrue_meta_security: {} }));
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const isNetworkError =
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('Network error') ||
          (error as any)?.status === 0;

        if (!isNetworkError) {
          return { error: error as Error };
        }

        const fallback = await signInViaXhr(email, password);
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: fallback.access_token,
          refresh_token: fallback.refresh_token,
        });

        if (sessionError) return { error: sessionError as Error };

        const userId = fallback.user?.id;
        if (userId) {
          ensureShareCode(userId);
          const adminStatus = await resolveAdminStatus(userId);
          return { error: null, isAdmin: adminStatus };
        }

        return { error: null, isAdmin: false };
      }

      if (data.user) {
        ensureShareCode(data.user.id);
        const adminStatus = await resolveAdminStatus(data.user.id);
        return { error: null, isAdmin: adminStatus };
      }

      return { error: null, isAdmin: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, isOffline, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
