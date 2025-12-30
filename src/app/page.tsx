import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { prisma } from "@/lib/prisma";
import { getPortfolioMetrics } from "@/lib/portfolio";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { authenticate } from "@/lib/actions";

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
            gap: '2rem',
            paddingTop: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                Modern Portfolio<br />Tracker
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                Track your wealth in style.
              </p>
            </div>

            {/* Login Form Card */}
            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Welcome back</h2>
              <p style={{ opacity: 0.6, marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Login to access your dashboard</p>

              <form action={async (formData) => {
                "use server";
                await authenticate(undefined, formData);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
                  <input name="email" type="email" required className="glass-input" placeholder="you@example.com" style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
                  <input name="password" type="password" required className="glass-input" placeholder="•••••••" style={{ width: '100%' }} />
                </div>

                <button type="submit" className="glass-button" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                  Login
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                  Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Sign up</Link>
                </div>
              </form>
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

