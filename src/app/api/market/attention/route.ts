import { NextRequest, NextResponse } from 'next/server';
import { AttentionQueueService } from '@/services/attention/queue-service';
import { UserLastSeenState } from '@/services/market-data/types';

function parseSymbols(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const symbols = value.split(',').map((symbol) => symbol.trim().toUpperCase()).filter((symbol) => /^[A-Z0-9.^=-]{1,15}$/.test(symbol));
  return symbols.length ? [...new Set(symbols)].slice(0, 50) : undefined;
}

function parseBaselines(value: string | null): Record<string, UserLastSeenState> | undefined {
  if (!value) return undefined;
  try {
    const candidate: unknown = JSON.parse(value);
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return undefined;
    return Object.fromEntries(Object.entries(candidate).filter(([, baseline]) =>
      typeof baseline === 'object' && baseline !== null &&
      typeof (baseline as UserLastSeenState).lastSeenPrice === 'number' &&
      typeof (baseline as UserLastSeenState).lastSeenVolume === 'number' &&
      typeof (baseline as UserLastSeenState).lastSeenTimestamp === 'string'
    )) as Record<string, UserLastSeenState>;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const watchlistId = searchParams.get('watchlistId') || undefined;
    const userId = searchParams.get('userId') || 'anonymous';

    const feed = await AttentionQueueService.getAttentionFeed(
      userId,
      watchlistId,
      parseSymbols(searchParams.get('symbols')),
      parseBaselines(searchParams.get('baselines'))
    );
    return NextResponse.json(feed);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch attention feed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
