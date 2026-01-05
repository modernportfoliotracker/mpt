import { NextResponse } from 'next/server';
import { updateAllPrices } from '@/services/priceUpdateService';

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic';
// Allow longer execution for batching
export const maxDuration = 300;

export async function GET(request: Request) {
    try {
        console.log("[Cron] Starting Manual/Scheduled Price Update...");
        const result = await updateAllPrices();
        console.log("[Cron] Update Result:", result);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Cron] Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
