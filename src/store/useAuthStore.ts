import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';
import { Profile } from '../models/types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => {
    set({ session, loading: false });
    if (session) {
      get().fetchProfile();
    } else {
      set({ profile: null });
    }
  },
  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (!error && data) {
      set({ profile: data as Profile });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  }
}));
