import { apiCache } from '@/lib/cache';
import YahooFinance from 'yahoo-finance2';
import { prisma } from '@/lib/prisma';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export interface YahooSymbol {
    symbol: string;
    shortname?: string;
    longname?: string;
    exchange?: string;
    quoteType?: string;
    typeDisp?: string;
}

export interface YahooQuote {
    regularMarketPrice?: number;
    currency?: string;
    regularMarketTime?: Date;
    symbol: string;
    marketState?: string;
    regularMarketPreviousClose?: number;
    earningsTimestamp?: number;
}

async function searchDirect(query: string): Promise<YahooSymbol[]> {
    try {
        console.log(`[YahooApi] Fallback Direct Search: ${query}`);
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://finance.yahoo.com',
                'Referer': 'https://finance.yahoo.com/',
                'Accept': '*/*'
            }
        });

        if (!response.ok) {
            console.error(`[YahooApi] Direct search failed: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const quotes = data.quotes || [];

        return quotes.map((q: any) => ({
            symbol: q.symbol,
            shortname: q.shortname,
            longname: q.longname,
            exchange: q.exchange,
            quoteType: q.quoteType,
            typeDisp: q.typeDisp
        }));

    } catch (e) {
        console.error('[YahooApi] Direct search error:', e);
        return [];
    }
}

/**
 * Search for symbols using Yahoo Finance
 */
export async function searchYahoo(query: string): Promise<YahooSymbol[]> {
    if (!query) return [];

    const cacheKey = `yahoo:search:${query.toLowerCase()}`;
    const cached = apiCache.get<YahooSymbol[]>(cacheKey);

    if (cached) return cached;

    try {
        console.log(`[YahooApi] Searching with Library: ${query}`);
        const results = await yahooFinance.search(query);
        const quotes = results.quotes.filter((q: any) => q.isYahooFinance);

        const mapped = quotes.map((q: any) => ({
            symbol: q.symbol,
            shortname: q.shortname,
            longname: q.longname,
            exchange: q.exchange,
            quoteType: q.quoteType,
            typeDisp: q.typeDisp
        }));

        apiCache.set(cacheKey, mapped, 10);
        return mapped;
    } catch (error) {
        console.error('[YahooApi] Library search error, trying fallback:', error);
    }

    // Fallback
    const fallbackResults = await searchDirect(query);
    if (fallbackResults.length > 0) {
        apiCache.set(cacheKey, fallbackResults, 10);
    }
    return fallbackResults;
}

/**
 * Get quote from Yahoo Finance
 */
const CACHE_DURATION_MINUTES = 1440; // 24 Hours Cache (Closing Price Strategy)

// Helper to forcefully detect currency from symbol suffix to prevent "USD" errors on fallbacks/cache
export const detectCurrency = (sym: string): string | null => {
    if (!sym) return null;
    const s = sym.toUpperCase();
    if (s.endsWith('.AS') || s.endsWith('.DE') || s.endsWith('.PA') || s.endsWith('.MI') || s.endsWith('.MC') || s.endsWith('.BR') || s.endsWith('.VI') || s.endsWith('.MA') || s.endsWith('.IR')) return 'EUR';
    if (s.endsWith('.L')) return 'GBP';
    if (s.endsWith('.TO') || s.endsWith('.V') || s.endsWith('.CN') || s.endsWith('.NE')) return 'CAD';
    if (s.endsWith('.AX')) return 'AUD';
    if (s.endsWith('.HK')) return 'HKD';
    if (s.endsWith('.T')) return 'JPY';
    if (s.endsWith('.SI')) return 'SGD';
    if (s.endsWith('.SW')) return 'CHF';
    if (s.endsWith('.JO')) return 'ZAR';
    if (s.endsWith('.IS')) return 'TRY'; // BIST
    return null;
};

export async function getYahooQuote(symbol: string): Promise<YahooQuote | null> {
    const forcedCurrency = detectCurrency(symbol);

    try {

        // 1. Check Memory Cache
        const cacheKey = `yahoo:quote:${symbol}`;
        const cachedData = apiCache.get<YahooQuote>(cacheKey);
        if (cachedData) {
            // Hotfix: Ensure cached data also has correct currency
            if (forcedCurrency && cachedData.currency !== forcedCurrency) {
                cachedData.currency = forcedCurrency;
            }
            return cachedData;
        }

        // 2. Check DB Cache (Freshness Check)
        // 2. Check DB Cache (Always Return if Exists - Scalability Mode)
        // We rely on background workers (PriceServer) to keep this fresh. User requests never trigger API calls for existing assets.
        const dbCache = await prisma.priceCache.findUnique({ where: { symbol } });

        if (dbCache) {
            const quote: YahooQuote = {
                symbol: dbCache.symbol,
                regularMarketPrice: dbCache.price,
                currency: forcedCurrency || dbCache.currency, // Force correct currency
                regularMarketTime: dbCache.updatedAt,
                regularMarketPreviousClose: dbCache.price
            };
            apiCache.set(cacheKey, quote, 0.5); // Refill memory cache
            return quote;
        }

        // 3. Fetch from API (Yahoo Finance - Primary)
        console.log(`[YahooApi] Fetching fresh quote for ${symbol}...`);
        // Random jitter to prevent synchronized requests from multiple workers triggers 429
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

        const result = await yahooFinance.quote(symbol);
        if (!result || !result.symbol) {
            console.warn(`[YahooApi] No result from Yahoo Finance for ${symbol}`);
            // If no result, proceed to fallbacks
            throw new Error(`No result from Yahoo Finance for ${symbol}`);
        }

        // --- CLOSING PRICE LOGIC ---
        // We always want the LATEST available price (regularMarketPrice).
        const effectivePrice = result.regularMarketPrice;
        const effectiveCurrency = forcedCurrency || result.currency; // Override with detected currency if available

        const quote: YahooQuote = {
            symbol: result.symbol,
            regularMarketPrice: effectivePrice,
            currency: effectiveCurrency,
            regularMarketTime: result.regularMarketTime,
            marketState: result.marketState,
            regularMarketPreviousClose: (result as any).main_regularMarketPreviousClose || result.regularMarketPreviousClose,
            earningsTimestamp: (result as any).earningsTimestamp || (result as any).earningsTimestampStart
        };

        // Save to DB
        await prisma.priceCache.upsert({
            where: { symbol: quote.symbol },
            create: {
                symbol: quote.symbol,
                price: quote.regularMarketPrice || 0,
                currency: quote.currency || 'USD',
                updatedAt: new Date()
            },
            update: {
                price: quote.regularMarketPrice || 0,
                currency: quote.currency || 'USD',
                updatedAt: new Date() // Force update timestamp
            }
        }).catch(err => console.error('[YahooApi] DB Upsert Error:', err));

        // Save to Memory
        apiCache.set(cacheKey, quote, 0.5);

        return quote;

    } catch (error: any) {
        console.warn(`[YahooApi] Primary quote failed for ${symbol}:`, error?.message || error);

        // Use the detectCurrency defined at the top of the function
        const forcedCurrencyFallback = detectCurrency(symbol);


        // FALLBACK 1: Alpha Vantage Quote
        try {
            console.log(`[YahooApi] Trying Alpha Vantage Quote fallback for ${symbol}...`);
            const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
            const data = await response.json();
            const globalQuote = data['Global Quote'];

            if (globalQuote && globalQuote['05. price']) {
                const quote: YahooQuote = {
                    symbol: symbol,
                    regularMarketPrice: parseFloat(globalQuote['05. price']),
                    currency: forcedCurrencyFallback || 'USD', // Crucial Fix
                    regularMarketTime: new Date(),
                    regularMarketPreviousClose: parseFloat(globalQuote['08. previous close'])
                };

                // Save to DB
                await prisma.priceCache.upsert({
                    where: { symbol: quote.symbol },
                    create: { symbol: quote.symbol, price: quote.regularMarketPrice || 0, currency: quote.currency, updatedAt: new Date() },
                    update: { price: quote.regularMarketPrice || 0, currency: quote.currency, updatedAt: new Date() }
                }).catch(err => console.error('[YahooApi] DB Upsert (Alpha) Error:', err));

                return quote;
            }
        } catch (e) {
            console.warn(`[YahooApi] Alpha Vantage fallback failed:`, e);
        }

        // FALLBACK 2: Finnhub Quote
        try {
            console.log(`[YahooApi] Trying Finnhub Quote fallback for ${symbol}...`);
            const { getQuote } = await import('./finnhubApi');
            const finnhubQuote = await getQuote(symbol);

            if (finnhubQuote && finnhubQuote.c > 0) {
                const quote: YahooQuote = {
                    symbol: symbol,
                    regularMarketPrice: finnhubQuote.c,
                    currency: forcedCurrencyFallback || 'USD', // Crucial Fix
                    regularMarketTime: new Date(finnhubQuote.t * 1000),
                    regularMarketPreviousClose: finnhubQuote.pc
                };

                await prisma.priceCache.upsert({
                    where: { symbol: quote.symbol },
                    create: { symbol: quote.symbol, price: quote.regularMarketPrice || 0, currency: quote.currency, updatedAt: new Date() },
                    update: { price: quote.regularMarketPrice || 0, currency: quote.currency, updatedAt: new Date() }
                }).catch(err => console.error('[YahooApi] DB Upsert (Finnhub) Error:', err));

                return quote;
            }
        } catch (e) {
            console.warn(`[YahooApi] Finnhub fallback failed:`, e);
        }

        // FINAL FALLBACK: Stale DB Data
        const dbCachedFallback = await prisma.priceCache.findUnique({ where: { symbol } });
        if (dbCachedFallback) {
            console.warn(`[YahooApi] Rate Limit/Errors for ${symbol}. Returning stale DB data.`);
            return {
                symbol: dbCachedFallback.symbol,
                regularMarketPrice: dbCachedFallback.price,
                currency: forcedCurrencyFallback || dbCachedFallback.currency, // Force correct currency even on old data
                regularMarketTime: dbCachedFallback.updatedAt
            };
        }

        console.error(`[YahooApi] All quote sources failed for ${symbol}:`, error);
    }

    // Fallback Direct Quote (Chart API) - Last Resort
    try {
        // Use the detectCurrency defined at the top of the function
        const forcedCurrencyFinal = detectCurrency(symbol);

        console.log(`[YahooApi] Trying Fallback Direct for ${symbol}`);
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.ok) {
            const data = await response.json();
            const result = data.chart?.result?.[0];
            if (result?.meta) {
                const quote: YahooQuote = {
                    symbol: result.meta.symbol,
                    regularMarketPrice: result.meta.regularMarketPrice,
                    currency: forcedCurrencyFinal || result.meta.currency || 'USD',

                    regularMarketTime: new Date(result.meta.regularMarketTime * 1000),
                    regularMarketPreviousClose: result.meta.chartPreviousClose
                };

                // Save to DB (Persistent Cache - "Update Asset")
                // This satisfies "update asset when new closing price comes"
                await prisma.priceCache.upsert({
                    where: { symbol: quote.symbol },
                    create: {
                        symbol: quote.symbol,
                        price: quote.regularMarketPrice || 0,
                        currency: quote.currency || 'USD',
                        updatedAt: new Date()
                    },
                    update: {
                        price: quote.regularMarketPrice || 0,
                        currency: quote.currency || 'USD',
                        updatedAt: new Date()
                    }
                }).catch(err => console.error('[YahooApi] DB Upsert (Fallback) Error:', err));

                // Save to Memory
                apiCache.set(cacheKey, quote, 0.5);

                return quote;
            }
        }
    } catch (e) {
        console.error(`[YahooApi] Direct quote error for ${symbol}:`, e);
    }

    return null;
}

/**
 * Get Profile/Summary for a symbol (Country, Sector, Industry)
 */
export async function getYahooAssetProfile(symbol: string): Promise<{ country?: string, sector?: string, industry?: string } | null> {
    const cacheKey = `yahoo_profile_${symbol}`;

    // Check memory cache first (24 hours)
    const cached = apiCache.get<{ country?: string, sector?: string, industry?: string }>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        // ATTEMPT 1: Try quote endpoint first (faster, less rate-limited)
        try {
            const quote = await yahooFinance.quote(symbol);
            if (quote && (quote as any).sector) {
                const profileData = {
                    country: (quote as any).country,
                    sector: (quote as any).sector,
                    industry: (quote as any).industry
                };
                // Cache for 24 hours
                apiCache.set(cacheKey, profileData, 1440);
                return profileData;
            }
        } catch (e) {
            // Continue to quoteSummary
        }

        // ATTEMPT 2: Try quoteSummary (more detailed but rate-limited)
        const result = await yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile', 'assetProfile', 'summaryDetail'] });
        const summary = result.summaryProfile || result.assetProfile || (result as any).summaryDetail;

        if (summary) {
            const profileData = {
                country: summary.country,
                sector: summary.sector,
                industry: summary.industry
            };
            // Cache for 24 hours
            apiCache.set(cacheKey, profileData, 1440);
            return profileData;
        }
    } catch (e) {
        // Silently fail - sector is optional
    }

    // Cache null result for 1 hour to avoid repeated failed requests
    apiCache.set(cacheKey, null, 60);
    return null;
}
