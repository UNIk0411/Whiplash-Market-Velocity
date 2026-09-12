import { AttentionLevel, UserLastSeenState } from '../market-data/types';

export class UserMemoryService {
  // Map key: `${userId}_${symbol}`
  private static userMemoryStore: Map<string, UserLastSeenState> = new Map();

  /**
   * Fetches the user's last observed baseline for a symbol.
   */
  public static getUserLastSeen(userId: string, symbol: string): UserLastSeenState | undefined {
    const key = `${userId}_${symbol.toUpperCase()}`;
    return this.userMemoryStore.get(key);
  }

  /**
   * Updates user memory state when user observes or dismisses a story.
   */
  public static markAsSeen(
    userId: string,
    symbol: string,
    price: number,
    volume: number,
    score: number,
    attention: AttentionLevel,
    timestampOverride?: string
  ): UserLastSeenState {
    const sym = symbol.toUpperCase();
    const key = `${userId}_${sym}`;

    const newState: UserLastSeenState = {
      symbol: sym,
      lastSeenTimestamp: timestampOverride || new Date().toISOString(),
      lastSeenPrice: price,
      lastSeenVolume: volume,
      lastSeenScore: score,
      lastSeenAttention: attention,
    };

    this.userMemoryStore.set(key, newState);
    return newState;
  }

  public static clear(): void {
    this.userMemoryStore.clear();
  }
}
