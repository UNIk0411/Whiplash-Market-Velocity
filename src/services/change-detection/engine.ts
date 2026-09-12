import {
  AttentionLevel,
  ChangeSinceLastSeen,
  ChangeStory,
  MarketObservation,
  UserLastSeenState,
} from '../market-data/types';
import { ChangeClassifier } from './change-types';
import { SignalCalculator } from './signals';
import { StoryGenerator } from './story-generator';

export class ChangeDetectionEngine {
  /**
   * Primary entry point to compute a complete ChangeStory from a market observation.
   */
  public static analyze(
    obs: MarketObservation,
    lastSeenState?: UserLastSeenState,
    timelineData?: Array<{ time: string; price: number; volumeRatio: number; eventNote?: string }>
  ): ChangeStory {
    // 1. Calculate individual signals
    const signals = SignalCalculator.calculateAllSignals(obs, lastSeenState);

    // 2. Calculate weighted meaningfulness score (0 to 100)
    let rawScore = 0;
    let totalWeight = 0;

    for (const sig of signals) {
      if (sig.id !== 'DATA_QUALITY') {
        rawScore += sig.score * sig.weight;
        totalWeight += sig.weight;
      }
    }

    let meaningfulnessScore = Math.round(totalWeight > 0 ? rawScore / totalWeight : 0);

    // Adjust for data confidence
    meaningfulnessScore = Math.round(meaningfulnessScore * obs.confidence);

    // Cap between 0 and 100
    meaningfulnessScore = Math.max(0, Math.min(100, meaningfulnessScore));

    // 3. Map score to Attention Level
    let attentionLevel: AttentionLevel = 'NORMAL';
    if (meaningfulnessScore >= 75) {
      attentionLevel = 'HIGH';
    } else if (meaningfulnessScore >= 55) {
      attentionLevel = 'ATTENTION';
    } else if (meaningfulnessScore >= 32) {
      attentionLevel = 'NOTABLE';
    } else {
      attentionLevel = 'NORMAL';
    }

    // 4. Classify semantic change types
    const changeTypes = ChangeClassifier.classify(obs, signals);

    // 5. Generate transparent natural language explanation
    const { summary, observationText, interpretationText } = StoryGenerator.generateExplanation(
      obs,
      meaningfulnessScore,
      changeTypes,
      signals
    );

    // 6. Calculate delta since user's last observation
    let changeSinceLastSeen: ChangeSinceLastSeen | undefined;
    if (lastSeenState) {
      const priceDelta = obs.price - lastSeenState.lastSeenPrice;
      const percentDelta =
        lastSeenState.lastSeenPrice > 0
          ? ((obs.price - lastSeenState.lastSeenPrice) / lastSeenState.lastSeenPrice) * 100
          : 0;

      const volumeRatioVsPrevious =
        lastSeenState.lastSeenVolume > 0
          ? Number((obs.volume / lastSeenState.lastSeenVolume).toFixed(1))
          : 1.0;

      const timeDiffMinutes = Math.round(
        (new Date().getTime() - new Date(lastSeenState.lastSeenTimestamp).getTime()) / (1000 * 60)
      );

      let timeDeltaHuman = `${timeDiffMinutes}m ago`;
      if (timeDiffMinutes >= 1440) {
        timeDeltaHuman = `${Math.floor(timeDiffMinutes / 1440)}d ago`;
      } else if (timeDiffMinutes >= 60) {
        timeDeltaHuman = `${Math.floor(timeDiffMinutes / 60)}h ago`;
      }

      changeSinceLastSeen = {
        priceDelta,
        percentDelta,
        volumeRatioVsPrevious,
        timeDeltaHuman,
        attentionShift: `${lastSeenState.lastSeenAttention} → ${attentionLevel}`,
        lastSeenTimestamp: lastSeenState.lastSeenTimestamp,
      };
    }

    const defaultTimeline = [
      { time: '09:30 AM', price: obs.open, volumeRatio: 1.0, eventNote: 'Market Open' },
      { time: '12:00 PM', price: (obs.open + obs.price) / 2, volumeRatio: 1.2 },
      { time: '03:30 PM', price: obs.price, volumeRatio: Number((obs.volume / obs.avgVolume).toFixed(1)), eventNote: 'Latest State' },
    ];

    return {
      id: `story-${obs.symbol}-${Date.now()}`,
      symbol: obs.symbol,
      companyName: obs.companyName,
      sector: obs.sector,
      currentPrice: obs.price,
      currentVolume: obs.volume,
      absoluteChange: obs.change,
      percentChange: obs.changePercent,
      changeSinceLastSeen,
      meaningfulnessScore,
      attentionLevel,
      changeTypes,
      signals,
      freshness: obs.freshness,
      confidence: obs.confidence,
      summary,
      observationText,
      interpretationText,
      timestamp: obs.observedAt,
      marketContext: {
        marketReturn: obs.marketReturn,
        sectorReturn: obs.sectorReturn,
        sectorName: obs.sector,
      },
      timeline: timelineData && timelineData.length > 0 ? timelineData : defaultTimeline,
    };
  }
}
