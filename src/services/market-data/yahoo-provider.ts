import { MarketDataProvider } from './provider-interface';
import { MarketObservation } from './types';

type ChartPoint = { date: number; close: number | null; volume: number | null; high: number | null; low: number | null; open: number | null };
type YahooQuote = { close?: Array<number | null>; volume?: Array<number | null>; high?: Array<number | null>; low?: Array<number | null>; open?: Array<number | null> };
type YahooChartResult = { meta?: Record<string, unknown>; timestamp?: number[]; indicators?: { quote?: YahooQuote[] } };
type YahooChartResponse = { chart?: { result?: YahooChartResult[] } };

const SECTOR_ETFS: Record<string, { name: string; sector: string; benchmark: string }> = {
  NVDA: { name: 'NVIDIA Corporation', sector: 'Semiconductors', benchmark: 'SOXX' },
  AMD: { name: 'Advanced Micro Devices, Inc.', sector: 'Semiconductors', benchmark: 'SOXX' },
  INTC: { name: 'Intel Corporation', sector: 'Semiconductors', benchmark: 'SOXX' },
  AAPL: { name: 'Apple Inc.', sector: 'Technology', benchmark: 'XLK' },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', benchmark: 'XLK' },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Communication Services', benchmark: 'XLC' },
  META: { name: 'Meta Platforms, Inc.', sector: 'Communication Services', benchmark: 'XLC' },
  AMZN: { name: 'Amazon.com, Inc.', sector: 'Consumer Discretionary', benchmark: 'XLY' },
  TSLA: { name: 'Tesla, Inc.', sector: 'Consumer Discretionary', benchmark: 'XLY' },
  JPM: { name: 'JPMorgan Chase & Co.', sector: 'Financials', benchmark: 'XLF' },
};

const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0 WhiplashMarketApp/1.0', Accept: 'application/json' };

function numberOr(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sampleStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
}

export class YahooMarketDataProvider implements MarketDataProvider {
  private static observationCache = new Map<string, { expiresAt: number; value: MarketObservation }>();
  private static benchmarkCache = new Map<string, { expiresAt: number; value: number }>();
  public getProviderInfo() {
    return { name: 'Yahoo Finance market data' };
  }

  private async chart(symbol: string, range: string, interval: string): Promise<{ meta: Record<string, unknown>; points: ChartPoint[] }> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const response = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`Market data provider returned ${response.status} for ${symbol}.`);
    const payload = await response.json() as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    if (!result || !quote || !result.timestamp) throw new Error(`No market data is available for ${symbol}. Check the ticker and try again.`);
    return {
      meta: result.meta || {},
      points: result.timestamp.map((date, index) => ({ date, close: quote.close?.[index] ?? null, volume: quote.volume?.[index] ?? null, high: quote.high?.[index] ?? null, low: quote.low?.[index] ?? null, open: quote.open?.[index] ?? null })).filter((point) => point.close !== null),
    };
  }

  private async benchmarkReturn(symbol: string): Promise<number> {
    const cached = YahooMarketDataProvider.benchmarkCache.get(symbol);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const { points } = await this.chart(symbol, '5d', '1d');
    if (points.length < 2) return 0;
    const latest = numberOr(points.at(-1)?.close, 0);
    const prior = numberOr(points.at(-2)?.close, latest);
    const value = prior ? ((latest - prior) / prior) * 100 : 0;
    YahooMarketDataProvider.benchmarkCache.set(symbol, { value, expiresAt: Date.now() + 60_000 });
    return value;
  }

  public async getObservation(symbol: string): Promise<MarketObservation> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!/^[A-Z0-9.^=-]{1,15}$/.test(cleanSymbol)) throw new Error('Ticker contains unsupported characters.');
    const cached = YahooMarketDataProvider.observationCache.get(cleanSymbol);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const [{ meta, points }, marketReturn] = await Promise.all([
      this.chart(cleanSymbol, '3mo', '1d'),
      this.benchmarkReturn('SPY'),
    ]);
    const recent = points.slice(-21);
    if (recent.length < 2) throw new Error(`Not enough price history is available for ${cleanSymbol}.`);
    const latest = recent.at(-1)!;
    const previous = recent.at(-2)!;
    const closes = recent.map((point) => numberOr(point.close, 0)).filter(Boolean);
    const returns = closes.slice(1).map((close, index) => ((close - closes[index]) / closes[index]) * 100);
    const historical = recent.slice(0, -1);
    const averageVolume = historical.reduce((sum, point) => sum + numberOr(point.volume, 0), 0) / Math.max(1, historical.length);
    const known = SECTOR_ETFS[cleanSymbol];
    const sectorBenchmark = known?.benchmark || 'SPY';
    const sectorReturn = sectorBenchmark === 'SPY' ? marketReturn : await this.benchmarkReturn(sectorBenchmark);
    const regularPrice = numberOr(meta.regularMarketPrice as number | undefined, numberOr(latest.close, 0));
    const previousClose = numberOr(meta.chartPreviousClose as number | undefined, numberOr(previous.close, regularPrice));
    const observedAt = new Date(numberOr(meta.regularMarketTime as number | undefined, latest.date) * 1000).toISOString();
    const marketState = String(meta.marketState || '').toUpperCase();
    const observation: MarketObservation = {
      symbol: cleanSymbol,
      companyName: known?.name || String(meta.longName || meta.shortName || cleanSymbol),
      sector: known?.sector || 'Broad Market',
      price: regularPrice,
      change: regularPrice - previousClose,
      changePercent: previousClose ? ((regularPrice - previousClose) / previousClose) * 100 : 0,
      volume: numberOr(meta.regularMarketVolume as number | undefined, numberOr(latest.volume, 0)),
      avgVolume: averageVolume,
      volatility: sampleStdDev(returns),
      high: numberOr(meta.regularMarketDayHigh as number | undefined, numberOr(latest.high, regularPrice)),
      low: numberOr(meta.regularMarketDayLow as number | undefined, numberOr(latest.low, regularPrice)),
      open: numberOr(meta.regularMarketOpen as number | undefined, numberOr(latest.open, previousClose)),
      marketReturn,
      sectorReturn,
      source: 'Yahoo Finance',
      freshness: marketState === 'REGULAR' || marketState === 'PREPRE' || marketState === 'PRE' || marketState === 'POST' ? 'RECENT' : 'CLOSED',
      confidence: 0.9,
      observedAt,
    };
    YahooMarketDataProvider.observationCache.set(cleanSymbol, { value: observation, expiresAt: Date.now() + 60_000 });
    return observation;
  }

  public async getBatchObservations(symbols: string[]): Promise<MarketObservation[]> {
    const results = await Promise.allSettled(symbols.map((symbol) => this.getObservation(symbol)));
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length === results.length) throw new Error('Unable to retrieve quotes. Please try again shortly.');
    return results.filter((result): result is PromiseFulfilledResult<MarketObservation> => result.status === 'fulfilled').map((result) => result.value);
  }

  public async getTimeline(symbol: string): Promise<Array<{ time: string; price: number; volumeRatio: number; eventNote?: string }>> {
    const [{ points }, observation] = await Promise.all([this.chart(symbol.trim().toUpperCase(), '1d', '5m'), this.getObservation(symbol)]);
    let cumulativeVolume = 0;
    const cumulativePoints = points.map((point) => ({ ...point, cumulativeVolume: cumulativeVolume += numberOr(point.volume, 0) }));
    const selected = cumulativePoints.filter((_, index) => index === 0 || index === cumulativePoints.length - 1 || index % Math.max(1, Math.floor(cumulativePoints.length / 5)) === 0).slice(0, 7);
    return selected.map((point, index) => ({
      time: new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date(point.date * 1000)),
      price: numberOr(point.close, observation.price),
      volumeRatio: observation.avgVolume > 0 ? (point.cumulativeVolume / observation.avgVolume) : 0,
      eventNote: index === selected.length - 1 ? 'Latest available quote' : undefined,
    }));
  }
}
