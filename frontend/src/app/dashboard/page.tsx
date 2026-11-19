'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Calendar, Wallet, Trash2, LogIn, ArrowRight } from 'lucide-react';
import { deleteTrip, fetchUserTrips } from '@/lib/api';
import { Trip, Session } from '@/types';

const SESSION_KEY = 'manzil_user';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (session?.mode === 'user' && session.userId) {
      setLoading(true);
      fetchUserTrips(session.userId)
        .then((data: any) => {
          setTrips(Array.isArray(data) ? data : []);
        })
        .catch(() => setTrips([]))
        .finally(() => setLoading(false));
    } else {
      setTrips([]);
      setLoading(false);
    }
  }, [session]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert('Could not delete trip. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-bold text-[#2D4A34] px-3.5 py-1.5 bg-[#E6ECE6] rounded-full inline-block">
          Travel Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900">
          My Saved Expeditions
        </h1>
        <p className="text-stone-600 text-sm max-w-xl font-light">
          Review, manage, and explore your saved custom day-by-day itineraries and PKR expenses.
        </p>
      </div>

      {!session || session.mode !== 'user' ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone-200 shadow-sm text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#E6ECE6] flex items-center justify-center mx-auto text-[#2D4A34]">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Sign In to Access Your Trips
            </h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Your personalized AI-generated itineraries are safely stored in your account. Sign in to view and manage them.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-lg transition"
            >
              <LogIn className="w-4 h-4 text-[#A3E635]" /> Sign In Now
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone-200 text-center text-stone-500 font-medium">
          Loading your travel itineraries...
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone-200 shadow-sm text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#E6ECE6] flex items-center justify-center mx-auto text-[#2D4A34]">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              No Saved Expeditions Yet
            </h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              You haven&apos;t generated or saved any itineraries yet. Head over to our AI generator to build your first tailored trip plan!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl shadow-lg transition"
            >
              Plan Your First Trip <ArrowRight className="w-4 h-4 text-[#A3E635]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-7 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D4A34] bg-[#E6ECE6] px-3 py-1 rounded-full">
                    {trip.travel_style}
                  </span>
                  <button
                    onClick={() => handleDelete(trip.id!)}
                    className="p-2 text-stone-400 hover:text-red-600 transition rounded-xl hover:bg-red-50 cursor-pointer"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-2xl font-serif font-bold text-stone-900 leading-snug">
                  {trip.title}
                </h3>

                <div className="space-y-2 text-xs text-stone-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2D4A34]" />
                    <span>{trip.total_days} Days • Starts {trip.start_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#2D4A34]" />
                    <span>Total Budget: PKR {trip.total_budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="w-full py-3.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl text-sm transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Full Itinerary</span>
                <ArrowRight className="w-4 h-4 text-[#A3E635]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
