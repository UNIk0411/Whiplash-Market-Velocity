import { MarketObservation } from './types';

export interface MarketDataProvider {
  getObservation(symbol: string): Promise<MarketObservation>;
  getBatchObservations(symbols: string[]): Promise<MarketObservation[]>;
  getTimeline(
    symbol: string
  ): Promise<Array<{ time: string; price: number; volumeRatio: number; eventNote?: string }>>;
  getProviderInfo(): { name: string };
}
