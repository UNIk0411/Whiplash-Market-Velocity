'use client';

import React, { useState } from 'react';
import { Watchlist } from '@/services/market-data/types';
import { X, Plus, Trash2, Search, Layers, CheckCircle2 } from 'lucide-react';

interface WatchlistManagerProps {
  isOpen: boolean;
  watchlists: Watchlist[];
  activeWatchlistId: string;
  onClose: () => void;
  onCreateWatchlist: (name: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onAddSymbol: (watchlistId: string, symbol: string) => void;
  onRemoveSymbol: (watchlistId: string, symbol: string) => void;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  isOpen,
  watchlists,
  activeWatchlistId,
  onClose,
  onCreateWatchlist,
  onDeleteWatchlist,
  onAddSymbol,
  onRemoveSymbol,
}) => {
  const [newWlName, setNewWlName] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [selectedWlId, setSelectedWlId] = useState(activeWatchlistId);

  if (!isOpen) return null;

  const currentWl = watchlists.find((w) => w.id === selectedWlId) || watchlists[0];

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    onCreateWatchlist(newWlName.trim());
    setNewWlName('');
  };

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolInput.trim() || !currentWl) return;
    onAddSymbol(currentWl.id, symbolInput.trim());
    setSymbolInput('');
  };

  const popularSymbols = ['NVDA', 'AMD', 'MSFT', 'AAPL', 'GOOGL', 'META', 'TSLA', 'AMZN', 'JPM', 'INTC'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Watchlist Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Create New Watchlist */}
          <form onSubmit={handleCreateWatchlist} className="flex gap-2">
            <input
              type="text"
              placeholder="Create new watchlist name..."
              value={newWlName}
              onChange={(e) => setNewWlName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newWlName.trim()}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Create
            </button>
          </form>

          {/* Watchlist Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {watchlists.map((wl) => (
              <div
                key={wl.id}
                onClick={() => setSelectedWlId(wl.id)}
                className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  wl.id === currentWl.id
                    ? 'border-blue-500/50 bg-blue-950/40 text-blue-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{wl.name} ({wl.symbols.length})</span>
                {!wl.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWatchlist(wl.id);
                    }}
                    className="text-slate-500 hover:text-rose-400"
                    title="Delete watchlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Ticker Input */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Add Symbol to "{currentWl.name}"
            </h3>

            <form onSubmit={handleAddSymbol} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter ticker (e.g. NVDA, AMD, AAPL)..."
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!symbolInput.trim()}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add Symbol
              </button>
            </form>

            {/* Quick Add Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Popular:</span>
              {popularSymbols.map((sym) => {
                const isAlreadyInWl = currentWl.symbols.some((s) => s.symbol === sym);
                return (
                  <button
                    key={sym}
                    disabled={isAlreadyInWl}
                    onClick={() => onAddSymbol(currentWl.id, sym)}
                    className={`rounded-lg border px-2 py-0.5 text-[11px] font-mono transition ${
                      isAlreadyInWl
                        ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500 hover:text-white'
                    }`}
                  >
                    + {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Symbols List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Watched Symbols ({currentWl.symbols.length})
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {currentWl.symbols.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white">{item.symbol}</span>
                    <p className="text-[11px] text-slate-400">{item.companyName}</p>
                  </div>
                  <button
                    onClick={() => onRemoveSymbol(currentWl.id, item.symbol)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 bg-slate-900/95 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
