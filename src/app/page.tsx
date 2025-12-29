import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { prisma } from "@/lib/prisma";
import { getPortfolioMetrics } from "@/lib/portfolio";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default async function Home() {
  const session = await auth();

  let displayAssets = [
    { symbol: 'AAPL', type: 'STOCK', totalValueEUR: 15000 },
    { symbol: 'BTC', type: 'CRYPTO', totalValueEUR: 12000 },
    { symbol: 'XAU', type: 'GOLD', totalValueEUR: 8000 },
    { symbol: 'GOOGL', type: 'STOCK', totalValueEUR: 7560.85 },
  ];
  let displayTotalValue = 42560.85;
  let isMock = true;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        portfolio: {
          include: { assets: true }
        }
      }
    });

    if (user?.portfolio) {
      const { totalValueEUR, assetsWithValues } = await getPortfolioMetrics(user.portfolio.assets);
      if (assetsWithValues.length > 0) {
        displayAssets = assetsWithValues;
        displayTotalValue = totalValueEUR;
        isMock = false;
      }
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
      <CurrencyProvider>
        <Navbar
          username={session?.user?.name || undefined}
          showPortfolioButton={true}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', paddingTop: '1rem' }}>

          {/* Visual Mockup Preview or Real Portfolio */}
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <PortfolioSummary
              isMock={isMock}
              totalValueEUR={displayTotalValue}
              assets={displayAssets}
            />
          </div>
        </div>
      </CurrencyProvider>
    </div>
  );
}
