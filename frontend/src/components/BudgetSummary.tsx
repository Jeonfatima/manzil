'use client';

import { Wallet, AlertTriangle } from 'lucide-react';

interface BudgetProps {
  summary: {
    total_budget: number;
    total_spent: number;
    remaining: number;
    percentage_used: number;
    is_over_budget: boolean;
    by_category: Record<string, number>;
  } | null;
}

export default function BudgetSummary({ summary }: BudgetProps) {
  if (!summary) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-7 border border-stone-200 shadow-md space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
          <Wallet className="w-5 h-5 text-[#2D4A34]" />
          <span>Expense &amp; Budget Tracker</span>
        </div>
        {summary.is_over_budget && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Budget Exceeded!
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
          <div className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider">Total Budget</div>
          <div className="text-sm font-bold text-stone-900 mt-1">PKR {summary.total_budget.toLocaleString()}</div>
        </div>
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
          <div className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider">Total Spent</div>
          <div className={`text-sm font-bold mt-1 ${summary.is_over_budget ? 'text-red-600' : 'text-[#2D4A34]'}`}>
            PKR {summary.total_spent.toLocaleString()}
          </div>
        </div>
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
          <div className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider">Remaining</div>
          <div className={`text-sm font-bold mt-1 ${summary.remaining < 0 ? 'text-red-600' : 'text-stone-900'}`}>
            PKR {summary.remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-600">
          <span>Budget Utilization</span>
          <span className="font-semibold">{summary.percentage_used}%</span>
        </div>
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.is_over_budget ? 'bg-red-500' : 'bg-[#2D4A34]'
            }`}
            style={{ width: `${Math.min(summary.percentage_used, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
