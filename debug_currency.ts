
import { getMarketPrice } from './src/services/marketData';

async function testLogic() {
    const symbol = "BTC-EUR";
    const type = "CRYPTO";

    console.log(`Testing market data for ${symbol}...`);
    const priceData = await getMarketPrice(symbol, type);
    console.log("Price Data:", priceData);

    if (priceData?.currency) {
        console.log(`Detected Currency: ${priceData.currency}`);
    } else {
        console.log("No currency detected in price data.");
    }
}

testLogic();
