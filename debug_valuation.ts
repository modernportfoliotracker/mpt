
import { PrismaClient } from '@prisma/client';
import { getMarketPrice, convertCurrency } from './src/services/marketData';

const prisma = new PrismaClient();

// Excel Target Values (Approximate from image)
const TARGETS: Record<string, number> = {
    'EUR': 4870, // Total Cash
    'BABA': 2657,
    'ASML.AS': 20712, // 19726 + 986
    'COIN': 3026,
    'INTC': 11084,
    'SOI.PA': 9948,
    'MSTR': 2681,
    'AAPL': 231,
    'TSLA': 374,
    'QQQ3.PA': 2376,
    'BTC-EUR': 10798,
    'ETH-EUR': 5354,
    'XRP-EUR': 3564,
    'RABO': 18228,
    'TRY': 1686,
    'RYGYO.IS': 5066,
    'TAVHL.IS': 6982,
    'TI2': 198,
    'GAUTRY': 26730,
    'AH2': 76999,
    'AH5': 8555,
    'AET': 9243 // Katki Fonu
};

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test1@example.com' },
        include: { portfolio: { include: { assets: true } } }
    });

    if (!user?.portfolio) return;

    console.log("Symbol | Qty | Price | Currency | Val (Nat) | Rate (->EUR) | Val (EUR) | Target (EUR) | Diff");
    console.log("-".repeat(100));

    let totalSystemEUR = 0;
    let totalTargetEUR = 0;

    for (const asset of user.portfolio.assets) {
        const marketData = await getMarketPrice(asset.symbol, asset.type);
        const price = marketData?.price || asset.buyPrice;
        const currency = marketData?.currency || asset.currency;

        const valNative = price * asset.quantity;
        const valEUR = await convertCurrency(valNative, currency, 'EUR');

        // Aggregate by symbol root for target comparison
        let targetKey = asset.symbol;
        if (asset.type === 'CASH' && asset.symbol === 'EUR') targetKey = 'EUR';

        // Simple look up, might miss splits but good for overview
        const target = TARGETS[targetKey] || 0;

        // Only add to Total Target ONCE per symbol to avoid double counting if multiple entries? 
        // No, I should sum my system assets.

        totalSystemEUR += valEUR;
        // Don't sum target here easily because of duplicates in list vs map.

        console.log(`${asset.symbol.padEnd(10)} | ${asset.quantity.toFixed(2).padEnd(8)} | ${price.toFixed(2).padEnd(8)} | ${currency.padEnd(4)} | ${valNative.toFixed(0).padEnd(8)} | ? | ${valEUR.toFixed(0).padEnd(8)} | ${target > 0 ? target : '?'} | ${target > 0 ? (valEUR - target).toFixed(0) : '?'}`);
    }

    // Calculate sum of targets manualy based on list logic
    Object.values(TARGETS).forEach(v => totalTargetEUR += v);

    console.log("-".repeat(100));
    console.log(`TOTAL SYSTEM: ${totalSystemEUR.toFixed(0)} EUR`);
    console.log(`TOTAL EXCEL : ${totalTargetEUR.toFixed(0)} EUR`); // Approx
    console.log(`DIFF        : ${(totalSystemEUR - totalTargetEUR).toFixed(0)} EUR`);
}

main();
