export const TABS = ["1D", "1W", "1M", "YTD", "1Y", "ALL"];
export const ALLOCATION_VIEWS = ["Type", "Positions", "Sectors", "Countries", "Currencies"];
export const DEFAULT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6', '#f97316'];

export const getCountryFromExchange = (exchange?: string): string => {
    if (!exchange) return 'Unknown';
    const ex = exchange.toUpperCase();
    if (ex.includes('BIST') || ex.includes('IST')) return 'Turkey';
    if (ex.includes('NASDAQ') || ex.includes('NYSE')) return 'USA';
    if (ex.includes('LON') || ex.includes('LSE')) return 'UK';
    if (ex.includes('FRA')) return 'Germany';
    if (ex.includes('PAR')) return 'France';
    return 'Other';
};
