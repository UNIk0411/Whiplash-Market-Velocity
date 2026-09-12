'use client';

import React from 'react';
import { ChangeStory } from '@/services/market-data/types';
import { TrendingUp, TrendingDown, Check, ChevronRight } from 'lucide-react';

interface NormalSymbolRowProps {
  story: ChangeStory;
  onInvestigate: (symbol: string) => void;
}

export const NormalSymbolRow: React.FC<NormalSymbolRowProps> = ({ story, onInvestigate }) => {
  const isPositive = story.percentChange >= 0;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-3 transition hover:border-slate-700 hover:bg-slate-900/80">
      {/* Ticker & Company */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
          {story.symbol.substring(0, 3)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{story.symbol}</span>
            <span className="hidden text-xs text-slate-400 sm:inline">{story.companyName}</span>
          </div>
          <span className="text-[11px] text-slate-500">{story.sector}</span>
        </div>
      </div>

      {/* Price & Change */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-200">${story.currentPrice.toFixed(2)}</div>
          <div
            className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}
            {story.percentChange.toFixed(1)}%
          </div>
        </div>

        {/* Normal Badge */}
        <span className="hidden rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 md:inline-block">
          Normal
        </span>

        {/* Action */}
        <button
          onClick={() => onInvestigate(story.symbol)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title="Inspect details"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
