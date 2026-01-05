
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test1@example.com' },
        include: { portfolio: { include: { assets: true } } }
    });

    if (!user?.portfolio) return;
    const portfolioId = user.portfolio.id;

    // Find TRY Cash
    const tryCash = user.portfolio.assets.find(a => a.symbol === 'TRY' && a.type === 'CASH');
    if (tryCash) {
        console.log(`Updating TRY Cash from Qty ${tryCash.quantity} to 85000`);
        await prisma.asset.update({
            where: { id: tryCash.id },
            data: { quantity: 85000, buyPrice: 1 } // Cost basis 1, qty is amount
        });
    }
}

main();
