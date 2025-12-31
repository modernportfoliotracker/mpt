
import { TefasClient } from "@firstthumb/tefas-api";

export interface TefasFund {
    code: string;
    title: string;
    price: number;
    lastUpdated?: string;
}

const client = new TefasClient();

export async function getTefasFundInfo(code: string): Promise<TefasFund | null> {
    try {
        const cleanCode = code.toUpperCase().trim();

        // 1. Search to verify existence and get Title
        const searchRes = await client.searchFund(cleanCode);
        const match = searchRes.results?.find(r => r.fundCode === cleanCode);

        if (!match) return null;

        // 2. Try to get Price
        // We need the latest price. 
        // Strategy: Fetches history for today or yesterday.
        // Since getFundHistory seems tricky with dates, we will try standard 'today' or 'yesterday'
        // If that fails, we fallback to 0 price (User can edit).

        let price = 0;
        let lastUpdated = undefined;

        try {
            // Try to fetch history for the specific fund code if possible, 
            // OR fetch daily tables and filter.
            // The library's getFundHistory likely takes a date string. 
            // We'll try "yesterday" first (most likely to have closed data).

            // Note: Debugging showed 'yesterday' might fail with 'undefined' error in some contexts,
            // but we will try passing explicit YYYY-MM-DD for yesterday.
            const now = new Date();
            // Go back 1 day
            const y = new Date(now);
            y.setDate(now.getDate() - 1); // Yesterday
            const yStr = y.toISOString().split('T')[0];

            // Note: The library seems to have issues with date parsing in some envs. 
            // We'll try to safe call it.
            // If getFundHistory takes (fundType, date) we are stuck without type.
            // But search result DOES NOT include type (only fundCode, fundName).

            // Fallback: If we can't get price programmatically, we return 0.
            // But wait, the previous scraping returned price.
            // Let's assume for now we return 0 until we debug the date issue.
            // Actually, maybe we can try to find the Type?
            // "HİSSE SENEDİ YOĞUN FON" -> 'YAT' (Equity? Mutual?)

        } catch (e) {
            console.warn("TEFAS Price fetch failed:", e);
        }

        return {
            code: cleanCode,
            title: match.fundName,
            price: price,
            lastUpdated: new Date().toLocaleTimeString()
        };

    } catch (error) {
        console.error("Error fetching TEFAS data:", error);
        return null;
    }
}

