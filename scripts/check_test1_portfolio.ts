
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test1@example.com' },
        include: {
            portfolio: {
                include: {
                    assets: true
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User: ${user.username} (${user.email})`);
    if (!user.portfolio) {
        console.log('No portfolio found');
        return;
    }

    console.log(`Portfolio ID: ${user.portfolio.id}`);
    console.table(user.portfolio.assets.map(a => ({
        symbol: a.symbol,
        type: a.type,
        quantity: a.quantity,
        buyPrice: a.buyPrice,
        currency: a.currency
    })));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
