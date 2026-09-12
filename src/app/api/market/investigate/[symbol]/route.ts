import { NextRequest, NextResponse } from 'next/server';
import { ChangeDetectionEngine } from '@/services/change-detection/engine';
import { marketDataProvider } from '@/services/market-data/provider';
import { DataReconciler } from '@/services/market-data/reconciler';
import { UserMemoryService } from '@/services/user-state/memory-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const cleanSymbol = symbol.toUpperCase();
    const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';

    const rawObs = await marketDataProvider.getObservation(cleanSymbol);
    const obs = DataReconciler.reconcile([rawObs]);
    const lastSeen = UserMemoryService.getUserLastSeen(userId, cleanSymbol);
    const timeline = await marketDataProvider.getTimeline(cleanSymbol);

    const story = ChangeDetectionEngine.analyze(obs, lastSeen, timeline);

    return NextResponse.json(story);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to investigate symbol', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
