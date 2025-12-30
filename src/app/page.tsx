import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { prisma } from "@/lib/prisma";
import { getPortfolioMetrics } from "@/lib/portfolio";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const dynamic = 'force-dynamic';



export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
        <CurrencyProvider>
          <Navbar showPortfolioButton={false} />

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3rem',
            paddingTop: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
                Modern Portfolio<br />Tracker
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                Track your wealth across stocks, crypto, and assets in one beautiful dashboard.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/login" className="glass-panel" style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '280px',
                gap: '1rem',
                textDecoration: 'none',
                borderRadius: '1.5rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Login</div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Access your existing portfolio dashboard.
                </div>
                <div className="glass-button" style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>Sign In</div>
              </Link>

              <Link href="/register" className="glass-panel" style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '280px',
                gap: '1rem',
                textDecoration: 'none',
                borderRadius: '1.5rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sign Up</div>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Create a new account and start tracking.
                </div>
                <div className="glass-button" style={{ marginTop: '1rem', width: '100%', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>Get Started</div>
              </Link>
            </div>
          </div>
        </CurrencyProvider>
      </div>
    );
  }

  // Authenticated View
  let displayAssets: any[] = [];
  let displayTotalValue = 0;

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
      displayAssets = assetsWithValues;
      displayTotalValue = totalValueEUR;
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
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <PortfolioSummary
              isMock={false}
              totalValueEUR={displayTotalValue}
              assets={displayAssets}
            />
          </div>
        </div>
      </CurrencyProvider>
    </div>
  );
}

