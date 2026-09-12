import { MarketDataProvider } from './provider-interface';
import { YahooMarketDataProvider } from './yahoo-provider';

export const marketDataProvider: MarketDataProvider = new YahooMarketDataProvider();
