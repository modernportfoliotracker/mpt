"use client";

interface HideValuesButtonProps {
    isBlurred: boolean;
    onToggle: () => void;
}

export function HideValuesButton({ isBlurred, onToggle }: HideValuesButtonProps) {
    return (
        <button
            onClick={onToggle}
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
            {isBlurred ? '👁️ Show Values' : '🙈 Hide Values'}
        </button>
    );
}
