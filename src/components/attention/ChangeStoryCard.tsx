'use client';

import React from 'react';
import { ChangeStory } from '@/services/market-data/types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface ChangeStoryCardProps {
  story: ChangeStory;
  onInvestigate: (symbol: string) => void;
  onMarkAsSeen?: (story: ChangeStory) => void;
}

export const ChangeStoryCard: React.FC<ChangeStoryCardProps> = ({
  story,
  onInvestigate,
  onMarkAsSeen,
}) => {
  const isPositive = story.percentChange >= 0;

  // Level Badge Styling
  const levelStyles = {
    HIGH: {
      border: 'border-rose-500/40 bg-rose-950/20 shadow-rose-950/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      tag: 'HIGH ATTENTION',
    },
    ATTENTION: {
      border: 'border-amber-500/40 bg-amber-950/20 shadow-amber-950/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      tag: 'ATTENTION',
    },
    NOTABLE: {
      border: 'border-blue-500/30 bg-blue-950/20 shadow-blue-950/30',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      tag: 'NOTABLE',
    },
    NORMAL: {
      border: 'border-slate-800 bg-slate-900/60',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      tag: 'NORMAL',
    },
  }[story.attentionLevel];

  // Map ChangeTypes to formatted pill labels
  const formatChangeType = (type: string) => {
    switch (type) {
      case 'PRICE_SHOCK':
        return 'Price Shock';
      case 'VOLUME_SHOCK':
        return 'Volume Surge';
      case 'DIVERGENCE':
        return 'Sector Divergence';
      case 'REVERSAL':
        return 'Intraday Reversal';
      case 'VOLATILITY_EXPANSION':
        return 'Volatility Expanded';
      case 'QUIET_BREAK':
        return 'Quiet Break';
      case 'RELATIVE_OUTPERFORMANCE':
        return 'Outperformance';
      case 'DATA_WARNING':
        return 'Data Disagreement';
      default:
        return type;
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${levelStyles.border} p-5 shadow-xl transition-all duration-200 hover:border-slate-600 hover:shadow-2xl`}
    >
      {/* Top Bar: Symbol, Company, Price & Attention Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-white tracking-wide">{story.symbol}</h3>
            <span className="text-xs font-semibold text-slate-400">{story.companyName}</span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">
              ${story.currentPrice.toFixed(2)}
            </span>

            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? '+' : ''}
              {story.percentChange.toFixed(1)}% today
            </span>

            {/* Delta since last seen */}
            {story.changeSinceLastSeen && (
              <span className="ml-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                Since last check: {story.changeSinceLastSeen.percentDelta >= 0 ? '+' : ''}
                {story.changeSinceLastSeen.percentDelta.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Attention Score Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${levelStyles.badge}`}
          >
            {levelStyles.tag} ({story.meaningfulnessScore}%)
          </span>

          {/* Freshness & Data Quality Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {story.freshness === 'STALE' || story.freshness === 'UNAVAILABLE' || story.confidence < 0.8 ? (
              <span className="flex items-center gap-1 text-amber-400">
                <ShieldAlert className="h-3 w-3" /> Data Warning
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> {story.freshness === 'CLOSED' ? 'Market closed · last close' : story.freshness}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Semantic Tags */}
      {story.changeTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {story.changeTypes.map((type) => (
            <span
              key={type}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                type === 'DATA_WARNING'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700'
              }`}
            >
              {formatChangeType(type)}
            </span>
          ))}
        </div>
      )}

      {/* Summary Explanation Rationale */}
      <div className="mt-3 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-300 leading-relaxed border border-slate-800/60">
        <p className="font-medium text-slate-200">{story.summary}</p>
        <p className="mt-1 text-slate-400">{story.observationText}</p>
      </div>

      {/* Signals Breakdown Checklist */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {story.signals.slice(0, 3).map((sig) => (
          <div
            key={sig.id}
            className="flex items-center justify-between rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[11px] border border-slate-800"
          >
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${
                  sig.status === 'positive'
                    ? 'text-emerald-400'
                    : sig.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-500'
                }`}
              />
              <span className="font-medium">{sig.name}</span>
            </div>
            <span className="font-mono text-slate-400">{sig.evidenceValue}</span>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="h-3 w-3" />
          <span>Confidence: Math {Math.round(story.confidence * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          {onMarkAsSeen && (
            <button
              onClick={() => onMarkAsSeen(story)}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              Mark as seen
            </button>
          )}

          <button
            onClick={() => onInvestigate(story.symbol)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
          >
            <span>Investigate</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
