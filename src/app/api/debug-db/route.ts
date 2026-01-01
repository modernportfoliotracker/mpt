export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const priceCacheCount = await prisma.priceCache.count();
        return NextResponse.json({
            status: "ok",
            message: "Database connection successful",
            users: userCount,
            cacheEntries: priceCacheCount
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
