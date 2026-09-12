import { MarketObservation, SignalResult, UserLastSeenState } from '../market-data/types';

export class SignalCalculator {
  public static calculateAllSignals(
    obs: MarketObservation,
    lastSeenState?: UserLastSeenState
  ): SignalResult[] {
    const signals: SignalResult[] = [];

    // Signal 1: Price Movement Magnitude
    const absMove = Math.abs(obs.changePercent);
    const priceMoveScore = Math.min(100, Math.round((absMove / 4.0) * 100));
    signals.push({
      id: 'PRICE_MOVE',
      name: 'Price Movement',
      score: priceMoveScore,
      weight: 0.25,
      status: absMove >= 2.5 ? 'positive' : 'neutral',
      description: `${obs.changePercent >= 0 ? '+' : ''}${obs.changePercent.toFixed(1)}% price change today`,
      evidenceValue: `${obs.changePercent >= 0 ? '+' : ''}${obs.changePercent.toFixed(1)}%`,
    });

    // Signal 2: Volatility Ratio
    const volRatio = obs.volatility > 0 ? absMove / obs.volatility : 1.0;
    const volScore = Math.min(100, Math.round(volRatio * 45));
    signals.push({
      id: 'VOLATILITY_RATIO',
      name: 'Volatility Anomaly',
      score: volScore,
      weight: 0.2,
      status: volRatio >= 1.8 ? 'positive' : 'neutral',
      description: `${volRatio.toFixed(1)}× relative to symbol's 20-day historical volatility (${obs.volatility.toFixed(1)}%)`,
      evidenceValue: `${volRatio.toFixed(1)}× volatility`,
    });

    // Signal 3: Volume Anomaly
    const volRatioVsAvg = obs.avgVolume > 0 ? obs.volume / obs.avgVolume : 1.0;
    const volumeScore = Math.min(100, Math.round(Math.max(0, volRatioVsAvg - 1) * 70));
    signals.push({
      id: 'VOLUME_CONFIRMATION',
      name: 'Volume Confirmation',
      score: volumeScore,
      weight: 0.2,
      status: volRatioVsAvg >= 1.5 ? 'positive' : 'neutral',
      description: `${volRatioVsAvg.toFixed(1)}× typical daily volume (${(obs.volume / 1e6).toFixed(1)}M shares)`,
      evidenceValue: `${volRatioVsAvg.toFixed(1)}× volume`,
    });

    // Signal 4: Market Index Divergence
    const marketDivergence = obs.changePercent - obs.marketReturn;
    const marketDivScore = Math.min(100, Math.round(Math.abs(marketDivergence) * 20));
    signals.push({
      id: 'MARKET_DIVERGENCE',
      name: 'Market Divergence',
      score: marketDivScore,
      weight: 0.1,
      status: Math.abs(marketDivergence) >= 2.0 ? 'positive' : 'neutral',
      description: `Separated by ${marketDivergence >= 0 ? '+' : ''}${marketDivergence.toFixed(1)}% from broader market (S&P 500 ${obs.marketReturn >= 0 ? '+' : ''}${obs.marketReturn.toFixed(1)}%)`,
      evidenceValue: `${marketDivergence >= 0 ? '+' : ''}${marketDivergence.toFixed(1)}% vs S&P`,
    });

    // Signal 5: Sector Divergence
    const sectorDivergence = obs.changePercent - obs.sectorReturn;
    const sectorDivScore = Math.min(100, Math.round(Math.abs(sectorDivergence) * 25));
    signals.push({
      id: 'SECTOR_DIVERGENCE',
      name: 'Sector Divergence',
      score: sectorDivScore,
      weight: 0.15,
      status: Math.abs(sectorDivergence) >= 2.0 ? 'positive' : 'neutral',
      description: `Moved ${sectorDivergence >= 0 ? '+' : ''}${sectorDivergence.toFixed(1)}% relative to ${obs.sector} sector benchmark (${obs.sectorReturn >= 0 ? '+' : ''}${obs.sectorReturn.toFixed(1)}%)`,
      evidenceValue: `${sectorDivergence >= 0 ? '+' : ''}${sectorDivergence.toFixed(1)}% vs Sector`,
    });

    // Signal 6: Intraday Reversal / Gap
    const intradayRange = ((obs.high - obs.low) / obs.price) * 100;
    const openedOpposite =
      (obs.open > obs.price && obs.changePercent > 0) ||
      (obs.open < obs.price && obs.changePercent < 0);
    const reversalScore = openedOpposite && intradayRange > 2.5 ? 80 : Math.min(60, Math.round(intradayRange * 15));
    signals.push({
      id: 'INTRADAY_DYNAMICS',
      name: 'Intraday Dynamics',
      score: reversalScore,
      weight: 0.05,
      status: reversalScore >= 70 ? 'warning' : 'neutral',
      description: `Intraday span of ${intradayRange.toFixed(1)}% between low ($${obs.low.toFixed(2)}) and high ($${obs.high.toFixed(2)})`,
      evidenceValue: `$${obs.low.toFixed(2)} - $${obs.high.toFixed(2)}`,
    });

    // Signal 7: Data Freshness & Reliability
    const freshnessScore = obs.freshness === 'LIVE' ? 100 : obs.freshness === 'RECENT' || obs.freshness === 'CLOSED' ? 80 : 30;
    signals.push({
      id: 'DATA_QUALITY',
      name: 'Data Reliability',
      score: Math.round(freshnessScore * obs.confidence),
      weight: 0.05,
      status: obs.freshness === 'STALE' || obs.confidence < 0.8 ? 'warning' : 'positive',
      description: obs.conflictWarning
        ? obs.conflictWarning
        : obs.freshness === 'CLOSED'
          ? `Market is closed. Showing the latest official close (Confidence: ${Math.round(obs.confidence * 100)}%).`
          : `Data is ${obs.freshness.toLowerCase()} (Confidence: ${Math.round(obs.confidence * 100)}%)`,
      evidenceValue: obs.freshness,
    });

    // Signal 8: User Memory Delta Signal
    if (lastSeenState) {
      const deltaPercent = ((obs.price - lastSeenState.lastSeenPrice) / lastSeenState.lastSeenPrice) * 100;
      const userDeltaScore = Math.min(100, Math.round(Math.abs(deltaPercent) * 20));
      signals.push({
        id: 'USER_MEMORY_DELTA',
        name: 'Since Last Observation',
        score: userDeltaScore,
        weight: 0.1,
        status: Math.abs(deltaPercent) >= 2.0 ? 'positive' : 'neutral',
        description: `${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(1)}% change since you last checked`,
        evidenceValue: `${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`,
      });
    }

    return signals;
  }
}
