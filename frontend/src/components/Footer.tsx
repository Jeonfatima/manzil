import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1C2826] text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2D4A34] text-white flex items-center justify-center font-serif font-bold text-lg shadow-md border border-white/10">
            M
          </div>
          <div>
            <span className="text-white font-serif font-bold text-base block">Manzil.com</span>
            <span className="text-xs text-stone-400">© 2026 Manzil AI Travel Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-stone-400">
          <Link href="/destinations" className="hover:text-white transition">Destinations</Link>
          <Link href="/assistant" className="hover:text-white transition">Musafir.ai</Link>
          <Link href="/dashboard" className="hover:text-white transition">My Trips</Link>
          <Link href="/login" className="hover:text-white transition">Sign In</Link>
        </div>

        <div className="flex items-center gap-4 text-stone-500">
          <span className="text-xs">Next.js &amp; FastAPI</span>
          <span className="text-stone-600">•</span>
          <span className="text-xs flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-[#A3E635]" /> for explorers
          </span>
        </div>
      </div>
    </footer>
  );
}
