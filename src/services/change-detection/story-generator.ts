import { ChangeType, MarketObservation, SignalResult } from '../market-data/types';

export class StoryGenerator {
  public static generateExplanation(
    obs: MarketObservation,
    meaningfulnessScore: number,
    changeTypes: ChangeType[],
    signals: SignalResult[]
  ): { summary: string; observationText: string; interpretationText: string } {
    const sign = obs.changePercent >= 0 ? '+' : '';
    const volRatio = (obs.volume / Math.max(1, obs.avgVolume)).toFixed(1);
    const sectorDiv = (obs.changePercent - obs.sectorReturn).toFixed(1);
    const sectorSign = Number(sectorDiv) >= 0 ? '+' : '';

    // Summary
    let summary = '';
    if (changeTypes.includes('PRICE_SHOCK') && changeTypes.includes('VOLUME_SHOCK')) {
      summary = `Unusually large ${obs.changePercent >= 0 ? 'surge' : 'decline'} confirmed by ${volRatio}× baseline volume.`;
    } else if (changeTypes.includes('DIVERGENCE')) {
      summary = `Moving independently from ${obs.sector} sector benchmark (${sectorSign}${sectorDiv}% divergence).`;
    } else if (changeTypes.includes('REVERSAL')) {
      summary = `Significant intraday direction reversal after reaching intraday high.`;
    } else if (changeTypes.includes('RELATIVE_OUTPERFORMANCE')) {
      summary = `Clear relative outperformance against broader market indices.`;
    } else if (meaningfulnessScore >= 60) {
      summary = `Notable price movement relative to typical ${obs.symbol} daily behavior.`;
    } else {
      summary = `Normal movement. Nothing meaningfully different from recent behavior.`;
    }

    // Strict Observation Text (No causation)
    const observationText = `${obs.symbol} moved ${sign}${obs.changePercent.toFixed(
      1
    )}% today (current price: $${obs.price.toFixed(2)}). Trading volume is ${volRatio}× its 20-day baseline (${(
      obs.volume / 1e6
    ).toFixed(1)}M shares), while the broader ${obs.sector} sector benchmark moved ${
      obs.sectorReturn >= 0 ? '+' : ''
    }${obs.sectorReturn.toFixed(1)}% and the S&P 500 moved ${
      obs.marketReturn >= 0 ? '+' : ''
    }${obs.marketReturn.toFixed(1)}%.`;

    // Interpretation Text (Explains why interesting without unsupported external causation)
    let interpretationText = '';
    if (meaningfulnessScore >= 80) {
      interpretationText = `The available market data suggests this move is materially stock-specific and unusually large relative to ${obs.symbol}'s recent volatility range (${obs.volatility.toFixed(
        1
      )}%). Strong volume expansion provides statistical confirmation that this is not ordinary noise.`;
    } else if (meaningfulnessScore >= 60) {
      interpretationText = `The movement exceeds typical daily fluctuations for ${obs.symbol}, standing out from sector peers. While not an extreme outlier, it warrants monitoring given the volume activity.`;
    } else if (meaningfulnessScore >= 35) {
      interpretationText = `Moderate activity detected. The price move is slightly elevated, but broader market conditions explain a portion of the movement.`;
    } else {
      interpretationText = `The price and volume behavior align with ${obs.symbol}'s normal historical baseline. There are no statistical anomalies or sector divergences present.`;
    }

    if (obs.freshness === 'STALE' || obs.conflictWarning) {
      interpretationText += ` CAUTION: Market data freshness or provider disagreement noted. Confidence has been adjusted accordingly.`;
    }

    return {
      summary,
      observationText,
      interpretationText,
    };
  }
}
