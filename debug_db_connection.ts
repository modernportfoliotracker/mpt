
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    const username = "testuser";
    console.log(`Attempting to fetch full profile for user: ${username}`);

    try {
        await prisma.$connect();

        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                portfolio: {
                    include: { assets: true }
                }
            }
        });

        if (user) {
            console.log(`User found: ${user.username}`);
            console.log(`Portfolio ID: ${user.portfolio?.id}`);
            console.log(`Assets count: ${user.portfolio?.assets.length}`);
            if (user.portfolio?.assets) {
                user.portfolio.assets.forEach(a => {
                    console.log(`Asset: ${a.symbol} | Qty: ${a.quantity} | Valid Float? ${!Number.isNaN(a.quantity)}`);
                });
            }
        } else {
            console.log("User not found.");
        }

    } catch (e) {
        console.error("Query Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
