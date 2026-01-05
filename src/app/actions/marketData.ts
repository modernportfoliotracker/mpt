"use server";

import { getMarketPrice as getMarketPriceService, PriceResult } from "@/services/marketData";
import { getYahooAssetProfile } from "@/services/yahooApi";

export async function getMarketPriceAction(symbol: string, type: string, exchange?: string): Promise<PriceResult | null> {
    return await getMarketPriceService(symbol, type, exchange);
}
