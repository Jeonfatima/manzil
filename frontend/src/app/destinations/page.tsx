'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, CloudSun, Sun, CloudRain, Cloud } from 'lucide-react';
import { fetchDestinations, fetchWeather } from '@/lib/api';
import { Destination } from '@/types';

function WeatherIcon({ condition }: { condition?: string }) {
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('drizzle')) {
    return <CloudRain className="w-3.5 h-3.5 text-[#A3E635]" />;
  }
  if (c.includes('cloud')) {
    return <Cloud className="w-3.5 h-3.5 text-[#A3E635]" />;
  }
  if (c.includes('clear') || c.includes('sunny')) {
    return <Sun className="w-3.5 h-3.5 text-[#A3E635]" />;
  }
  return <CloudSun className="w-3.5 h-3.5 text-[#A3E635]" />;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [weatherById, setWeatherById] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations()
      .then(async (data) => {
        if (data && data.length > 0) {
          setDestinations(data);
          // Pre-populate with weather included in destination payload
          const initialMap: Record<number, any> = {};
          data.forEach((d: any) => {
            if (d.weather) initialMap[d.id] = d.weather;
          });
          setWeatherById(initialMap);

          // In case any didn't have weather, fetch individually
          const missing = data.filter((d: any) => !d.weather);
          if (missing.length > 0) {
            const results = await Promise.all(
              missing.map((d: any) =>
                fetchWeather(d.id)
                  .then((w) => [d.id, w] as const)
                  .catch(() => [d.id, null] as const)
              )
            );
            setWeatherById((prev) => {
              const updated = { ...prev };
              results.forEach(([id, w]) => {
                if (w) updated[id] = w;
              });
              return updated;
            });
          }
        }
      })
      .catch((err) => console.error('Failed to load destinations:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-bold text-[#2D4A34] px-3.5 py-1.5 bg-[#E6ECE6] rounded-full inline-block">
          Frontier Hubs
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900">
          Destinations Across Northern Pakistan
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl font-light">
          Explore registered mountain valleys, glacial lakes, and alpine plateaus equipped with real-time OpenWeatherMap API climate badges and estimated daily PKR rates.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone-200 text-center text-stone-500 font-medium">
          Loading frontiers &amp; live weather badges...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => {
            const weather = weatherById[dest.id] || dest.weather;
            return (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-sm hover:shadow-2xl transition duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dest.image_url}
                      alt={dest.name}
                      onError={(e) => {
                        // Fallback to resilient authentic image if custom link fails
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?q=80&w=1200';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-stone-900 shadow">
                      {dest.province}
                    </div>

                    {/* Live Weather Badge */}
                    {weather?.temp !== undefined && weather?.temp !== null && (
                      <div className="absolute top-4 right-4 bg-[#1C2826]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#A3E635] flex items-center gap-1.5 border border-white/10 shadow-lg">
                        <WeatherIcon condition={weather.condition} />
                        <span>{weather.temp}°C</span>
                        <span className="text-stone-300 text-[10px] font-normal hidden sm:inline">
                          • {weather.condition}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 group-hover:text-[#2D4A34] transition">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-stone-600 font-light line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    {dest.popular_spots?.length ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dest.popular_spots.slice(0, 3).map((spot: string) => (
                          <span
                            key={spot}
                            className="text-[10px] font-semibold text-[#2D4A34] bg-[#E6ECE6] px-2.5 py-1 rounded-full"
                          >
                            {spot}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-stone-700">
                    <span className="font-semibold text-stone-900">
                      Avg. PKR {dest.avg_daily_budget_pkr.toLocaleString()} / day
                    </span>
                    <span className="text-[#2D4A34] font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      Explore <ArrowRight className="w-3.5 h-3.5 text-[#A3E635]" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
