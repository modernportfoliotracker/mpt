"use client";

export function TestPage() {
    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <h1>Test Page</h1>
            <button
                onClick={() => alert('Button clicked!')}
                style={{
                    padding: '1rem 2rem',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginTop: '1rem'
                }}
            >
                Click Me
            </button>
            <div style={{ marginTop: '2rem' }}>
                <p>If you can click the button above and see an alert, the problem is in Dashboard component.</p>
                <p>If you cannot click it, there's a global CSS or layout issue.</p>
            </div>
        </div>
    );
}
