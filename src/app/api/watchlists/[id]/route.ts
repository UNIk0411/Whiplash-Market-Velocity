import { NextRequest, NextResponse } from 'next/server';
import { WatchlistService } from '@/services/watchlist/watchlist-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = WatchlistService.deleteWatchlist(id);
    if (!success) {
      return NextResponse.json({ error: 'Cannot delete default or non-existent watchlist' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete watchlist' }, { status: 500 });
  }
}
