import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Dashboard from "@/components/DashboardV2";
import { Navbar } from "@/components/Navbar";
import { ClientWrapper } from "@/components/ClientWrapper";
import { getPortfolioMetrics } from "@/lib/portfolio";
import { prisma } from "@/lib/prisma";

import { getExchangeRates } from "@/lib/exchangeRates";

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const session = await auth();

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            portfolio: {
                include: { assets: true }
            }
        }
    });

    if (!user || !user.portfolio) {
        notFound();
    }

    const isOwner = session?.user?.email === user.email;

    // Fetch dynamic rates
    const rates = await getExchangeRates();

    // Process Assets using shared logic with dynamic rates
    const { totalValueEUR: totalPortfolioValueEUR, assetsWithValues } = await getPortfolioMetrics(user.portfolio.assets, rates);

    return (
        <ClientWrapper
            username={username}
            isOwner={isOwner}
            totalValueEUR={totalPortfolioValueEUR}
            assets={assetsWithValues}
            exchangeRates={rates}
            navbar={
                <Navbar
                    totalBalance={totalPortfolioValueEUR}
                    username={username}
                    isOwner={isOwner}
                />
            }
        />
    );
}
