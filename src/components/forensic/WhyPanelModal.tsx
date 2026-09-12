'use client';

import React from 'react';
import { ChangeStory } from '@/services/market-data/types';
import {
  X,
  Clock,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface WhyPanelModalProps {
  story: ChangeStory | null;
  onClose: () => void;
  onMarkAsSeen?: (story: ChangeStory) => void;
}

export const WhyPanelModal: React.FC<WhyPanelModalProps> = ({
  story,
  onClose,
  onMarkAsSeen,
}) => {
  if (!story) return null;

  const isPositive = story.percentChange >= 0;

  // Data for relative context chart
  const relativeData = [
    { name: story.symbol, return: story.percentChange, fill: isPositive ? '#10b981' : '#f43f5e' },
    { name: `${story.sector} Sector`, return: story.marketContext.sectorReturn, fill: '#3b82f6' },
    { name: 'S&P 500 Market', return: story.marketContext.marketReturn, fill: '#64748b' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950/40 text-lg font-black text-blue-400">
              {story.symbol.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{story.symbol}</h2>
                <span className="text-xs text-slate-400">{story.companyName}</span>
              </div>
              <p className="text-xs text-blue-400 font-medium">
                FORENSIC INVESTIGATION: Why did this enter my attention?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="space-y-6 p-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs text-slate-400">Current Price</div>
              <div className="text-lg font-bold text-white">${story.currentPrice.toFixed(2)}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs text-slate-400">Today's Move</div>
              <div
                className={`text-lg font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {story.percentChange.toFixed(1)}%
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs text-slate-400">Meaningfulness</div>
              <div className="text-lg font-bold text-amber-400">
                {story.meaningfulnessScore}% ({story.attentionLevel})
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs text-slate-400">Data Freshness</div>
              <div className="text-lg font-bold text-slate-300 flex items-center gap-1">
                {story.freshness === 'STALE' ? (
                  <span className="text-amber-400 flex items-center gap-1 text-sm">
                    <ShieldAlert className="h-4 w-4" /> Stale
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 text-sm">
                    <ShieldCheck className="h-4 w-4" /> {story.freshness}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Forensic Change Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="h-4 w-4 text-blue-400" /> CHANGE TIMELINE BREAKDOWN
            </h3>

            <div className="mt-4 space-y-3">
              {story.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-4 border-l-2 border-slate-800">
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  <div className="w-20 text-xs font-mono text-slate-400">{step.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
                      <span>${step.price.toFixed(2)}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-blue-300">
                        {step.volumeRatio.toFixed(1)}× volume
                      </span>
                    </div>
                    {step.eventNote && (
                      <p className="mt-0.5 text-[11px] text-slate-400">{step.eventNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relative Context Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <BarChart2 className="h-4 w-4 text-emerald-400" /> RELATIVE CONTEXT COMPARISON
            </h3>

            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={relativeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Return']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                    {relativeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evidence Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              EVIDENCE SIGNALS MATRIX
            </h3>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {story.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          sig.status === 'positive'
                            ? 'text-emerald-400'
                            : sig.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      />
                      {sig.name}
                    </span>
                    <span className="font-mono text-blue-400">{sig.score}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{sig.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rationale: Observation vs Interpretation */}
          <div className="space-y-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400">
              <Info className="h-4 w-4" /> RATIONALE & NON-CAUSAL INTERPRETATION
            </div>

            <div>
              <span className="font-bold text-slate-300">OBSERVATION:</span>
              <p className="mt-0.5 text-slate-300 leading-relaxed">{story.observationText}</p>
            </div>

            <div>
              <span className="font-bold text-slate-300">INTERPRETATION:</span>
              <p className="mt-0.5 text-slate-400 leading-relaxed">{story.interpretationText}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/95 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Close Investigation
          </button>

          {onMarkAsSeen && (
            <button
              onClick={() => {
                onMarkAsSeen(story);
                onClose();
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
            >
              Mark as Observed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
