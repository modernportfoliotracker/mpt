export type AssetType = 'STOCK' | 'CRYPTO' | 'GOLD' | 'BOND' | 'FUND';

export interface AssetInfo {
    type: AssetType;
    currency: string;
    exchange?: string;
    isAmbiguous?: boolean;
    options?: string[];
}

const BIST_STOCKS = [
    'THYAO', 'GARAN', 'ASELS', 'AKBNK', 'EREGL', 'KCHOL', 'SISE', 'TUPRS', 'BIMAS', 'ISCTR',
    'SAHOL', 'YKBNK', 'PGSUS', 'HALKB', 'VAKBN', 'PETKM', 'SASA', 'HEKTS', 'ENKAI', 'ARCLK',
    'TAVHL', 'FROTO', 'TOASO', 'SOKM', 'AEFES', 'MGROS', 'CCOLA', 'KRDMD', 'DOHOL', 'PETKM'
];

const CRYPTOS = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'DOGE', 'AVAX', 'LINK', 'MATIC'];

export function lookupAsset(symbol: string): AssetInfo {
    const s = symbol.toUpperCase().trim();

    if (!s) {
        return { type: 'STOCK', currency: 'USD', exchange: 'NASDAQ' };
    }

    if (CRYPTOS.includes(s)) {
        return {
            type: 'CRYPTO',
            currency: 'USD',
            exchange: 'Binance',
            isAmbiguous: true,
            options: ['USD', 'EUR', 'TRY']
        };
    }

    // Heuristic: BIST stocks are usually 5 characters. 
    // US stocks are usually 1-4 characters (Apple: AAPL, MSFT, etc.)
    const isBistHeuristic = s.length === 5 && !['GOOGL', 'AMZON', 'APPLE'].includes(s);

    if (BIST_STOCKS.includes(s) || s.endsWith('.IS') || isBistHeuristic) {
        return { type: 'STOCK', currency: 'TRY', exchange: 'BIST' };
    }

    if (s === 'XAU' || s === 'GOLD' || s === 'GRAM') {
        const currency = s === 'GRAM' ? 'TRY' : 'USD';
        return { type: 'GOLD', currency, exchange: 'Market' };
    }

    // Default to US Stock
    return { type: 'STOCK', currency: 'USD', exchange: 'NASDAQ' };
}
