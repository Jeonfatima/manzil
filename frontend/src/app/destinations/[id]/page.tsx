'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchDestination, fetchWeather } from '@/lib/api';
import { Destination } from '@/types';
import WeatherCard from '@/components/WeatherCard';
import { Calendar, Hotel, Utensils, MapPin, ArrowLeft, Wallet, Car } from 'lucide-react';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [dest, setDest] = useState<Destination | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchDestination(id)
        .then((data) => {
          setDest(data);
          if (data.weather) setWeather(data.weather);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      fetchWeather(id)
        .then(setWeather)
        .catch(console.error);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-stone-500 font-medium">
        Loading Destination Frontier...
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Destination Not Found</h2>
        <button
          onClick={() => router.push('/destinations')}
          className="px-6 py-2.5 bg-[#2D4A34] text-white rounded-2xl text-xs font-semibold"
        >
          Back to Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <button
        onClick={() => router.push('/destinations')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D4A34] hover:text-[#3F5E43] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-[#A3E635]" /> Back to Destinations
      </button>

      {/* Hero Banner */}
      <div className="relative h-[420px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
        <img
          src={dest.image_url}
          alt={dest.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?q=80&w=1200';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2826] via-[#1C2826]/40 to-transparent p-8 sm:p-12 flex flex-col justify-end text-white">
          <span className="text-xs uppercase font-bold text-[#A3E635] tracking-widest">
            {dest.province}
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mt-1">
            {dest.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 mt-2 max-w-2xl font-light">
            {dest.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Highlights & Logistics Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Frontier Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <Calendar className="w-5 h-5 text-[#2D4A34] mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Optimal Season</div>
                  <div className="text-sm font-semibold text-stone-900 mt-0.5">{dest.optimal_seasons || 'May - October'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <Hotel className="w-5 h-5 text-[#2D4A34] mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Top Lodging Options</div>
                  <div className="text-sm font-semibold text-stone-900 mt-0.5">{dest.best_hotels || 'Serena, Luxus, PTDC'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-stone-50 p-5 rounded-2xl border border-stone-100 md:col-span-2">
                <Utensils className="w-5 h-5 text-[#2D4A34] mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Local Cuisine &amp; Specialties</div>
                  <div className="text-sm font-semibold text-stone-900 mt-0.5">{dest.food_specialties || 'Local Trout, Shinwari Karahi, Chapshuro'}</div>
                </div>
              </div>
            </div>

            {/* Popular Spots Badges */}
            {dest.popular_spots?.length ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                  <MapPin className="w-5 h-5 text-[#2D4A34]" />
                  <span>Must-Visit Landmarks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dest.popular_spots.map((spot: string) => (
                    <span key={spot} className="text-xs font-semibold text-[#2D4A34] bg-[#E6ECE6] px-3.5 py-1.5 rounded-full border border-[#2D4A34]/10">
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Regional Pricing Estimates */}
          {dest.spot_rate && (
            <div className="bg-[#1C2826] text-stone-200 p-8 rounded-[2.5rem] border border-stone-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#A3E635]" />
                  <h3 className="font-serif font-bold text-lg text-white">Verified Regional PKR Price Tiers</h3>
                </div>
                <span className="text-xs text-[#A3E635] font-semibold bg-[#2D4A34] px-3 py-1 rounded-full border border-white/10">
                  Pre-Seeded Spot Rates
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Budget Hotel Tier</div>
                  <div className="text-lg font-bold text-white">PKR {dest.spot_rate.hotel_budget_pkr.toLocaleString()} / night</div>
                </div>

                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Standard Hotel Tier</div>
                  <div className="text-lg font-bold text-white">PKR {dest.spot_rate.hotel_standard_pkr.toLocaleString()} / night</div>
                </div>

                <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Luxury Retreat Tier</div>
                  <div className="text-lg font-bold text-white">PKR {dest.spot_rate.hotel_luxury_pkr.toLocaleString()} / night</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-[#2D4A34]/30 p-4 rounded-2xl border border-white/10">
                  <Car className="w-5 h-5 text-[#A3E635]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">Daily 4x4 Jeep / Transport</div>
                    <div className="text-sm font-bold text-white">PKR {dest.spot_rate.daily_transport_pkr.toLocaleString()} / day</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#2D4A34]/30 p-4 rounded-2xl border border-white/10">
                  <Utensils className="w-5 h-5 text-[#A3E635]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-400">Daily Food &amp; Dining</div>
                    <div className="text-sm font-bold text-white">PKR {dest.spot_rate.daily_food_pkr.toLocaleString()} / person/day</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Weather Sidebar */}
        <div className="lg:col-span-4">
          <WeatherCard weather={weather} destinationName={dest.name} />
        </div>
      </div>
    </div>
  );
}
