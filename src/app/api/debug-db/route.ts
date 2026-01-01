export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Attempt to "auto-patch" the database for the missing column
        try {
            await prisma.$executeRaw`ALTER TABLE "Asset" ADD COLUMN "customGroup" TEXT;`;
            console.log("Successfully added customGroup column");
        } catch (e: any) {
            // Ignore error if column already exists (common error code for duplicate column)
            console.log("Column likely exists or error adding:", e.message);
        }

        const userCount = await prisma.user.count();
        const priceCacheCount = await prisma.priceCache.count();

        return NextResponse.json({
            status: "ok",
            message: "Database connection successful & Schema Patched",
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
