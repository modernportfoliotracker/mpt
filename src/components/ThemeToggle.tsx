'use client';

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="glass-button"
            style={{
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                padding: '0.4rem',
                borderRadius: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}
