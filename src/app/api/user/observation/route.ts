import { NextRequest, NextResponse } from 'next/server';
import { UserMemoryService } from '@/services/user-state/memory-service';
import { z } from 'zod';

const observationSchema = z.object({
  symbol: z.string().min(1),
  price: z.number(),
  volume: z.number(),
  score: z.number(),
  attention: z.enum(['NORMAL', 'NOTABLE', 'ATTENTION', 'HIGH']),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = observationSchema.parse(body);

    const userId = parsed.userId || 'anonymous';

    const updated = UserMemoryService.markAsSeen(
      userId,
      parsed.symbol,
      parsed.price,
      parsed.volume,
      parsed.score,
      parsed.attention
    );

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid observation request', details: error?.message },
      { status: 400 }
    );
  }
}
