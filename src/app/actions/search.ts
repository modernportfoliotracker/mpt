"use server";

import { searchYahoo } from "@/services/yahooApi";
import { SymbolOption, getCountryFromExchange, getExchangeName } from "@/lib/symbolSearch";
import { cleanAssetName } from "@/lib/companyNames";

export async function searchSymbolsAction(query: string): Promise<SymbolOption[]> {
    if (!query || query.length < 2) return [];

    const results = await searchYahoo(query);

    // Map first to easily check types
    const mappedResults: SymbolOption[] = results
        .filter(item => !isCurrencyPair(item.symbol)) // Filter out FOREX pairs
        .map(item => ({
            symbol: item.symbol,
            fullName: cleanAssetName(item.shortname || item.longname || item.symbol),
            exchange: getExchangeName(item.exchange),
            type: mapYahooType(item.quoteType),
            currency: getCurrencyFromExchange(item.exchange),
            country: getCountryFromExchange(item.exchange),
            // Keep raw name for filtering
            rawName: (item.shortname || item.longname || item.symbol).toUpperCase()
        }));

    // Inject CASH option if query matches a supported currency
    const upperQuery = query.toUpperCase();
    const currencies = ["USD", "EUR", "TRY", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"];

    // Check if query is a currency code
    if (currencies.includes(upperQuery)) {
        const cashOption: SymbolOption = {
            symbol: upperQuery,
            fullName: `${upperQuery} - Cash`,
            exchange: 'Forex',
            type: 'CASH', // Custom type
            currency: upperQuery,
            country: 'Global', // Or lookup based on currency
            rawName: `${upperQuery} CASH`
        };
        // Prepend to results
        mappedResults.unshift(cashOption);
    }

    // Heuristic Filtering:
    // If we have a "Strong Equity Match" (Stock where symbol or name includes query),
    // we filter out derivative ETFs/Funds that just have the query in their name.

    const queryUpper = query.toUpperCase();
    const hasStrongEquityMatch = mappedResults.some(r =>
        r.type === 'STOCK' &&
        (r.symbol.toUpperCase().startsWith(queryUpper) || (r.rawName || '').startsWith(queryUpper))
    );

    if (hasStrongEquityMatch) {
        return mappedResults.filter(r => {
            // Always keep stocks
            if (r.type === 'STOCK') return true;

            // For others (ETF, FUND), exclude if they are likely just tracking the equity
            // e.g. "YieldMax NVDA Option...", "GraniteShares 3x Long NVIDIA"
            // We keep them ONLY if their symbol matches the query (unlikely for derivatives but safe)
            if (r.symbol.toUpperCase() === queryUpper) return true;

            // Otherwise exclude
            return false;
        }).map(({ rawName, ...rest }) => rest);
    }

    return mappedResults.map(({ rawName, ...rest }) => rest);
}

/**
 * Check if a symbol is a currency pair (FOREX)
 * Currency pairs are not investable assets, just exchange rates
 * Examples: EUR/TRY, USD/TRY, EUR/USD, GBP/USD
 */
function isCurrencyPair(symbol: string): boolean {
    if (!symbol) return false;

    const s = symbol.toUpperCase();

    // Common currency codes
    const currencies = ['USD', 'EUR', 'TRY', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 'INR', 'RUB', 'BRL', 'ZAR'];

    // Check for patterns like EURTRY=X, EUR/TRY, EURUSD, etc.
    if (s.includes('/')) return true;
    if (s.includes('=X')) return true;

    // Check if symbol is exactly two currency codes concatenated (e.g., EURTRY, USDTRY)
    for (const curr1 of currencies) {
        for (const curr2 of currencies) {
            if (curr1 !== curr2 && s === curr1 + curr2) return true;
        }
    }

    return false;
}

/**
 * Determine currency based on exchange
 * BIST (Borsa Istanbul) stocks are in TRY
 * Most others default to USD
 */
function getCurrencyFromExchange(exchange?: string): string {
    if (!exchange) return 'USD';

    const ex = exchange.toUpperCase();

    // Turkish exchanges
    if (ex.includes('IST') || ex.includes('BIST')) return 'TRY';

    // European exchanges
    if (ex.includes('PAR') || ex.includes('FRA') || ex.includes('AMS') ||
        ex.includes('MIL') || ex.includes('MAD') || ex.includes('LIS')) return 'EUR';

    // UK
    if (ex.includes('LON') || ex.includes('LSE')) return 'GBP';

    // Default to USD for US and other exchanges
    return 'USD';
}

function mapYahooType(type?: string): 'STOCK' | 'CRYPTO' | 'GOLD' | 'BOND' | 'FUND' | 'ETF' | 'CASH' {
    if (!type) return 'STOCK';
    const t = type.toUpperCase();
    if (t === 'CRYPTOCURRENCY') return 'CRYPTO';
    if (t === 'ETF') return 'ETF';
    if (t === 'MUTUALFUND') return 'FUND';
    if (t === 'FUTURE') return 'GOLD'; // Close enough for XAU
    if (t === 'EQUITY') return 'STOCK';
    return 'STOCK';
}
