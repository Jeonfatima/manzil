'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Compass,
  LogIn,
  ChevronDown,
  CloudSun,
  Wallet,
  MapPin,
  CheckCircle2,
  Mountain,
  Calendar,
  Building2,
  Car,
  UtensilsCrossed,
  Ticket,
} from 'lucide-react';
import { fetchDestinations, generateTrip, saveTrip } from '@/lib/api';
import { Destination, Itinerary, Session } from '@/types';
import ItineraryDay from '@/components/ItineraryDay';

const TRAVEL_STYLES = [
  { value: 'Budget Explorer', label: 'Budget Explorer' },
  { value: 'Family Relaxation', label: 'Family Relaxation' },
  { value: 'Luxury Retreat', label: 'Luxury Retreat' },
  { value: 'High Adventure', label: 'High Adventure' },
];

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<number>(1);
  const [days, setDays] = useState<number>(5);
  const [budget, setBudget] = useState<number>(80000);
  const [style, setStyle] = useState<string>('High Adventure');
  const [startDate, setStartDate] = useState<string>('2026-06-01');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [savedTripId, setSavedTripId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSession = () => {
    const savedUser = localStorage.getItem('manzil_user');
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

    fetchDestinations()
      .then((data) => {
        if (data && data.length > 0) {
          setDestinations(data);
          setSelectedDest(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load destinations:', err));

    const handleAuth = () => loadSession();
    window.addEventListener('storage', handleAuth);
    window.addEventListener('manzil-auth-change', handleAuth);
    return () => {
      window.removeEventListener('storage', handleAuth);
      window.removeEventListener('manzil-auth-change', handleAuth);
    };
  }, []);

  const handleGuestEnter = () => {
    const guestData: Session = { mode: 'guest', name: 'Guest Explorer' };
    localStorage.setItem('manzil_user', JSON.stringify(guestData));
    setSession(guestData);
    window.dispatchEvent(new Event('manzil-auth-change'));
    setTimeout(() => {
      scrollToSection('planner-section');
    }, 100);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setSavedTripId(null);

    try {
      const res = await generateTrip({
        destination_id: selectedDest,
        total_days: days,
        total_budget: budget,
        travel_style: style,
        start_date: startDate,
      });

      const plan: Itinerary | null = res.itinerary ?? null;
      setItinerary(plan);

      // Signed-In Mode: automatically saves trip to database
      if (session?.mode === 'user') {
        try {
          const saved = await saveTrip({
            destination_id: selectedDest,
            total_days: days,
            total_budget: budget,
            travel_style: style,
            start_date: startDate,
            itinerary: plan,
          });
          setSavedTripId(saved.id ?? null);
          setSaveSuccess(true);
        } catch (saveErr) {
          console.error('Failed to auto-save trip:', saveErr);
        }
      }

      setTimeout(() => {
        scrollToSection('itinerary-section');
      }, 150);
    } catch (err) {
      alert('Error generating trip. Ensure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const isGuest = session?.mode === 'guest';
  const selectedDestinationObj = destinations.find((d) => d.id === selectedDest);

  return (
    <div className="min-h-screen bg-sage text-forest font-sans">
      {/* 1. Hero Section */}
      <section className="relative isolate min-h-[calc(100vh-5rem)] flex flex-col justify-between items-center px-6 py-12 overflow-hidden">
        {/* Background Asset with CSS stacking context */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-100"
          style={{ backgroundImage: `url('/images/bg.png')` }}
        />
        {/* Crisp Dark Overlay */}
        <div className="absolute inset-0 bg-[#1C2826]/75 z-0 backdrop-blur-[1px]" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl text-center my-auto space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-widest uppercase shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-[#A3E635]" />
            <span>Pakistan&apos;s Premier AI Travel Platform</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-3"
          >
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-none drop-shadow-2xl">
              Manzil<span className="text-[#A3E635]">.com</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-serif italic text-stone-100 font-medium drop-shadow-md">
              Nature, Suspended in Time.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-stone-100 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed drop-shadow-md"
          >
            Explore Northern Frontiers with intelligent daily itineraries, real-time OpenWeatherMap climate tracking, and smart PKR budget allocation.
          </motion.p>

          {/* Prominent Floating Glassmorphism Modal */}
          {!session ? (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="max-w-md mx-auto bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-white/80 shadow-2xl space-y-4"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-[#2D4A34]">
                Choose Entry Mode
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGuestEnter}
                  className="w-full py-3.5 px-4 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm group"
                >
                  <Compass className="w-4 h-4 text-[#A3E635]" />
                  <span>Continue as Guest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 px-4 bg-[#EAF0EA] hover:bg-[#d8e4d8] text-[#2D4A34] font-semibold rounded-2xl border border-[#2D4A34]/20 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <LogIn className="w-4 h-4 text-[#2D4A34]" />
                  <span>Sign In</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-medium text-stone-600 border-t border-stone-200">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4A34]" /> No Password Needed
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4A34]" /> Live Weather
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-2"
            >
              <button
                onClick={() => scrollToSection('planner-section')}
                className="py-4 px-8 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-2xl transition duration-300 inline-flex items-center gap-3 cursor-pointer text-base border border-white/20"
              >
                <span>Open AI Itinerary Generator</span>
                <ArrowRight className="w-5 h-5 text-[#A3E635]" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={() => scrollToSection(session ? 'planner-section' : 'features-section')}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 text-stone-200 hover:text-white flex flex-col items-center gap-1 cursor-pointer text-xs font-semibold uppercase tracking-widest drop-shadow-md pb-2"
        >
          <span>{session ? 'Go To Generator' : 'Explore Platform Features'}</span>
          <ChevronDown className="w-5 h-5 text-[#A3E635]" />
        </motion.button>
      </section>

      {/* 2. Platform Features Section (Crucial Rule: shown right below hero on initial launch when unauthenticated) */}
      {!session && (
        <section id="features-section" className="bg-[#EAF0EA] py-24 px-6 space-y-16 border-y border-[#d0ded0]">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2D4A34] px-4 py-1.5 bg-white rounded-full inline-block shadow-sm">
                Platform Capabilities
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900">
                Engineered For Northern Frontiers
              </h2>
              <p className="text-stone-600 text-sm font-light">
                Discover the intelligent travel tools built directly into Manzil.com for your expedition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Live Weather Sync Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#2D4A34] text-white flex items-center justify-center shadow-md">
                  <CloudSun className="w-7 h-7 text-[#A3E635]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Live Weather Sync</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Up-to-the-second climate tracking via OpenWeatherMap API for Hunza, Skardu, Swat, Naran, and high alpine passes with 5-day forecasts.
                </p>
              </motion.div>

              {/* Smart PKR Budgeting Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#2D4A34] text-white flex items-center justify-center shadow-md">
                  <Wallet className="w-7 h-7 text-[#A3E635]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Smart PKR Budgeting</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Realistic Pakistani Rupee expense management detailing 4x4 jeep fuel, regional lodging tiers, authentic dining, and entry ticket costs.
                </p>
              </motion.div>

              {/* Curated Northern Frontiers Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#2D4A34] text-white flex items-center justify-center shadow-md">
                  <Mountain className="w-7 h-7 text-[#A3E635]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Curated Northern Frontiers</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Hand-verified routes across Gilgit-Baltistan, Khyber Pakhtunkhwa, and Azad Kashmir covering historic forts, glacial lakes, and pine meadows.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Conditional AI Itinerary Generator Section (ONLY unlocked via Guest Mode or Sign In) */}
      {session && (
        <section id="planner-section" className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-white rounded-[3rem] border border-stone-200 shadow-2xl p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#2D4A34] px-3.5 py-1.5 bg-[#EAF0EA] rounded-full inline-block border border-[#2D4A34]/15">
                      Powered by Google Gemini
                    </span>
                    {isGuest && (
                      <span className="text-xs uppercase font-semibold tracking-wider text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full inline-block">
                        Guest Mode
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-stone-900">
                    Plan Your Northern Expedition
                  </h2>
                  <p className="text-stone-600 text-sm font-light">
                    Select your frontier destination, budget, and travel preferences to generate a custom day-by-day plan.
                  </p>
                </div>

                <form onSubmit={handleGenerate} className="bg-stone-50 p-6 sm:p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Destination Selector */}
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#2D4A34] mb-1.5 block">
                        Destination
                      </label>
                      <select
                        value={selectedDest}
                        onChange={(e) => setSelectedDest(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
                      >
                        {destinations.length === 0 ? (
                          <option value={1}>Hunza Valley (Gilgit-Baltistan)</option>
                        ) : (
                          destinations.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.province})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Duration Input */}
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#2D4A34] mb-1.5 block">
                        Duration (1 to 15 Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
                      />
                    </div>

                    {/* Budget Input (PKR) */}
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#2D4A34] mb-1.5 block">
                        Total Budget (PKR)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        min="15000"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
                      />
                    </div>

                    {/* Travel Style */}
                    <div>
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#2D4A34] mb-1.5 block">
                        Travel Style
                      </label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
                      >
                        {TRAVEL_STYLES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date */}
                    <div className="md:col-span-2">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#2D4A34] mb-1.5 block">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin text-[#A3E635]" /> Generating Itinerary via AI...
                      </span>
                    ) : (
                      <>
                        <span>Generate AI Itinerary</span>
                        <ArrowRight className="w-5 h-5 text-[#A3E635]" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Selected Destination Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                  <img
                    src={selectedDestinationObj?.image_url || 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?q=80&w=1200'}
                    alt={selectedDestinationObj?.name || 'Northern Pakistan'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?q=80&w=1200';
                    }}
                    className="w-full h-[460px] object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C2826] via-[#1C2826]/30 to-transparent p-8 flex flex-col justify-end text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3E635]">
                      {selectedDestinationObj?.province || 'Northern Pakistan'}
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-white">
                      {selectedDestinationObj?.name || 'Selected Destination'}
                    </h3>
                    <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                      {selectedDestinationObj?.description || 'Authentic valleys, alpine passes, and towering peaks.'}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-stone-300">
                      <span>Avg. PKR {selectedDestinationObj?.avg_daily_budget_pkr.toLocaleString()} / day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Generated Itinerary Section (Guest Mode on-screen display / signed-in auto-saved view) */}
      {session && itinerary && (
        <section id="itinerary-section" className="max-w-7xl mx-auto px-6 py-16 space-y-10">
          {/* Status Alert for Signed-In vs Guest */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Itinerary successfully generated and saved to your account!
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-1.5 bg-[#2D4A34] text-white rounded-xl text-xs font-semibold hover:bg-[#3F5E43] transition"
              >
                View in My Trips
              </button>
            </div>
          )}

          {isGuest && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-sm flex items-center gap-2 justify-center sm:justify-start">
                  <Compass className="w-4 h-4 text-amber-700" /> Guest Mode Active
                </div>
                <p className="text-xs text-amber-800">
                  You are exploring as a guest. Cloud saving and journal editing are disabled until you sign in.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white text-xs font-semibold rounded-2xl transition shadow flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Sign In to Save Trip
              </button>
            </div>
          )}

          {/* Itinerary Header & Overview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#2D4A34] px-3.5 py-1.5 bg-[#EAF0EA] rounded-full inline-block">
                AI Generated Schedule
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
                {days}-Day {style} to {selectedDestinationObj?.name || 'Frontier'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#2D4A34]" /> Starting Hub: {itinerary.starting_hub}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-[#2D4A34]" /> Lodging: {itinerary.recommended_hotel}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#2D4A34]" /> Starts: {startDate}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase text-stone-500 font-semibold tracking-wider">Planned Budget</div>
              <div className="text-2xl font-serif font-bold text-[#2D4A34] mt-0.5">
                PKR {budget.toLocaleString()}
              </div>
            </div>
          </div>

          {/* PKR Cost Breakdown Card */}
          {itinerary.cost_breakdown && (
            <div className="bg-[#1C2826] text-stone-200 p-8 rounded-[2.5rem] shadow-xl space-y-6 border border-stone-800">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#A3E635]" />
                  <h3 className="font-serif font-bold text-lg text-white">Estimated PKR Cost Breakdown</h3>
                </div>
                <span className="text-xs font-semibold text-[#A3E635] bg-[#2D4A34] px-3 py-1 rounded-full border border-white/10">
                  Regional Pricing Model
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300">
                    <Building2 className="w-3.5 h-3.5 text-[#A3E635]" /> Hotel &amp; Lodging
                  </div>
                  <div className="text-lg font-bold text-white">
                    PKR {itinerary.cost_breakdown.stay_pkr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#A3E635]" /> Food &amp; Dining
                  </div>
                  <div className="text-lg font-bold text-white">
                    PKR {itinerary.cost_breakdown.meals_pkr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300">
                    <Car className="w-3.5 h-3.5 text-[#A3E635]" /> 4x4 Jeep / Transport
                  </div>
                  <div className="text-lg font-bold text-white">
                    PKR {itinerary.cost_breakdown.transport_pkr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300">
                    <Ticket className="w-3.5 h-3.5 text-[#A3E635]" /> Entry &amp; Activities
                  </div>
                  <div className="text-lg font-bold text-white">
                    PKR {itinerary.cost_breakdown.activities_pkr.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Day-by-Day Timeline */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Detailed Day-by-Day Itinerary
            </h3>
            <div className="space-y-6">
              {itinerary.daily_plan?.map((dayPlan) => (
                <ItineraryDay key={dayPlan.day} dayPlan={dayPlan} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
