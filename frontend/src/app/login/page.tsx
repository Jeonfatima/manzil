'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '@/lib/api';
import { Session } from '@/types';

const SESSION_KEY = 'manzil_user';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const persistSession = (user: any) => {
    const sessionData: Session = {
      mode: 'user',
      name: user?.full_name || user?.email?.split('@')[0] || 'Traveler',
      email: user?.email,
      userId: user?.id,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event('manzil-auth-change'));
    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      persistSession(data.user);
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(fullName, email, password);
      persistSession(data.user);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    const guestData: Session = { mode: 'guest', name: 'Guest Explorer' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(guestData));
    window.dispatchEvent(new Event('manzil-auth-change'));
    router.push('/');
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-12 overflow-hidden selection:bg-[#2D4A34]/20 selection:text-[#2D4A34]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat fixed -z-20 scale-105"
        style={{ backgroundImage: `url('/images/bg.png')` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 -z-10 backdrop-blur-[2px]" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2D4A34] text-white flex items-center justify-center font-serif font-bold text-2xl mx-auto shadow-md">
            M
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-xs text-stone-500">
            {isLogin ? 'Sign in to access saved trips or explore as a guest' : 'Join Manzil.com to start planning adventures'}
          </p>
        </div>

        <div className="flex bg-[#EAF0EA] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition ${isLogin ? 'bg-[#2D4A34] text-white shadow' : 'text-stone-600'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition ${!isLogin ? 'bg-[#2D4A34] text-white shadow' : 'text-stone-600'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs uppercase font-semibold text-[#2D4A34] mb-1 block">Full Name</label>
              <input
                type="text"
                required
                placeholder="Ali Raza"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#2D4A34]"
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase font-semibold text-[#2D4A34] mb-1 block">Email</label>
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#2D4A34]"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-semibold text-[#2D4A34] mb-1 block">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#2D4A34]"
            />
          </div>

          {error && <div className="text-xs text-red-600 font-medium text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-60"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-xs text-stone-400 uppercase font-semibold">Or</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestMode}
            className="w-full py-3.5 bg-[#E6ECE6] hover:bg-[#d5ded5] text-[#2D4A34] font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#2D4A34]/20"
          >
            <Compass className="w-4 h-4" />
            <span>Continue as Guest</span>
          </button>
        </form>
      </div>
    </div>
  );
}
