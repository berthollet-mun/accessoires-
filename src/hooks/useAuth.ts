import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../config/supabaseClient';

export function useAuth() {
  const { session, profile, loading, setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return { session, profile, loading };
}
