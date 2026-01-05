import { apiCache } from '@/lib/cache';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageProfile {
    Symbol: string;
    AssetType: string;
    Name: string;
    Description: string;
    Exchange: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    MarketCapitalization: string;
}

/**
 * Get company overview/profile from Alpha Vantage
 * Includes: country, sector, industry
 */
export async function getCompanyOverview(symbol: string): Promise<{ country?: string, sector?: string, industry?: string } | null> {
    const cacheKey = `alphavantage_profile_${symbol}`;

    // Check cache first (24 hours)
    const cached = apiCache.get<{ country?: string, sector?: string, industry?: string }>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const url = `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error('[AlphaVantage] API error:', response.status);
            return null;
        }

        const data = await response.json();

        // Check if we got valid data (Alpha Vantage returns empty object or error message for invalid symbols)
        if (!data || !data.Symbol || data.Note || data['Error Message']) {
            if (data.Note) {
                console.warn('[AlphaVantage] Rate limit reached:', data.Note);
            }
            // Cache null for 1 hour to avoid repeated failed requests
            apiCache.set(cacheKey, null, 60);
            return null;
        }

        const profile = {
            country: data.Country,
            sector: data.Sector,
            industry: data.Industry
        };

        // Cache for 24 hours
        apiCache.set(cacheKey, profile, 1440);

        return profile;
    } catch (error) {
        console.error('[AlphaVantage] Error fetching company overview:', error);
        // Cache null for 1 hour to avoid repeated failed requests
        apiCache.set(cacheKey, null, 60);
        return null;
    }
}
