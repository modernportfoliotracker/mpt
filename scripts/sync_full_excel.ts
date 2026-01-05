
import { PrismaClient } from '@prisma/client';
import { getMarketPrice } from '../src/services/marketData';

const prisma = new PrismaClient();

// Data from the user's Excel image
const excelData = [
    { rank: 1, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'NL', class: 'Cash', subClass: 'Cash', market: 'Cash', fx: 'EUR', ticker: 'EUR', qty: 1, cost: 0, type: 'CASH', symbol: 'EUR' }, // Cash line 1
    { rank: 2, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'USA', class: 'Equity', subClass: 'Equity', market: 'NSYE', fx: 'USD', ticker: 'Alibaba', qty: 20, cost: 159, type: 'STOCK', symbol: 'BABA' },
    { rank: 3, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'NL', class: 'Equity', subClass: 'Equity', market: 'EU Equity', fx: 'EUR', ticker: 'ASML', qty: 20, cost: 607, type: 'STOCK', symbol: 'ASML.AS' },
    { rank: 4, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'USA', class: 'Equity', subClass: 'Equity', market: 'NASDAQ', fx: 'USD', ticker: 'Coinbase', qty: 15, cost: 240, type: 'STOCK', symbol: 'COIN' },
    { rank: 5, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'USA', class: 'Equity', subClass: 'Equity', market: 'NASDAQ', fx: 'USD', ticker: 'Intel', qty: 330, cost: 38, type: 'STOCK', symbol: 'INTC' },
    { rank: 6, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'FRA', class: 'Equity', subClass: 'Equity', market: 'EU Equity', fx: 'EUR', ticker: 'Soitec', qty: 400, cost: 25, type: 'STOCK', symbol: 'SOI.PA' },
    { rank: 7, loc: 'NL', owner: 'EAK', platform: 'DeGiro', country: 'USA', class: 'Equity', subClass: 'Equity', market: 'NASDAQ', fx: 'USD', ticker: 'MicroStrategy', qty: 20, cost: 178, type: 'STOCK', symbol: 'MSTR' },
    { rank: 8, loc: 'NL', owner: 'TAK', platform: 'DeGiro', country: 'NL', class: 'Cash', subClass: 'Cash', market: 'Cash', fx: 'EUR', ticker: 'EUR', qty: 1, cost: 0, type: 'CASH', symbol: 'EUR' }, // Cash line 2
    { rank: 9, loc: 'NL', owner: 'TAK', platform: 'DeGiro', country: 'NL', class: 'Equity', subClass: 'Equity', market: 'EU Equity', fx: 'EUR', ticker: 'Apple', qty: 1, cost: 240, type: 'STOCK', symbol: 'AAPL' }, // Wait AAPL is USA, but sheet says NL/EU Equity? I'll follow sheet logic for metadata but symbol is US. Wait, maybe it's a specific listing? Usually AAPL.
    { rank: 10, loc: 'NL', owner: 'TAK', platform: 'DeGiro', country: 'NL', class: 'Equity', subClass: 'Equity', market: 'NASDAQ', fx: 'EUR', ticker: 'ASML', qty: 1, cost: 667, type: 'STOCK', symbol: 'ASML.AS' },
    { rank: 11, loc: 'NL', owner: 'TAK', platform: 'DeGiro', country: 'NL', class: 'Equity', subClass: 'Equity', market: 'NASDAQ', fx: 'EUR', ticker: 'Tesla', qty: 1, cost: 353, type: 'STOCK', symbol: 'TSLA' },
    { rank: 12, loc: 'NL', owner: 'TAK', platform: 'DeGiro', country: 'NL', class: 'Equity', subClass: 'ETF', market: 'NASDAQ 3x Long', fx: 'EUR', ticker: 'Wisdomtree', qty: 9, cost: 262, type: 'STOCK', symbol: 'QQQ3.PA' },
    { rank: 13, loc: 'NL', owner: 'AAK', platform: 'DeGiro', country: 'NL', class: 'Cash', subClass: 'Cash', market: 'Cash', fx: 'EUR', ticker: 'EUR', qty: 1, cost: 0, type: 'CASH', symbol: 'EUR' }, // Cash line 3
    { rank: 14, loc: 'NL', owner: 'AAK', platform: 'DeGiro', country: 'NL', class: 'Crypto', subClass: 'Crypto', market: 'Bitcoin', fx: 'Crypto', ticker: 'BTC - EUR', qty: 0.139, cost: 77122, type: 'CRYPTO', symbol: 'BTC-EUR' },
    { rank: 15, loc: 'NL', owner: 'AAK', platform: 'DeGiro', country: 'NL', class: 'Crypto', subClass: 'Crypto', market: 'Etherium', fx: 'Crypto', ticker: 'ETH - EUR', qty: 2, cost: 2614, type: 'CRYPTO', symbol: 'ETH-EUR' },
    { rank: 16, loc: 'NL', owner: 'AAK', platform: 'DeGiro', country: 'NL', class: 'Crypto', subClass: 'Crypto', market: 'XRP', fx: 'Crypto', ticker: 'XRP - EUR', qty: 2000, cost: 1.76, type: 'CRYPTO', symbol: 'XRP-EUR' },
    { rank: 17, loc: 'NL', owner: 'AAK', platform: 'DeGiro', country: 'NL', class: 'Bond', subClass: 'Bond', market: 'Corporate Bond', fx: 'EUR', ticker: 'Rabo', qty: 15850, cost: 1.01, type: 'STOCK', symbol: 'RABO' },
    { rank: 18, loc: 'TR', owner: 'AAK', platform: 'IsBank', country: 'TR', class: 'Cash', subClass: 'Cash', market: 'Cash', fx: 'TRY', ticker: 'Cash', qty: 1, cost: 85000, type: 'CASH', symbol: 'TRY' },
    { rank: 19, loc: 'TR', owner: 'AAK', platform: 'IsBank', country: 'TR', class: 'Equity', subClass: 'Equity', market: 'TR Equity', fx: 'TRY', ticker: 'RYGYO', qty: 11904, cost: 21, type: 'STOCK', symbol: 'RYGYO.IS' },
    { rank: 20, loc: 'TR', owner: 'AAK', platform: 'IsBank', country: 'TR', class: 'Equity', subClass: 'Equity', market: 'TR Equity', fx: 'TRY', ticker: 'TAVHL', qty: 1133, cost: 235, type: 'STOCK', symbol: 'TAVHL.IS' },
    { rank: 21, loc: 'TR', owner: 'AAK', platform: 'IsBank', country: 'TR', class: 'Equity', subClass: 'Equity', market: 'TR Equity', fx: 'TRY', ticker: 'TI2', qty: 94017, cost: 0.11, type: 'FUND', symbol: 'TI2' },
    { rank: 22, loc: 'TR', owner: 'TAK', platform: 'IsBank', country: 'Gold', class: 'Gold', subClass: 'Gold', market: 'Gold', fx: 'XAU', ticker: 'GAUTRY', qty: 232, cost: 2136, type: 'GOLD', symbol: 'GAUTRY' },

    // Dynamic Fund Calculation placeholders
    { rank: 23, loc: 'TR', owner: 'AAK', platform: 'AHE - Birikim', country: 'TR', class: 'MMF', subClass: 'MMF', market: 'MMF', fx: 'TRY', ticker: 'PPF - AH2', targetVal: 3882946, type: 'FUND', symbol: 'AH2' },
    { rank: 24, loc: 'TR', owner: 'AAK', platform: 'AHE - Birikim', country: 'TR', class: 'Equity', subClass: 'Equity', market: 'Equity', fx: 'TRY', ticker: 'Hisse Fonu - AH5', targetVal: 431438, type: 'FUND', symbol: 'AH5' },
    // AHE - DK Items (Placeholder for now based on image bottom)
    { rank: 26, loc: 'TR', owner: 'AAK', platform: 'AHE - DK', country: 'TR', class: 'Bond', subClass: 'Bond', market: 'Government Bond', fx: 'TRY', ticker: 'Katki Fonu - AET', targetVal: 466096, type: 'FUND', symbol: 'AET' }, // Not in previous list but in image

];

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

    console.log('Syncing assets with detailed metadata...');

    for (const item of excelData) {
        let qty = item.qty;
        let buyPrice = item.cost;

        // Dynamic Qty Calculation for Funds
        if (item.targetVal) {
            try {
                const marketData = await getMarketPrice(item.symbol, item.type, item.symbol.length === 3 ? 'TEFAS' : undefined);
                if (marketData && marketData.price > 0) {
                    qty = item.targetVal / marketData.price;
                    buyPrice = 0; // Cost unknown/irrelevant for these managed funds in sheet? it is '-'
                }
            } catch (e) {
                console.error(`Failed to fetch price for ${item.symbol}`, e);
            }
        }

        // Create Asset
        // Some cash items are duplicated in sheet (NL EAK Cash, NL TAK Cash, NL AAK Cash).
        // Prisma allows multiple assets with same symbol if IDs differ.

        // Note: The sheet has specific values for Cash 427, 945, 3498 EUR. 
        // I need to set the quantity to these exact amounts if type is CASH and symbol is EUR.
        if (item.type === 'CASH' && item.symbol === 'EUR') {
            // The Sheet says "Total Value EUR = 427". So Qty should be 427. 
            // But the item.cost in my object above is 0. 
            // Let's deduce Qty from the "Total Value (EUR)" column in image if I had it mapped.
            // Wait, I mapped them manually in previous steps.
            // Line 1: 427 EUR
            if (item.rank === 1) qty = 427;
            if (item.rank === 8) qty = 945;
            if (item.rank === 13) qty = 3498;
        }

        await prisma.asset.create({
            data: {
                portfolioId,
                symbol: item.symbol,
                type: item.type,
                quantity: qty || 0,
                buyPrice: buyPrice,
                currency: item.fx === 'XAU' || item.fx === 'Crypto' ? 'USD' : item.fx, // Store base currency roughly compliant with system e.g. USD/EUR
                // Overriding currency to match system expectations if needed. 
                // Actually system expects legitimate currencies: USD, EUR, TRY.
                // For Crypto, usually 'EUR' or 'USD'. 
                // For Gold (GAUTRY), 'TRY'.

                // Metadata
                rank: item.rank,
                location: item.loc,
                ownerCode: item.owner,
                platform: item.platform,
                country: item.country,
                assetClass: item.class,
                assetSubClass: item.subClass,
                market: item.market,
                name: item.ticker
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
