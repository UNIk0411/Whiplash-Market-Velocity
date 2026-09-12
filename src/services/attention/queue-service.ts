import { ChangeDetectionEngine } from '../change-detection/engine';
import { MarketDataProvider } from '../market-data/provider-interface';
import { marketDataProvider } from '../market-data/provider';
import { DataReconciler } from '../market-data/reconciler';
import {
  AttentionFeedSummary,
  ChangeStory,
  MarketObservation,
  UserLastSeenState,
} from '../market-data/types';
import { SnapshotService } from '../snapshot/snapshot-service';
import { UserMemoryService } from '../user-state/memory-service';
import { WatchlistService } from '../watchlist/watchlist-service';

export interface AttentionFeedResponse {
  summary: AttentionFeedSummary;
  highAttention: ChangeStory[];
  attention: ChangeStory[];
  notable: ChangeStory[];
  normalMovements: ChangeStory[];
  providerInfo: { name: string };
}

export class AttentionQueueService {
  private static provider: MarketDataProvider = marketDataProvider;

  public static setProvider(newProvider: MarketDataProvider): void {
    this.provider = newProvider;
  }

  public static async getAttentionFeed(
    userId: string = 'anonymous',
    watchlistId?: string,
    requestedSymbols?: string[],
    persistedBaselines?: Record<string, UserLastSeenState>
  ): Promise<AttentionFeedResponse> {
    // Get active watchlist
    const watchlists = WatchlistService.getWatchlists();
    const activeWl = watchlistId
      ? watchlists.find((w) => w.id === watchlistId) || watchlists[0]
      : watchlists[0];

    const symbols = requestedSymbols?.length ? requestedSymbols : activeWl.symbols.map((s) => s.symbol);

    // Fetch batch observations
    const rawObservations = await this.provider.getBatchObservations(symbols);

    // Reconcile and calculate freshness
    const reconciledObs: MarketObservation[] = rawObservations.map((obs: MarketObservation) =>
      DataReconciler.reconcile([obs])
    );

    const stories: ChangeStory[] = [];

    for (const obs of reconciledObs) {
      // 1. Idempotently record snapshot
      SnapshotService.recordSnapshot(obs);

      // 2. Fetch user last-seen baseline
      const lastSeen = persistedBaselines?.[obs.symbol] || UserMemoryService.getUserLastSeen(userId, obs.symbol);

      // 3. Fetch forensic timeline data
      const timeline = await this.provider.getTimeline(obs.symbol);

      // 4. Run change detection engine
      const story = ChangeDetectionEngine.analyze(obs, lastSeen, timeline);
      stories.push(story);
    }

    // Rank stories using: score * confidence
    stories.sort((a, b) => {
      const rankA = a.meaningfulnessScore * a.confidence;
      const rankB = b.meaningfulnessScore * b.confidence;
      return rankB - rankA;
    });

    const highAttention = stories.filter((s) => s.attentionLevel === 'HIGH');
    const attention = stories.filter((s) => s.attentionLevel === 'ATTENTION');
    const notable = stories.filter((s) => s.attentionLevel === 'NOTABLE');
    const normalMovements = stories.filter((s) => s.attentionLevel === 'NORMAL');

    const meaningfulCount = highAttention.length + attention.length + notable.length;

    // Determine user baseline state
    const userBaselineEstablished = symbols.some((sym) =>
      Boolean(persistedBaselines?.[sym] || UserMemoryService.getUserLastSeen(userId, sym))
    );

    const summary: AttentionFeedSummary = {
      totalWatched: symbols.length,
      meaningfulChangesCount: meaningfulCount,
      highAttentionCount: highAttention.length,
      ordinaryMovementsCount: normalMovements.length,
      lastCheckedTimeAgo: 'just now',
      marketStatus: this.marketStatus(),
      userBaselineEstablished,
    };

    return {
      summary,
      highAttention,
      attention,
      notable,
      normalMovements,
      providerInfo: this.provider.getProviderInfo(),
    };
  }

  private static marketStatus(): 'OPEN' | 'CLOSED' | 'WEEKEND' {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts();
    const weekday = parts.find((part) => part.type === 'weekday')?.value;
    if (weekday === 'Sat' || weekday === 'Sun') return 'WEEKEND';
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    return hour >= 9 && hour < 16 ? 'OPEN' : 'CLOSED';
  }
}
