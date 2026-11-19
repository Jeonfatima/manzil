'use client';

import { Sun, CloudRain, CloudSun, Cloud } from 'lucide-react';

interface WeatherProps {
  weather: {
    temp: number;
    condition: string;
    forecast: { day: string; temp: number; condition: string }[];
  } | null;
  destinationName: string;
}

export default function WeatherCard({ weather, destinationName }: WeatherProps) {
  if (!weather) return null;

  const conditionLower = weather.condition?.toLowerCase() || '';
  const Icon = conditionLower.includes('rain')
    ? CloudRain
    : conditionLower.includes('cloud')
    ? Cloud
    : conditionLower.includes('clear') || conditionLower.includes('sunny')
    ? Sun
    : CloudSun;

  return (
    <div className="bg-white rounded-[2.5rem] p-7 border border-stone-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#2D4A34] bg-[#EAF0EA] px-3 py-1 rounded-full inline-block">
            OpenWeatherMap Sync
          </span>
          <h3 className="text-2xl font-serif font-bold text-stone-900 pt-1">{destinationName}</h3>
        </div>
        <div className="text-right">
          <div className="text-4xl font-serif font-bold text-stone-900">{weather.temp}°C</div>
          <div className="text-xs text-stone-500 font-medium capitalize">{weather.condition}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-[#2D4A34] bg-[#EAF0EA] rounded-2xl p-3.5 border border-[#2D4A34]/10">
        <Icon className="w-5 h-5 text-[#2D4A34]" />
        <span className="text-xs font-bold uppercase tracking-wider">Live Climate Sync Active</span>
      </div>

      {weather.forecast?.length ? (
        <div className="space-y-3 pt-2">
          <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
            5-Day Regional Forecast
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {weather.forecast.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100 hover:border-stone-200 transition"
              >
                <div className="text-xs text-stone-500 font-medium">{item.day}</div>
                <div className="text-base font-bold text-stone-900 mt-0.5">{item.temp}°C</div>
                <div className="text-[10px] text-[#2D4A34] font-semibold capitalize mt-0.5">{item.condition}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
