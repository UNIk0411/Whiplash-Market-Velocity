import { MarketObservation } from '../market-data/types';

export interface SnapshotRecord {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  changePercent: number;
  observedAt: string;
  hash: string;
}

export class SnapshotService {
  private static snapshotStore: Map<string, SnapshotRecord[]> = new Map();

  /**
   * Generates a unique deterministic fingerprint for a market observation.
   */
  public static generateHash(obs: MarketObservation): string {
    return `${obs.symbol}_${obs.price}_${obs.volume}_${obs.observedAt.substring(0, 16)}`;
  }

  /**
   * Records a snapshot idempotently.
   * If a snapshot with the same hash already exists, returns existing without duplicating.
   */
  public static recordSnapshot(obs: MarketObservation): { record: SnapshotRecord; isDuplicate: boolean } {
    const hash = this.generateHash(obs);
    const symbolSnapshots = this.snapshotStore.get(obs.symbol) || [];

    const existing = symbolSnapshots.find((s) => s.hash === hash);
    if (existing) {
      return { record: existing, isDuplicate: true };
    }

    const newRecord: SnapshotRecord = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      symbol: obs.symbol,
      price: obs.price,
      volume: obs.volume,
      changePercent: obs.changePercent,
      observedAt: obs.observedAt,
      hash,
    };

    symbolSnapshots.push(newRecord);
    this.snapshotStore.set(obs.symbol, symbolSnapshots);

    return { record: newRecord, isDuplicate: false };
  }

  /**
   * Retrieves historical snapshots for a symbol.
   */
  public static getSnapshots(symbol: string): SnapshotRecord[] {
    return this.snapshotStore.get(symbol.toUpperCase()) || [];
  }

  /**
   * Clears all snapshot records (for testing or demo reset).
   */
  public static clear(): void {
    this.snapshotStore.clear();
  }
}
