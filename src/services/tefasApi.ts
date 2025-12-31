
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
        let price = 0;
        let lastUpdated: string | undefined = undefined;

        try {
            // Fetch last 7 days to ensure we get a valid price (holidays/weekends)
            const now = new Date();
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);

            const endDateStr = now.toISOString().split('T')[0];
            const startDateStr = weekAgo.toISOString().split('T')[0];

            // Use getFund with date range and fund code
            // Note: getFund returns { results: [...] } based on our test
            const fundData = await client.getFund(startDateStr, endDateStr, cleanCode);

            if (fundData && fundData.results && fundData.results.length > 0) {
                // Sort by date descending to get latest
                // The results seem to have 'date' string "YYYY-MM-DD"
                const sorted = fundData.results.sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                const latest = sorted[0];
                price = latest.price;
                lastUpdated = latest.date;
            }

        } catch (e) {
            console.warn("TEFAS Price fetch failed:", e);
        }

        return {
            code: cleanCode,
            title: match.fundName,
            price: price,
            lastUpdated: lastUpdated || new Date().toLocaleDateString()
        };

    } catch (error) {
        console.error("Error fetching TEFAS data:", error);
        return null;
    }
}

