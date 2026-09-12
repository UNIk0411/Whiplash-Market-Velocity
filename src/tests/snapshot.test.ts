import { describe, expect, it } from 'vitest';
import { MarketObservation } from '../services/market-data/types';
import { SnapshotService } from '../services/snapshot/snapshot-service';

describe('SnapshotService', () => {
  const obs: MarketObservation = {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    price: 128.45,
    change: 5.88,
    changePercent: 4.8,
    volume: 78500000,
    avgVolume: 32700000,
    volatility: 2.1,
    high: 129.1,
    low: 123.0,
    open: 123.5,
    marketReturn: 0.4,
    sectorReturn: 1.0,
    source: 'Nasdaq Realtime',
    freshness: 'LIVE',
    confidence: 0.98,
    observedAt: '2026-09-04T12:00:00.000Z',
  };

  it('prevents duplicate snapshot creation for identical observation data', () => {
    SnapshotService.clear();

    const firstCall = SnapshotService.recordSnapshot(obs);
    expect(firstCall.isDuplicate).toBe(false);

    const secondCall = SnapshotService.recordSnapshot(obs);
    expect(secondCall.isDuplicate).toBe(true);
    expect(secondCall.record.id).toBe(firstCall.record.id);

    const snapshots = SnapshotService.getSnapshots('NVDA');
    expect(snapshots.length).toBe(1);
  });
});
