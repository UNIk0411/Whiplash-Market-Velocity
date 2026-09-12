import { Watchlist, WatchlistItem } from '../market-data/types';

export class WatchlistService {
  private static watchlists: Map<string, Watchlist> = new Map();

  private static defaultWatchlist: Watchlist = {
    id: 'wl_default_us_tech',
    name: 'US Tech Leaders',
    isDefault: true,
    createdAt: new Date().toISOString(),
    symbols: [
      { id: 'wi_1', symbol: 'NVDA', companyName: 'NVIDIA Corporation', sector: 'Semiconductors', addedAt: new Date().toISOString() },
      { id: 'wi_2', symbol: 'AMD', companyName: 'Advanced Micro Devices', sector: 'Semiconductors', addedAt: new Date().toISOString() },
      { id: 'wi_3', symbol: 'MSFT', companyName: 'Microsoft Corporation', sector: 'Software & Cloud', addedAt: new Date().toISOString() },
      { id: 'wi_4', symbol: 'AAPL', companyName: 'Apple Inc.', sector: 'Consumer Electronics', addedAt: new Date().toISOString() },
      { id: 'wi_5', symbol: 'GOOGL', companyName: 'Alphabet Inc.', sector: 'Interactive Media', addedAt: new Date().toISOString() },
      { id: 'wi_6', symbol: 'META', companyName: 'Meta Platforms Inc.', sector: 'Interactive Media', addedAt: new Date().toISOString() },
      { id: 'wi_7', symbol: 'TSLA', companyName: 'Tesla Inc.', sector: 'Automotive & EV', addedAt: new Date().toISOString() },
      { id: 'wi_8', symbol: 'INTC', companyName: 'Intel Corporation', sector: 'Semiconductors', addedAt: new Date().toISOString() },
      { id: 'wi_9', symbol: 'AMZN', companyName: 'Amazon.com Inc.', sector: 'E-commerce & Cloud', addedAt: new Date().toISOString() },
      { id: 'wi_10', symbol: 'JPM', companyName: 'JPMorgan Chase & Co.', sector: 'Banking & Financials', addedAt: new Date().toISOString() },
    ],
  };

  private static initializeDefaults(): void {
    if (this.watchlists.size === 0) {
      this.watchlists.set(this.defaultWatchlist.id, { ...this.defaultWatchlist });
    }
  }

  public static getWatchlists(): Watchlist[] {
    this.initializeDefaults();
    return Array.from(this.watchlists.values());
  }

  public static getWatchlistById(id: string): Watchlist | undefined {
    this.initializeDefaults();
    return this.watchlists.get(id);
  }

  public static createWatchlist(name: string): Watchlist {
    this.initializeDefaults();
    const id = `wl_${Date.now()}`;
    const newWl: Watchlist = {
      id,
      name: name.trim() || 'New Watchlist',
      isDefault: false,
      symbols: [],
      createdAt: new Date().toISOString(),
    };
    this.watchlists.set(id, newWl);
    return newWl;
  }

  public static deleteWatchlist(id: string): boolean {
    this.initializeDefaults();
    const target = this.watchlists.get(id);
    if (!target || target.isDefault) return false;
    return this.watchlists.delete(id);
  }

  public static addSymbol(
    watchlistId: string,
    symbolInput: string,
    companyName?: string,
    sector?: string
  ): WatchlistItem {
    this.initializeDefaults();
    const target = this.watchlists.get(watchlistId);
    if (!target) throw new Error('Watchlist not found');

    const cleanSymbol = symbolInput.trim().toUpperCase();
    if (!cleanSymbol) throw new Error('Invalid symbol');

    const existing = target.symbols.find((s) => s.symbol === cleanSymbol);
    if (existing) return existing;

    const newItem: WatchlistItem = {
      id: `wi_${Date.now()}_${cleanSymbol}`,
      symbol: cleanSymbol,
      companyName: companyName || `${cleanSymbol} Corp`,
      sector: sector || 'General Market',
      addedAt: new Date().toISOString(),
    };

    target.symbols.push(newItem);
    return newItem;
  }

  public static removeSymbol(watchlistId: string, symbol: string): boolean {
    this.initializeDefaults();
    const target = this.watchlists.get(watchlistId);
    if (!target) return false;

    const cleanSymbol = symbol.trim().toUpperCase();
    const initialLen = target.symbols.length;
    target.symbols = target.symbols.filter((s) => s.symbol !== cleanSymbol);

    return target.symbols.length < initialLen;
  }

  public static resetToDefaults(): void {
    this.watchlists.clear();
    this.initializeDefaults();
  }
}
