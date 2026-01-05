
import { getMarketPrice } from './src/services/marketData';

async function main() {
    console.log("Checking RABO.AS...");
    const rabo = await getMarketPrice('RABO.AS', 'STOCK');
    console.log('RABO.AS:', rabo);

    console.log("Checking AH2...");
    const ah2 = await getMarketPrice('AH2', 'FUND', 'TEFAS');
    console.log('AH2:', ah2);

    console.log("Checking AH5...");
    const ah5 = await getMarketPrice('AH5', 'FUND', 'TEFAS');
    console.log('AH5:', ah5);
}

main();
