'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { addExpense } from '@/lib/api';

interface ExpenseFormProps {
  tripId: number;
  onExpenseAdded: () => void;
}

export default function ExpenseForm({ tripId, onExpenseAdded }: ExpenseFormProps) {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      await addExpense(tripId, {
        category,
        amount: Number(amount),
        description,
        date: new Date().toISOString().split('T')[0],
      });
      setAmount('');
      setDescription('');
      onExpenseAdded();
    } catch (err) {
      alert('Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-[2.5rem] border border-stone-200 shadow-md space-y-4"
    >
      <h4 className="font-serif font-bold text-stone-900 text-base">Record Expedition Expense</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-[#2D4A34] mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
          >
            <option value="Food">Food &amp; Dining</option>
            <option value="Stay">Hotel &amp; Lodging</option>
            <option value="Transport">4x4 Jeep &amp; Fuel</option>
            <option value="Tickets">Entry Tickets &amp; Permits</option>
            <option value="Shopping">Handicrafts &amp; Gifts</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-[#2D4A34] mb-1 block">Amount (PKR)</label>
          <input
            type="number"
            placeholder="e.g. 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-[#2D4A34] mb-1 block">Description</label>
          <input
            type="text"
            placeholder="e.g. Chapshuro Lunch in Karimabad"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-[#2D4A34]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#2D4A34] hover:bg-[#3F5E43] text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <PlusCircle className="w-4 h-4 text-[#A3E635]" />
        <span>{loading ? 'Recording...' : 'Add Expense to Journal'}</span>
      </button>
    </form>
  );
}
