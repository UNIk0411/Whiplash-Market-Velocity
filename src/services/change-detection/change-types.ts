import { ChangeType, MarketObservation, SignalResult } from '../market-data/types';

export class ChangeClassifier {
  public static classify(obs: MarketObservation, signals: SignalResult[]): ChangeType[] {
    const types: ChangeType[] = [];

    const absMove = Math.abs(obs.changePercent);
    const volRatio = obs.avgVolume > 0 ? obs.volume / obs.avgVolume : 1.0;
    const volRatioVol = obs.volatility > 0 ? absMove / obs.volatility : 1.0;
    const sectorDiv = Math.abs(obs.changePercent - obs.sectorReturn);
    const marketDiv = Math.abs(obs.changePercent - obs.marketReturn);

    // DATA WARNING
    if (obs.freshness === 'STALE' || obs.confidence < 0.8 || obs.conflictWarning) {
      types.push('DATA_WARNING');
    }

    // PRICE SHOCK
    if (absMove >= 3.5 || volRatioVol >= 2.0) {
      types.push('PRICE_SHOCK');
    }

    // VOLUME SHOCK
    if (volRatio >= 1.8) {
      types.push('VOLUME_SHOCK');
    }

    // DIVERGENCE
    if (sectorDiv >= 2.5 || (obs.changePercent * obs.sectorReturn < 0 && absMove >= 1.5)) {
      types.push('DIVERGENCE');
    }

    // REVERSAL
    const intradayRange = ((obs.high - obs.low) / obs.price) * 100;
    const peakToCloseDrop = ((obs.high - obs.price) / obs.high) * 100;
    if (peakToCloseDrop >= 2.5 && intradayRange >= 3.0) {
      types.push('REVERSAL');
    }

    // VOLATILITY EXPANSION
    if (volRatioVol >= 1.8 && absMove >= 2.0) {
      types.push('VOLATILITY_EXPANSION');
    }

    // RELATIVE OUTPERFORMANCE
    if (obs.changePercent > 1.5 && marketDiv >= 1.5 && sectorDiv >= 1.0) {
      types.push('RELATIVE_OUTPERFORMANCE');
    }

    // QUIET BREAK
    if (absMove >= 1.2 && absMove <= 2.2 && volRatio < 1.1 && volRatioVol > 1.2) {
      types.push('QUIET_BREAK');
    }

    return types;
  }
}
