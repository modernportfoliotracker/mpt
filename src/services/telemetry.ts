import { prisma } from '@/lib/prisma';

export async function trackApiRequest(provider: string, isSuccess: boolean) {
    try {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

        await prisma.apiUsage.upsert({
            where: {
                provider_dateKey: {
                    provider: provider,
                    dateKey: dateKey
                }
            },
            create: {
                provider,
                dateKey,
                successCount: isSuccess ? 1 : 0,
                errorCount: isSuccess ? 0 : 1
            },
            update: {
                successCount: { increment: isSuccess ? 1 : 0 },
                errorCount: { increment: isSuccess ? 0 : 1 }
            }
        });
    } catch (e) {
        // Fail silently - telemetry shouldn't break the app
        console.error('[Telemetry] Failed to log request:', e);
    }
}

export async function getDailyStats() {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];

    return prisma.apiUsage.findMany({
        where: { dateKey },
        orderBy: { provider: 'asc' }
    });
}
