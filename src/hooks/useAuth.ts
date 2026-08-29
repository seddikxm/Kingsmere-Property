import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  isAdmin: boolean;
  isUnauthorized: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Admin check error:', error.message);
        setIsAdmin(false);
        setIsUnauthorized(true);
        return;
      }

      if (data) {
        setIsAdmin(true);
        setIsUnauthorized(false);
      } else {
        setIsAdmin(false);
        setIsUnauthorized(true);
      }
    } catch {
      setIsAdmin(false);
      setIsUnauthorized(true);
    }
  }, []);

  const verifySession = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setUser(null);
        setIsAdmin(false);
        setIsUnauthorized(false);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setUser(null);
        setIsAdmin(false);
        setIsUnauthorized(false);
        return;
      }

      setUser(userData.user);
      await checkAdmin(userData.user);
    } finally {
      setLoading(false);
    }
  }, [checkAdmin]);

  useEffect(() => {
    verifySession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setIsAdmin(false);
        setIsUnauthorized(false);
        setLoading(false);
      } else if (session.user) {
        setUser(session.user);
        await checkAdmin(session.user);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAdmin, verifySession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsUnauthorized(false);
  };

  return { user, isAdmin, isUnauthorized, loading, signIn, signOut };
}
