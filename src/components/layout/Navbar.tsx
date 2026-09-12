'use client';

import React from 'react';
import { RefreshCw, Layers } from 'lucide-react';
import { Watchlist } from '@/services/market-data/types';

interface NavbarProps {
  watchlists: Watchlist[];
  activeWatchlistId: string;
  onSelectWatchlist: (id: string) => void;
  onOpenWatchlistManager: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  watchlists,
  activeWatchlistId,
  onSelectWatchlist,
  onOpenWatchlistManager,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Clean Professional Brand Header */}
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-white uppercase font-sans">
            WHIPLASH
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Smart Market Awareness & Change Engine
          </p>
        </div>

        {/* Watchlist Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Watchlist Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={activeWatchlistId}
              onChange={(e) => onSelectWatchlist(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none sm:text-sm"
            >
              {watchlists.map((wl) => (
                <option key={wl.id} value={wl.id}>
                  {wl.name} ({wl.symbols.length})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenWatchlistManager}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Manage Watchlists"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Manage</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-600/20 hover:text-blue-200 disabled:opacity-50"
            title="Refresh live market data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Market</span>
          </button>
        </div>
      </div>
    </header>
  );
};
