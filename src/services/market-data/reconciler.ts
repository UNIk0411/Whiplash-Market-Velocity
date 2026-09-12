import { FreshnessState, MarketObservation } from './types';

export class DataReconciler {
  /**
   * Calculates freshness state based on observation timestamp vs current time.
   */
  public static calculateFreshness(observedAtIso: string): FreshnessState {
    const timeDiffMs = Date.now() - new Date(observedAtIso).getTime();
    const minutesAgo = timeDiffMs / (1000 * 60);

    if (minutesAgo <= 15) return 'LIVE';
    if (minutesAgo <= 30) return 'RECENT';
    if (minutesAgo <= 120) return 'STALE';
    return 'UNAVAILABLE';
  }

  /**
   * Reconciles multiple observations for the same ticker from different sources.
   * Prefers newer observations, flags discrepancies > 1%, and reduces confidence score.
   */
  public static reconcile(observations: MarketObservation[]): MarketObservation {
    if (!observations || observations.length === 0) {
      throw new Error('Cannot reconcile empty observations list.');
    }

    if (observations.length === 1) {
      const obs = observations[0];
      const computedFreshness = this.calculateFreshness(obs.observedAt);
      return {
        ...obs,
        freshness: obs.freshness === 'STALE' || obs.freshness === 'CLOSED' ? obs.freshness : computedFreshness,
      };
    }

    // Sort by timestamp descending (newest first)
    const sorted = [...observations].sort(
      (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()
    );

    const primary = sorted[0];
    const secondary = sorted[1];

    const priceDiffRatio = Math.abs(primary.price - secondary.price) / primary.price;
    const isConflict = priceDiffRatio > 0.01; // >1% price variance between providers

    let confidence = primary.confidence;
    let conflictWarning: string | undefined = primary.conflictWarning;

    if (isConflict) {
      confidence = Math.min(confidence, 0.65);
      conflictWarning = `Market data disagreement: ${primary.source} ($${primary.price.toFixed(
        2
      )}) vs ${secondary.source} ($${secondary.price.toFixed(
        2
      )}). Confidence reduced.`;
    }

    const computedFreshness = this.calculateFreshness(primary.observedAt);

    return {
      ...primary,
      confidence,
      freshness: primary.freshness === 'STALE' || primary.freshness === 'CLOSED' ? primary.freshness : computedFreshness,
      conflictWarning,
    };
  }

  /**
   * Prevents older out-of-order data from overwriting newer stored data.
   */
  public static isNewer(incomingObservedAt: string, existingObservedAt: string): boolean {
    return new Date(incomingObservedAt).getTime() > new Date(existingObservedAt).getTime();
  }
}
