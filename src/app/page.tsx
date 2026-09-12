'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ReturnBanner } from '@/components/attention/ReturnBanner';
import { ChangeStoryCard } from '@/components/attention/ChangeStoryCard';
import { NormalSymbolRow } from '@/components/attention/NormalSymbolRow';
import { WhyPanelModal } from '@/components/forensic/WhyPanelModal';
import { WatchlistManager } from '@/components/watchlist/WatchlistManager';
import { FirstTimeBaselineModal } from '@/components/onboarding/FirstTimeBaselineModal';
import { AttentionFeedResponse } from '@/services/attention/queue-service';
import { ChangeStory, UserLastSeenState, Watchlist, WatchlistItem } from '@/services/market-data/types';
import { AlertCircle, Activity, ShieldCheck, Check } from 'lucide-react';

const WATCHLIST_STORAGE_KEY = 'whiplash-watchlists-v1';
const BASELINE_STORAGE_KEY = 'whiplash-baselines-v1';

export default function AttentionBoardPage() {
  const [feed, setFeed] = useState<AttentionFeedResponse | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('wl_default_us_tech');
  const [selectedStory, setSelectedStory] = useState<ChangeStory | null>(null);
  const [isWatchlistManagerOpen, setIsWatchlistManagerOpen] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getUserId = () => {
    const key = 'whiplash-user-id';
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
    }
    return id;
  };

  const getBaselines = (): Record<string, UserLastSeenState> => {
    try {
      return JSON.parse(window.localStorage.getItem(BASELINE_STORAGE_KEY) || '{}') as Record<string, UserLastSeenState>;
    } catch {
      return {};
    }
  };

  const saveWatchlists = (nextWatchlists: Watchlist[]) => {
    setWatchlists(nextWatchlists);
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextWatchlists));
  };

  // Fetch Watchlists
  const fetchWatchlists = async () => {
    try {
      const saved = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlists(parsed as Watchlist[]);
          return parsed as Watchlist[];
        }
      }
      const res = await fetch('/api/watchlists');
      const data = await res.json();
      if (Array.isArray(data)) {
        saveWatchlists(data);
        return data as Watchlist[];
      }
    } catch (err) {
      console.error('Failed to fetch watchlists:', err);
    }
    return [] as Watchlist[];
  };

  // Fetch Attention Feed
  const fetchAttentionFeed = async (wlId?: string, triggerCompareAnimation = false, symbolsOverride?: string[]) => {
    if (triggerCompareAnimation) {
      setIsComparing(true);
    }
    setLoading(true);
    try {
      const targetWlId = wlId || activeWatchlistId;
      const symbols = symbolsOverride || watchlists.find((watchlist) => watchlist.id === targetWlId)?.symbols.map((item) => item.symbol) || [];
      const params = new URLSearchParams({ watchlistId: targetWlId, userId: getUserId() });
      if (symbols.length) params.set('symbols', symbols.join(','));
      const baselines = getBaselines();
      if (Object.keys(baselines).length) params.set('baselines', JSON.stringify(baselines));
      const res = await fetch(`/api/market/attention?${params.toString()}`);
      if (!res.ok) throw new Error('Could not load live market data');
      const data: AttentionFeedResponse = await res.json();
      setFeed(data);
      setError(null);

      if (!data.summary.userBaselineEstablished) {
        setIsFirstTimeModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch attention feed:', err);
      setError(err instanceof Error ? err.message : 'Unable to load live market data.');
    } finally {
      setLoading(false);
      if (triggerCompareAnimation) {
        setTimeout(() => setIsComparing(false), 1200);
      }
    }
  };

  useEffect(() => {
    void (async () => {
      const initialWatchlists = await fetchWatchlists();
      const initialSymbols = initialWatchlists.find((watchlist) => watchlist.id === activeWatchlistId)?.symbols.map((item) => item.symbol) || [];
      await fetchAttentionFeed(activeWatchlistId, true, initialSymbols);
    })();
  }, []);

  const handleSelectWatchlist = (id: string) => {
    setActiveWatchlistId(id);
    void fetchAttentionFeed(id, true);
  };

  const handleInvestigate = async (symbol: string) => {
    try {
      const res = await fetch(`/api/market/investigate/${encodeURIComponent(symbol)}?userId=${encodeURIComponent(getUserId())}`);
      if (!res.ok) throw new Error('Could not load investigation');
      const story: ChangeStory = await res.json();
      setSelectedStory(story);
    } catch (err) {
      console.error('Failed to load investigation details:', err);
    }
  };

  const handleMarkAsSeen = async (story: ChangeStory) => {
    try {
      const baseline: UserLastSeenState = {
        symbol: story.symbol,
        lastSeenTimestamp: new Date().toISOString(),
        lastSeenPrice: story.currentPrice,
        lastSeenVolume: story.currentVolume,
        lastSeenScore: story.meaningfulnessScore,
        lastSeenAttention: story.attentionLevel,
      };
      const baselines = getBaselines();
      window.localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify({ ...baselines, [story.symbol]: baseline }));
      const response = await fetch('/api/user/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: story.symbol,
          price: story.currentPrice,
          volume: story.currentVolume,
          score: story.meaningfulnessScore,
          attention: story.attentionLevel,
          userId: getUserId(),
        }),
      });
      if (!response.ok) throw new Error('Could not save observation');

      // Refresh feed
      void fetchAttentionFeed(activeWatchlistId, false);
    } catch (err) {
      console.error('Failed to mark story as seen:', err);
    }
  };

  const handleResetDemo = () => fetchAttentionFeed(activeWatchlistId, true);

  const handleCreateWatchlist = async (name: string) => {
    try {
      const newWatchlist: Watchlist = { id: crypto.randomUUID(), name: name.trim(), isDefault: false, symbols: [], createdAt: new Date().toISOString() };
      saveWatchlists([...watchlists, newWatchlist]);
    } catch (err) {
      console.error('Failed to create watchlist:', err);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    try {
      if (watchlists.find((watchlist) => watchlist.id === id && !watchlist.isDefault)) {
        saveWatchlists(watchlists.filter((watchlist) => watchlist.id !== id));
        setActiveWatchlistId('wl_default_us_tech');
        void fetchAttentionFeed('wl_default_us_tech', true);
      }
    } catch (err) {
      console.error('Failed to delete watchlist:', err);
    }
  };

  const handleAddSymbol = async (watchlistId: string, symbol: string) => {
    try {
      const res = await fetch(`/api/market/lookup/${encodeURIComponent(symbol.trim().toUpperCase())}`);
      if (res.ok) {
        const quote = await res.json() as Pick<WatchlistItem, 'symbol' | 'companyName' | 'sector'>;
        const nextWatchlists = watchlists.map((watchlist) => watchlist.id === watchlistId && !watchlist.symbols.some((item) => item.symbol === quote.symbol)
          ? { ...watchlist, symbols: [...watchlist.symbols, { ...quote, id: crypto.randomUUID(), addedAt: new Date().toISOString() }] }
          : watchlist);
        saveWatchlists(nextWatchlists);
        void fetchAttentionFeed(watchlistId, false, nextWatchlists.find((watchlist) => watchlist.id === watchlistId)?.symbols.map((item) => item.symbol));
      } else {
        throw new Error((await res.json() as { error?: string }).error || 'Ticker was not found.');
      }
    } catch (err) {
      console.error('Failed to add symbol:', err);
    }
  };

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    try {
      const nextWatchlists = watchlists.map((watchlist) => watchlist.id === watchlistId
        ? { ...watchlist, symbols: watchlist.symbols.filter((item) => item.symbol !== symbol) }
        : watchlist);
      saveWatchlists(nextWatchlists);
      void fetchAttentionFeed(watchlistId, false, nextWatchlists.find((watchlist) => watchlist.id === watchlistId)?.symbols.map((item) => item.symbol));
    } catch (err) {
      console.error('Failed to remove symbol:', err);
    }
  };

  const allAttentionStories = [
    ...(feed?.highAttention || []),
    ...(feed?.attention || []),
    ...(feed?.notable || []),
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Navbar
        watchlists={watchlists}
        activeWatchlistId={activeWatchlistId}
        onSelectWatchlist={handleSelectWatchlist}
        onOpenWatchlistManager={() => setIsWatchlistManagerOpen(true)}
        onRefresh={handleResetDemo}
        isRefreshing={isComparing}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error} Use Refresh Market to retry.</span>
          </div>
        )}
        {/* Return Banner Hero Section */}
        {feed && (
          <ReturnBanner
            summary={feed.summary}
            isComparing={isComparing}
          />
        )}

        {/* Main Content Area */}
        {loading && !feed ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Activity className="h-6 w-6 animate-spin text-amber-500" />
              <span className="text-xs font-medium">Scanning personal market memory...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Section 1: Ranked Attention Queue */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                  <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                    WHAT DESERVES YOUR ATTENTION?
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {allAttentionStories.length} Meaningful Changes Ranked by Volatility & Baseline Anomaly
                </span>
              </div>

              {allAttentionStories.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
                  <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
                  <h3 className="mt-3 text-base font-bold text-white">All Clear</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    No symbols in your watchlist exceeded normal historical movement thresholds today.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {allAttentionStories.map((story) => (
                    <ChangeStoryCard
                      key={story.id}
                      story={story}
                      onInvestigate={handleInvestigate}
                      onMarkAsSeen={handleMarkAsSeen}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: Watched Symbols That Remained Normal ("Nothing Important Changed") */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-base font-bold tracking-tight text-white uppercase">
                    NOTHING IMPORTANT CHANGED
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {feed?.normalMovements.length || 0} Symbols Within Normal Historical Range
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {feed?.normalMovements.map((story) => (
                  <NormalSymbolRow
                    key={story.id}
                    story={story}
                    onInvestigate={handleInvestigate}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      <WhyPanelModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onMarkAsSeen={handleMarkAsSeen}
      />

      <WatchlistManager
        isOpen={isWatchlistManagerOpen}
        watchlists={watchlists}
        activeWatchlistId={activeWatchlistId}
        onClose={() => setIsWatchlistManagerOpen(false)}
        onCreateWatchlist={handleCreateWatchlist}
        onDeleteWatchlist={handleDeleteWatchlist}
        onAddSymbol={handleAddSymbol}
        onRemoveSymbol={handleRemoveSymbol}
      />

      <FirstTimeBaselineModal
        isOpen={isFirstTimeModalOpen}
        onEstablishBaseline={() => {
          const stories = [...(feed?.highAttention || []), ...(feed?.attention || []), ...(feed?.notable || []), ...(feed?.normalMovements || [])];
          const baselineUpdates = Object.fromEntries(stories.map((story) => [story.symbol, {
            symbol: story.symbol, lastSeenTimestamp: new Date().toISOString(), lastSeenPrice: story.currentPrice,
            lastSeenVolume: story.currentVolume, lastSeenScore: story.meaningfulnessScore, lastSeenAttention: story.attentionLevel,
          }]));
          window.localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify({ ...getBaselines(), ...baselineUpdates }));
          Promise.all(stories.map((story) => fetch('/api/user/observation', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: story.symbol, price: story.currentPrice, volume: story.currentVolume, score: story.meaningfulnessScore, attention: story.attentionLevel, userId: getUserId() }),
          }))).then(() => fetchAttentionFeed(activeWatchlistId, true));
          setIsFirstTimeModalOpen(false);
        }}
      />
    </div>
  );
}
