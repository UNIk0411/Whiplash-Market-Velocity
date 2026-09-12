import { NextRequest, NextResponse } from 'next/server';
import { WatchlistService } from '@/services/watchlist/watchlist-service';
import { z } from 'zod';

const createWatchlistSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function GET() {
  const watchlists = WatchlistService.getWatchlists();
  return NextResponse.json(watchlists);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createWatchlistSchema.parse(body);

    const created = WatchlistService.createWatchlist(parsed.name);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create watchlist', details: error?.message },
      { status: 400 }
    );
  }
}
