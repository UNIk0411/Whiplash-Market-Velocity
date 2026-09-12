import { describe, expect, it } from 'vitest';
import { ChangeDetectionEngine } from '../services/change-detection/engine';
import { SignalCalculator } from '../services/change-detection/signals';
import { MarketObservation } from '../services/market-data/types';

describe('ChangeDetectionEngine', () => {
  const baseObs: MarketObservation = {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    price: 128.45,
    change: 5.88,
    changePercent: 4.8,
    volume: 78500000,
    avgVolume: 32700000, // 2.4x volume ratio
    volatility: 2.1,
    high: 129.1,
    low: 123.0,
    open: 123.5,
    marketReturn: 0.4,
    sectorReturn: 1.0,
    source: 'Nasdaq Realtime',
    freshness: 'LIVE',
    confidence: 0.98,
    observedAt: new Date().toISOString(),
  };

  it('calculates HIGH attention score for NVDA price shock and volume anomaly', () => {
    const story = ChangeDetectionEngine.analyze(baseObs);
    expect(story.meaningfulnessScore).toBeGreaterThanOrEqual(75);
    expect(story.attentionLevel).toBe('HIGH');
    expect(story.changeTypes).toContain('PRICE_SHOCK');
    expect(story.changeTypes).toContain('VOLUME_SHOCK');
    expect(story.changeTypes).toContain('DIVERGENCE');
  });

  it('calculates NORMAL attention score for ordinary price movements', () => {
    const normalObs: MarketObservation = {
      ...baseObs,
      symbol: 'AAPL',
      changePercent: 0.4,
      volume: 41000000,
      avgVolume: 43000000,
      volatility: 1.2,
      sectorReturn: 0.5,
      marketReturn: 0.4,
    };

    const story = ChangeDetectionEngine.analyze(normalObs);
    expect(story.meaningfulnessScore).toBeLessThan(35);
    expect(story.attentionLevel).toBe('NORMAL');
    expect(story.changeTypes).toEqual([]);
  });

  it('applies data confidence penalty when data is stale or conflicting', () => {
    const staleObs: MarketObservation = {
      ...baseObs,
      symbol: 'TSLA',
      freshness: 'STALE',
      confidence: 0.65,
      conflictWarning: 'Provider conflict detected',
    };

    const story = ChangeDetectionEngine.analyze(staleObs);
    expect(story.changeTypes).toContain('DATA_WARNING');
    expect(story.interpretationText).toContain('CAUTION: Market data freshness or provider disagreement noted');
  });
});
