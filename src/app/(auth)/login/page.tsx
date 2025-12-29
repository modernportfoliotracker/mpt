import { authenticate } from "@/lib/actions";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
    return (
        <>
            <Navbar />
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back</h2>
                    <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Login to access your portfolio</p>

                    <form action={async (formData) => {
                        "use server";
                        await authenticate(undefined, formData);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                            <input name="email" type="email" required className="glass-input" placeholder="you@example.com" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                            <input name="password" type="password" required className="glass-input" placeholder="•••••••" />
                        </div>

                        <button type="submit" className="glass-button" style={{ marginTop: '1rem' }}>
                            Login
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                            Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Sign up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
