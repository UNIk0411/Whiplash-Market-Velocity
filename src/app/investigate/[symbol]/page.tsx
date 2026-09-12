'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChangeStory } from '@/services/market-data/types';
import { ArrowLeft, Clock, BarChart2, ShieldCheck, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function ForensicInvestigatePage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();
  const [story, setStory] = useState<ChangeStory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!symbol) return;
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/market/investigate/${symbol}`);
        const data = await res.json();
        setStory(data);
      } catch (err) {
        console.error('Failed to fetch investigation story:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [symbol]);

  if (loading || !story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-white">
        <div className="text-center text-xs text-slate-400">Loading forensic timeline for {symbol}...</div>
      </div>
    );
  }

  const isPositive = story.percentChange >= 0;

  const relativeData = [
    { name: story.symbol, return: story.percentChange, fill: isPositive ? '#10b981' : '#f43f5e' },
    { name: `${story.sector} Sector`, return: story.marketContext.sectorReturn, fill: '#3b82f6' },
    { name: 'S&P 500 Market', return: story.marketContext.marketReturn, fill: '#64748b' },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Attention Board
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white">{story.symbol}</h1>
              <span className="text-sm text-slate-400">{story.companyName}</span>
            </div>
            <p className="text-xs text-blue-400 font-medium mt-1">
              FORENSIC INVESTIGATION & EVIDENCE REPORT
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-white">${story.currentPrice.toFixed(2)}</div>
            <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{story.percentChange.toFixed(1)}% today
            </div>
          </div>
        </div>

        {/* Forensic Timeline */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            <Clock className="h-4 w-4 text-blue-400" /> TIMELINE BREAKDOWN
          </h3>
          <div className="space-y-4">
            {story.timeline.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-4 border-l-2 border-slate-800">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                <div className="w-20 text-xs font-mono text-slate-400">{step.time}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">${step.price.toFixed(2)}</div>
                  {step.eventNote && <p className="text-xs text-slate-400 mt-0.5">{step.eventNote}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            10-SIGNAL EVIDENCE MATRIX
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {story.signals.map((sig) => (
              <div key={sig.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {sig.name}
                  </span>
                  <span className="text-blue-400">{sig.score}%</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{sig.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
