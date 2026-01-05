import { prisma } from '@/lib/prisma';
import YahooFinance from 'yahoo-finance2';
import { detectCurrency } from './yahooApi';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function updateAllPrices() {
    // 1. Get all unique symbols from Assets
    // We only care about assets that are actively held (quantity > 0? or just exist? Let's say all)
    const assets = await prisma.asset.findMany({
        select: { symbol: true },
        distinct: ['symbol']
    });

    const uniqueSymbols = assets.map(a => a.symbol).filter(s => s && s.trim().length > 0);

    if (uniqueSymbols.length === 0) return { count: 0, message: "No symbols to update." };

    console.log(`[PriceServer] Found ${uniqueSymbols.length} unique symbols to update.`);

    // 2. Batching
    // Yahoo Finance API via URL often has length limits. 
    // 50 symbols * ~10 chars = 500 chars, well within 2000 limit.
    const BATCH_SIZE = 50;
    let updatedCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < uniqueSymbols.length; i += BATCH_SIZE) {
        const batch = uniqueSymbols.slice(i, i + BATCH_SIZE);

        try {
            console.log(`[PriceServer] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}... (${batch.join(', ')})`);

            // Yahoo Finance "quote" method can accept array of symbols
            const results = await yahooFinance.quote(batch, { validateResult: false });
            // validateResult: false prevents throwing on partial failures if possible, though library behavior varies.

            const quotes = Array.isArray(results) ? results : [results];

            // 3. Update DB
            for (const quote of quotes) {
                if (!quote || !quote.symbol) continue;

                const price = quote.regularMarketPrice || 0;
                // Force currency correction using our shared helper
                const detected = detectCurrency(quote.symbol);
                const currency = detected || quote.currency || 'USD'; // Safe fallback

                await prisma.priceCache.upsert({
                    where: { symbol: quote.symbol },
                    create: {
                        symbol: quote.symbol,
                        price,
                        currency,
                        updatedAt: new Date()
                    },
                    update: {
                        price,
                        currency,
                        updatedAt: new Date()
                    }
                });
                updatedCount++;
            }

            // Jitter/Sleep to prevent 429
            await new Promise(r => setTimeout(r, 1500));

        } catch (err: any) {
            console.error(`[PriceServer] Batch failed:`, err.message);
            errors.push({ batch: batch, error: err.message });
        }
    }

    console.log(`[PriceServer] Update complete. Updated ${updatedCount}/${uniqueSymbols.length} symbols.`);
    return {
        success: true,
        updatedCount,
        totalSymbols: uniqueSymbols.length,
        errors
    };
}
