import { NextResponse } from 'next/server';
import { marketDataProvider } from '@/services/market-data/provider';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const observation = await marketDataProvider.getObservation(symbol);
    return NextResponse.json({
      symbol: observation.symbol,
      companyName: observation.companyName,
      sector: observation.sector,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to validate ticker.';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
