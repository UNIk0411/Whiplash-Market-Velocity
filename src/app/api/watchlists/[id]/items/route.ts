import { NextRequest, NextResponse } from 'next/server';
import { WatchlistService } from '@/services/watchlist/watchlist-service';
import { marketDataProvider } from '@/services/market-data/provider';
import { z } from 'zod';

const addItemSchema = z.object({
  symbol: z.string().min(1),
  companyName: z.string().optional(),
  sector: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addItemSchema.parse(body);

    const quote = await marketDataProvider.getObservation(parsed.symbol);
    const newItem = WatchlistService.addSymbol(id, quote.symbol, parsed.companyName || quote.companyName, parsed.sector || quote.sector);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to add symbol to watchlist', details: error?.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol query param' }, { status: 400 });
    }

    const removed = WatchlistService.removeSymbol(id, symbol);
    return NextResponse.json({ success: removed });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to remove symbol' }, { status: 500 });
  }
}
