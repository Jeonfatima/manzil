'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, MapPin, User, LogOut } from 'lucide-react';
import { Session } from '@/types';

const SESSION_KEY = 'manzil_user';

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  const loadSession = () => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
      try {
        setSession(JSON.parse(savedUser));
      } catch (e) {
        setSession(null);
      }
    } else {
      setSession(null);
    }
  };

  useEffect(() => {
    loadSession();

    const handleAuthChange = () => {
      loadSession();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('manzil-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('manzil-auth-change', handleAuthChange);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('manzil_token');
    setSession(null);
    window.dispatchEvent(new Event('manzil-auth-change'));
    router.push('/');
  };

  const isGuest = session?.mode === 'guest';

  return (
    <nav className="sticky top-0 z-50 bg-[#1C2826] text-stone-300 border-b border-stone-800 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#2D4A34] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md border border-white/10 group-hover:border-[#A3E635]/50 transition">
            M
          </div>
          <div>
            <span className="font-serif text-2xl font-bold text-white tracking-tight block leading-none">
              Manzil<span className="text-[#A3E635]">.com</span>
            </span>
            <span className="text-[#A3E635] text-[10px] font-semibold tracking-widest uppercase block mt-1">
              Nature, Suspended in Time
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/destinations" className="text-stone-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#A3E635]" /> Destinations
          </Link>
          <Link href="/assistant" className="text-stone-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#A3E635]" /> Musafir.ai
          </Link>
          <Link href="/dashboard" className="text-stone-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#A3E635]" /> My Trips
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              {isGuest ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A3E635] bg-[#2D4A34]/70 px-3 py-1.5 rounded-full border border-white/10">
                    <Compass className="w-3 h-3" /> Guest Explorer
                  </span>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-[#2D4A34] hover:bg-[#3F5E43] text-white rounded-2xl text-xs font-medium transition shadow-md border border-white/10 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" /> Sign In
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A3E635] bg-[#2D4A34]/70 px-3.5 py-1.5 rounded-full border border-white/10">
                    <Compass className="w-3.5 h-3.5" /> {session.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-[#2D4A34] hover:bg-[#3F5E43] text-white rounded-2xl text-xs font-medium transition shadow-md flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white rounded-2xl text-sm font-medium transition shadow-md flex items-center gap-2 border border-white/10"
            >
              <User className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
