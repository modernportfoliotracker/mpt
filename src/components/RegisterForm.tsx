"use client";

import { useActionState, useEffect } from "react";
import { register } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function RegisterForm() {
    const [errorMessage, formAction] = useActionState(register, undefined);
    const router = useRouter();

    useEffect(() => {
        if (errorMessage === "success") {
            router.push("/login");
        }
    }, [errorMessage, router]);

    return (
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Start tracking your wealth today</p>

            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                    <input name="username" type="text" required className="glass-input" placeholder="johndoe" />
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.2rem' }}>This will be your public URL.</p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                    <input name="email" type="email" required className="glass-input" placeholder="you@example.com" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                    <input name="password" type="password" required className="glass-input" placeholder="•••••••" />
                </div>

                {errorMessage && errorMessage !== "success" && (
                    <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errorMessage}</div>
                )}

                <button type="submit" className="glass-button" style={{ marginTop: '1rem' }}>
                    Create Account
                </button>
            </form>
        </div>
    );
}
