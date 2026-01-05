
import { PrismaClient } from '@prisma/client';
import { getMarketPrice } from '../src/services/marketData';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test1@example.com' },
        include: { portfolio: true }
    });

    if (!user || !user.portfolio) {
        console.error('User or portfolio not found');
        return;
    }

    const portfolioId = user.portfolio.id;

    // Clear existing assets
    console.log('Clearing existing assets...');
    await prisma.asset.deleteMany({
        where: { portfolioId }
    });

    // Calculate Funds Quantities
    console.log('Fetching Fund Prices...');
    const ah2Price = await getMarketPrice('AH2', 'FUND', 'TEFAS');
    const ah5Price = await getMarketPrice('AH5', 'FUND', 'TEFAS');

    const ah2Qty = ah2Price ? 3882946 / ah2Price.price : 0;
    const ah5Qty = ah5Price ? 431438 / ah5Price.price : 0;

    console.log(`AH2 Qty: ${ah2Qty} (Price: ${ah2Price?.price})`);
    console.log(`AH5 Qty: ${ah5Qty} (Price: ${ah5Price?.price})`);

    const assets = [
        // Cash
        { symbol: 'EUR', type: 'CASH', quantity: 4870, buyPrice: 1, currency: 'EUR' },
        { symbol: 'TRY', type: 'CASH', quantity: 85000, buyPrice: 1, currency: 'TRY' },

        // Stocks
        { symbol: 'BABA', type: 'STOCK', quantity: 20, buyPrice: 159, currency: 'USD' },
        { symbol: 'ASML.AS', type: 'STOCK', quantity: 20, buyPrice: 607, currency: 'EUR' },
        { symbol: 'COIN', type: 'STOCK', quantity: 15, buyPrice: 240, currency: 'USD' },
        { symbol: 'INTC', type: 'STOCK', quantity: 330, buyPrice: 38, currency: 'USD' },
        { symbol: 'SOI.PA', type: 'STOCK', quantity: 400, buyPrice: 25, currency: 'EUR' },
        { symbol: 'MSTR', type: 'STOCK', quantity: 20, buyPrice: 178, currency: 'USD' },
        { symbol: 'AAPL', type: 'STOCK', quantity: 1, buyPrice: 240, currency: 'USD' },
        { symbol: 'ASML.AS', type: 'STOCK', quantity: 1, buyPrice: 667, currency: 'EUR' },
        { symbol: 'TSLA', type: 'STOCK', quantity: 1, buyPrice: 353, currency: 'USD' },
        { symbol: 'QQQ3.PA', type: 'STOCK', quantity: 9, buyPrice: 262, currency: 'EUR' }, // Wisdomtree

        // Crypto
        { symbol: 'BTC-EUR', type: 'CRYPTO', quantity: 0.139, buyPrice: 77122, currency: 'EUR' },
        { symbol: 'ETH-EUR', type: 'CRYPTO', quantity: 2, buyPrice: 2614, currency: 'EUR' },
        { symbol: 'XRP-EUR', type: 'CRYPTO', quantity: 2000, buyPrice: 1.76, currency: 'EUR' },

        // Rabo
        { symbol: 'RABO', type: 'STOCK', quantity: 15850, buyPrice: 1.01, currency: 'EUR' },

        // TR Assets
        { symbol: 'RYGYO.IS', type: 'STOCK', quantity: 11904, buyPrice: 21, currency: 'TRY' },
        { symbol: 'TAVHL.IS', type: 'STOCK', quantity: 1133, buyPrice: 235, currency: 'TRY' },
        { symbol: 'TI2', type: 'FUND', quantity: 94017, buyPrice: 0.11, currency: 'TRY' },
        { symbol: 'GAUTRY', type: 'GOLD', quantity: 232, buyPrice: 2136, currency: 'TRY' },

        // Funds (Calculated)
        { symbol: 'AH2', type: 'FUND', quantity: ah2Qty, buyPrice: 0, currency: 'TRY' }, // Buy Price unknown, set 0 or keep existing if known? User Table has "-"
        { symbol: 'AH5', type: 'FUND', quantity: ah5Qty, buyPrice: 0, currency: 'TRY' },
    ];

    console.log('Creating new assets...');
    for (const asset of assets) {
        await prisma.asset.create({
            data: {
                portfolioId,
                symbol: asset.symbol,
                type: asset.type,
                quantity: asset.quantity,
                buyPrice: asset.buyPrice,
                currency: asset.currency,
                name: asset.symbol // Simplification
            }
        });
    }

    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
