export type FreshnessState = 'LIVE' | 'RECENT' | 'CLOSED' | 'STALE' | 'UNAVAILABLE';

export type AttentionLevel = 'NORMAL' | 'NOTABLE' | 'ATTENTION' | 'HIGH';

export type ChangeType =
  | 'PRICE_SHOCK'
  | 'VOLUME_SHOCK'
  | 'DIVERGENCE'
  | 'REVERSAL'
  | 'VOLATILITY_EXPANSION'
  | 'QUIET_BREAK'
  | 'RELATIVE_OUTPERFORMANCE'
  | 'DATA_WARNING';

export interface MarketObservation {
  symbol: string;
  companyName: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number; // 20-day baseline
  volatility: number; // typical % range / stddev
  high: number;
  low: number;
  open: number;
  marketReturn: number; // S&P 500 benchmark % change
  sectorReturn: number; // Sector benchmark % change
  source: string;
  freshness: FreshnessState;
  confidence: number; // 0.0 to 1.0
  observedAt: string; // ISO string
  conflictWarning?: string;
}

export interface SignalResult {
  id: string;
  name: string;
  score: number; // 0 to 100
  weight: number; // 0 to 1.0
  status: 'positive' | 'negative' | 'neutral' | 'warning';
  description: string;
  evidenceValue: string;
}

export interface UserLastSeenState {
  symbol: string;
  lastSeenTimestamp: string;
  lastSeenPrice: number;
  lastSeenVolume: number;
  lastSeenScore: number;
  lastSeenAttention: AttentionLevel;
}

export interface ChangeSinceLastSeen {
  priceDelta: number;
  percentDelta: number;
  volumeRatioVsPrevious: number;
  timeDeltaHuman: string;
  attentionShift: string; // e.g. "NORMAL → HIGH"
  lastSeenTimestamp: string;
}

export interface ChangeStory {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  currentVolume: number;
  absoluteChange: number;
  percentChange: number;
  changeSinceLastSeen?: ChangeSinceLastSeen;
  meaningfulnessScore: number; // 0 - 100
  attentionLevel: AttentionLevel;
  changeTypes: ChangeType[];
  signals: SignalResult[];
  freshness: FreshnessState;
  confidence: number;
  summary: string;
  observationText: string;
  interpretationText: string;
  timestamp: string;
  marketContext: {
    marketReturn: number;
    sectorReturn: number;
    sectorName: string;
  };
  timeline: Array<{
    time: string;
    price: number;
    volumeRatio: number;
    eventNote?: string;
  }>;
}

export interface Watchlist {
  id: string;
  name: string;
  isDefault: boolean;
  symbols: WatchlistItem[];
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  addedAt: string;
}

export interface AttentionFeedSummary {
  totalWatched: number;
  meaningfulChangesCount: number;
  highAttentionCount: number;
  ordinaryMovementsCount: number;
  lastCheckedTimeAgo: string;
  marketStatus: 'OPEN' | 'CLOSED' | 'WEEKEND';
  userBaselineEstablished: boolean;
}
