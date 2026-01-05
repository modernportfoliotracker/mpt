
import { PrismaClient } from '@prisma/client';
import { getPortfolioMetrics } from './src/lib/portfolio';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test1@example.com' },
        include: { portfolio: { include: { assets: true } } }
    });

    if (!user?.portfolio) return;

    console.log("Simulating Portfolio Metrics Calculation...");
    // Mock customRates if needed, or pass undefined to use default
    const metrics = await getPortfolioMetrics(user.portfolio.assets);

    console.log(`TOTAL VALUE EUR: ${metrics.totalValueEUR}`);

    // Also print detail of questionable assets
    const culprits = ['GAUTRY', 'AET', 'AH2', 'AH5', 'TRY'];
    metrics.assetsWithValues.filter(a => culprits.includes(a.symbol)).forEach(a => {
        console.log(`Asset: ${a.symbol}, Qty: ${a.quantity}, Price: ${a.currentPrice}, Val: ${a.totalValueEUR}`);
    });
}

main();
