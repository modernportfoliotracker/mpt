import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDailyStats } from "@/services/telemetry";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth();

    // Basic protection
    if (!session?.user) {
        redirect("/?login=true");
    }
    // Optional: Add specific user check here if needed (e.g. if (session.user.email !== 'admin@...'))

    const stats = await getDailyStats();

    // Aggregation
    const totalRequests = stats.reduce((acc, s) => acc + s.successCount + s.errorCount, 0);
    const totalErrors = stats.reduce((acc, s) => acc + s.errorCount, 0);

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>System Monitor</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* HEADLINE CARDS */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.5rem' }}>Total Requests (Today)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalRequests}</div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: totalErrors > 0 ? '1px solid #ff4444' : undefined }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.5rem' }}>Total Errors</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: totalErrors > 0 ? '#ff4444' : '#4caf50' }}>{totalErrors}</div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.5rem' }}>Database Cost Est.</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$0.00</div>
                    <small style={{ opacity: 0.6 }}>Neon Free Tier</small>
                </div>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Provider Health</h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Provider</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Success</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Errors</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Success Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(s => {
                            const total = s.successCount + s.errorCount;
                            const rate = total > 0 ? ((s.successCount / total) * 100).toFixed(1) : '0.0';
                            return (
                                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{s.provider}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.dateKey}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#4caf50' }}>{s.successCount}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: s.errorCount > 0 ? '#ff4444' : 'inherit' }}>{s.errorCount}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{total}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{rate}%</td>
                                </tr>
                            );
                        })}
                        {stats.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                                    No activity recorded today yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6 }}>
                <p>Note: These stats reset daily at 00:00 UTC. Yahoo Free Tier has no strict hard limit but usually allows ~2000 requests/hour IP-based.</p>
            </div>
        </div>
    );
}
