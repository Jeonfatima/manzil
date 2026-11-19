'use client';

import { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { DailyPlan, Activity } from '@/types';

interface ItineraryDayProps {
  dayPlan: DailyPlan;
  editable?: boolean;
  onDeleteActivity?: (actIndex: number) => void;
  onAddActivity?: (activity: Activity) => void;
}

export default function ItineraryDay({
  dayPlan,
  editable = false,
  onDeleteActivity,
  onAddActivity,
}: ItineraryDayProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [time, setTime] = useState('11:00 AM');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('2 Hours');
  const [cost, setCost] = useState('1500');
  const [details, setDetails] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !onAddActivity) return;

    onAddActivity({
      time,
      title,
      duration,
      cost: Number(cost) || 0,
      details,
    });

    setTitle('');
    setDetails('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 bg-[#2D4A34] text-[#A3E635] text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
            Day {dayPlan.day}
          </span>
          <h3 className="font-serif font-bold text-stone-900 text-xl flex-1">
            {dayPlan.title}
          </h3>
        </div>

        {editable && onAddActivity && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-[#EAF0EA] hover:bg-[#d8e4d8] text-[#2D4A34] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Activity'}</span>
          </button>
        )}
      </div>

      {/* Inline Form to Add Activity */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2D4A34]">
            Add Custom Activity to Day {dayPlan.day}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">Activity Title</label>
              <input
                type="text"
                placeholder="e.g. Photography session at Passu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">Cost (PKR)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">Details &amp; Notes</label>
              <input
                type="text"
                placeholder="Brief description of the activity or route..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#2D4A34] hover:bg-[#3F5E43] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Save Activity to Timeline
          </button>
        </form>
      )}

      {/* Activities List */}
      <div className="space-y-3">
        {dayPlan.activities?.map((act, idx) => (
          <div
            key={idx}
            className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-stone-200 transition"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D4A34]">
                <Clock className="w-3.5 h-3.5 text-[#2D4A34]" />
                <span>{act.time}</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500 font-normal">{act.duration}</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm sm:text-base">{act.title}</h4>
              <p className="text-xs text-stone-600 font-light leading-relaxed">{act.details}</p>
            </div>

            <div className="flex items-center gap-3 sm:text-right shrink-0">
              <span className="text-xs font-bold text-stone-800 bg-[#EAF0EA] border border-[#2D4A34]/15 px-3 py-1.5 rounded-full inline-block">
                PKR {act.cost.toLocaleString()}
              </span>

              {editable && onDeleteActivity && (
                <button
                  onClick={() => onDeleteActivity(idx)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
