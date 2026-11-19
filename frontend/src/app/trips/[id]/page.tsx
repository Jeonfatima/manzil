'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Wallet,
  Car,
  UtensilsCrossed,
  Ticket,
  Save,
  Check,
  Edit3,
} from 'lucide-react';
import { fetchTrip, fetchBudgetSummary, updateTrip } from '@/lib/api';
import { Trip, Activity, Itinerary } from '@/types';
import ItineraryDay from '@/components/ItineraryDay';
import BudgetSummary from '@/components/BudgetSummary';
import ExpenseForm from '@/components/ExpenseForm';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Number(params.id);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadData = () => {
    if (tripId) {
      fetchTrip(tripId)
        .then((data) => {
          setTrip(data);
          setItinerary(data.itinerary);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      fetchBudgetSummary(tripId)
        .then(setBudgetSummary)
        .catch(console.error);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const handleAddActivity = (dayNumber: number, newActivity: Activity) => {
    if (!itinerary) return;
    const updatedDaily = itinerary.daily_plan.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          activities: [...d.activities, newActivity],
        };
      }
      return d;
    });
    setItinerary({
      ...itinerary,
      daily_plan: updatedDaily,
    });
  };

  const handleDeleteActivity = (dayNumber: number, actIndex: number) => {
    if (!itinerary) return;
    const updatedDaily = itinerary.daily_plan.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          activities: d.activities.filter((_, i) => i !== actIndex),
        };
      }
      return d;
    });
    setItinerary({
      ...itinerary,
      daily_plan: updatedDaily,
    });
  };

  const handleSaveChanges = async () => {
    if (!itinerary || !trip) return;
    setSaving(true);
    setSavedAlert(false);
    try {
      await updateTrip(tripId, {
        itinerary,
      });
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 4000);
    } catch (err) {
      alert('Failed to save itinerary changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-stone-500 font-medium">
        Loading Expedition Itinerary...
      </div>
    );
  }

  if (!trip || !itinerary) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Trip Not Found</h2>
        <p className="text-stone-500 text-sm">We couldn&apos;t locate this itinerary in your journal.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 bg-[#2D4A34] text-white rounded-2xl text-xs font-semibold"
        >
          Back to My Trips
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D4A34] hover:text-[#3F5E43] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#A3E635]" /> Back to My Trips
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isEditing
                ? 'bg-[#2D4A34] text-white border-[#2D4A34]'
                : 'bg-white text-[#2D4A34] border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Mode Active' : 'Modify Itinerary'}</span>
          </button>

          {isEditing && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-5 py-2 bg-[#2D4A34] hover:bg-[#3F5E43] text-white text-xs font-semibold rounded-2xl shadow flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {savedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-sm">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Itinerary changes have been successfully saved to your cloud journal!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#2D4A34] px-3.5 py-1.5 bg-[#EAF0EA] rounded-full inline-block">
            {trip.travel_style} Journey
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {trip.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-[#2D4A34]" /> Starting Hub: {itinerary.starting_hub}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-[#2D4A34]" /> Hotel: {itinerary.recommended_hotel}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#2D4A34]" /> Starts: {trip.start_date}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase text-stone-500 font-semibold tracking-wider">Total Budget</div>
          <div className="text-2xl font-serif font-bold text-[#2D4A34] mt-0.5">
            PKR {trip.total_budget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Card */}
      {itinerary.cost_breakdown && (
        <div className="bg-[#1C2826] text-stone-200 p-8 rounded-[2.5rem] shadow-xl space-y-6 border border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#A3E635]" />
              <h3 className="font-serif font-bold text-lg text-white">Estimated Regional PKR Budget Breakdown</h3>
            </div>
            <span className="text-xs font-semibold text-[#A3E635] bg-[#2D4A34] px-3 py-1 rounded-full border border-white/10">
              PKR Estimates
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <Building2 className="w-3.5 h-3.5 text-[#A3E635]" /> Hotel &amp; Stay
              </div>
              <div className="text-lg font-bold text-white">
                PKR {itinerary.cost_breakdown.stay_pkr.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#A3E635]" /> Meals &amp; Dining
              </div>
              <div className="text-lg font-bold text-white">
                PKR {itinerary.cost_breakdown.meals_pkr.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <Car className="w-3.5 h-3.5 text-[#A3E635]" /> Transport / 4x4
              </div>
              <div className="text-lg font-bold text-white">
                PKR {itinerary.cost_breakdown.transport_pkr.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#2D4A34]/50 p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <Ticket className="w-3.5 h-3.5 text-[#A3E635]" /> Entry &amp; Spots
              </div>
              <div className="text-lg font-bold text-white">
                PKR {itinerary.cost_breakdown.activities_pkr.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Schedule & Expense Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Day-by-Day Schedule</h2>
            {isEditing && (
              <span className="text-xs font-semibold text-[#2D4A34] bg-[#EAF0EA] px-3 py-1 rounded-full">
                Click &quot;Add Activity&quot; or trash icon to modify
              </span>
            )}
          </div>

          {itinerary.daily_plan?.map((dayPlan) => (
            <ItineraryDay
              key={dayPlan.day}
              dayPlan={dayPlan}
              editable={isEditing}
              onAddActivity={(act) => handleAddActivity(dayPlan.day, act)}
              onDeleteActivity={(actIdx) => handleDeleteActivity(dayPlan.day, actIdx)}
            />
          ))}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <BudgetSummary summary={budgetSummary} />
          <ExpenseForm tripId={tripId} onExpenseAdded={loadData} />
        </div>
      </div>
    </div>
  );
}
