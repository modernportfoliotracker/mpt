// Centralized currency rates definitions (1 EUR = X Currency)
export const RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.09,
    TRY: 37.5
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'TRY': '₺',
    'GBP': '£',
    'JPY': '¥'
};

export const getCurrencySymbol = (currency: string): string => {
    return CURRENCY_SYMBOLS[currency] || currency;
};

// Calculate exchange rate from source currency to target currency
export const getRate = (from: string, to: string, customRates?: Record<string, number>): number => {
    const rates = customRates || RATES;
    const fromRate = rates[from];
    const toRate = rates[to];

    // Fallback if currency not found
    if (!fromRate || !toRate) return 1;

    return toRate / fromRate;
};

// Convert value
export const convertCurrency = (amount: number, from: string, to: string, customRates?: Record<string, number>): number => {
    return amount * getRate(from, to, customRates);
};
