"use client";

import React, { useEffect, useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    assetSymbol: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, assetSymbol }: DeleteConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
                backdropFilter: 'blur(5px)',
                background: 'rgba(0,0,0,0.4)', // Dimmed background
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary, #111)', // Fallback to dark if var not set
                    border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy effect
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary, #888)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                    }}
                >
                    <X size={20} />
                </button>

                {/* Icon & Title */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        marginBottom: '0.5rem'
                    }}>
                        <AlertTriangle size={32} strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>Delete Asset?</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.5, maxWidth: '90%' }}>
                        Are you sure you want to remove <span style={{ fontWeight: 700, color: 'var(--text-primary, #fff)' }}>{assetSymbol}</span> from your portfolio? This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                            background: 'transparent',
                            color: 'var(--text-primary, #fff)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
