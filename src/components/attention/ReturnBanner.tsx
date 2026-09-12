'use client';

import React from 'react';
import { AttentionFeedSummary } from '@/services/market-data/types';
import { Clock, Activity, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ReturnBannerProps {
  summary: AttentionFeedSummary;
  isComparing: boolean;
  onMarkAllAsSeen?: () => void;
}

export const ReturnBanner: React.FC<ReturnBannerProps> = ({
  summary,
  isComparing,
  onMarkAllAsSeen,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0d1322] to-slate-950 p-6 shadow-2xl">
      {/* Background Decorative Accent */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left Column: Heading & Market Memory Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              MARKET MEMORY ACTIVE
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            While you were away...
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Comparing against your previous check: <strong className="text-slate-200">{summary.lastCheckedTimeAgo}</strong></span>
          </div>

          {/* Dynamic Return Animation State */}
          {isComparing ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300 border border-blue-500/20">
              <Activity className="h-4 w-4 animate-spin text-blue-400" />
              <span>Scanning market shifts, volatility anomalies, and sector divergence...</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-300">
              We detected <strong className="text-amber-400">{summary.meaningfulChangesCount} meaningful changes</strong> requiring your attention, while <strong className="text-slate-400">{summary.ordinaryMovementsCount} symbols</strong> moved normally.
            </p>
          )}
        </div>

        {/* Right Column: 4 Compact Summary Counters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:w-auto">
          {/* Watched */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-white">{summary.totalWatched}</div>
            <div className="text-[11px] font-medium text-slate-400">Watched Symbols</div>
          </div>

          {/* Meaningful */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-amber-400">{summary.meaningfulChangesCount}</div>
            <div className="text-[11px] font-medium text-amber-200/80">Meaningful Changes</div>
          </div>

          {/* High Attention */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-rose-400">{summary.highAttentionCount}</div>
            <div className="text-[11px] font-medium text-rose-200/80">High Attention</div>
          </div>

          {/* Ordinary */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-black text-slate-400">{summary.ordinaryMovementsCount}</div>
            <div className="text-[11px] font-medium text-slate-400">Ordinary Move</div>
          </div>
        </div>
      </div>
    </div>
  );
};
