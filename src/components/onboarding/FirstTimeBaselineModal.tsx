'use client';

import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface FirstTimeBaselineModalProps {
  isOpen: boolean;
  onEstablishBaseline: () => void;
}

export const FirstTimeBaselineModal: React.FC<FirstTimeBaselineModalProps> = ({
  isOpen,
  onEstablishBaseline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-[#0d1322] to-slate-950 p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Establish Market Baseline
        </h2>

        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          <strong className="text-blue-400">WHIPLASH</strong> tracks meaningful market shifts relative to your personal observation baseline. We will snapshot your current assets now so you can immediately see what changed when you return.
        </p>

        <div className="my-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Snapshot current price, volume, and sector baselines</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Track 10-signal volatility & volume anomalies</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Generate transparent non-causal change stories</span>
          </div>
        </div>

        <button
          onClick={onEstablishBaseline}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-blue-500 transition"
        >
          <span>Establish Baseline & Enter</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
