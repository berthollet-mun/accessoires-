import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Configuration Supabase manquante sur Vercel');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-base-border/5 rounded-3xl p-10">
        <h2 className="text-3xl font-bold tracking-tighter text-primary-text mb-2">Welcome Back</h2>
        <p className="text-xs text-primary-text/40 mb-8 uppercase tracking-widest font-mono">Sign in to sync your cart</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-text/60 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-primary/5 border border-base-border/10 rounded-xl p-4 text-primary-text text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-text/60 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-primary/5 border border-base-border/10 rounded-xl p-4 text-primary-text text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-white text-inverse rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>
        <div className="mt-8 text-center text-[10px] font-mono tracking-widest uppercase text-primary-text/40">
          New client? <Link to="/register" className="text-[#C5A059] hover:text-primary-text transition-colors border-b border-[#C5A059]/50 pb-1">Register here</Link>
        </div>
      </div>
    </div>
  );
}
