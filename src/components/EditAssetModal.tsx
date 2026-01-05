"use client";

import React, { useState, useEffect } from 'react';
import { AssetDisplay } from '@/lib/types';
import { X, Save, Trash2, Calendar } from 'lucide-react';
import { updateAsset, deleteAsset } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface EditAssetModalProps {
    asset: AssetDisplay;
    isOpen: boolean;
    onClose: () => void;
}

export function EditAssetModal({ asset, isOpen, onClose }: EditAssetModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: asset.name || '',
        symbol: asset.symbol,
        quantity: asset.quantity,
        buyPrice: asset.buyPrice,
        type: asset.type,
        exchange: asset.exchange || '',
        currency: asset.currency,
        country: asset.country || '',
        sector: asset.sector || '',
        nextEarningsDate: asset.nextEarningsDate ? new Date(asset.nextEarningsDate).toISOString().split('T')[0] : ''
    });

    // Reset form when asset changes
    useEffect(() => {
        setFormData({
            name: asset.name || '',
            symbol: asset.symbol,
            quantity: asset.quantity,
            buyPrice: asset.buyPrice,
            type: asset.type,
            exchange: asset.exchange || '',
            currency: asset.currency,
            country: asset.country || '',
            sector: asset.sector || '',
            nextEarningsDate: asset.nextEarningsDate ? new Date(asset.nextEarningsDate).toISOString().split('T')[0] : ''
        });
    }, [asset]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await updateAsset(asset.id, {
                name: formData.name,
                symbol: formData.symbol,
                quantity: Number(formData.quantity),
                buyPrice: Number(formData.buyPrice),
                type: formData.type,
                exchange: formData.exchange,
                currency: formData.currency,
                country: formData.country,
                sector: formData.sector,
                nextEarningsDate: formData.nextEarningsDate ? new Date(formData.nextEarningsDate) : null,
                customGroup: asset.customGroup || undefined
            });

            if (res.error) {
                alert(res.error);
            } else {
                router.refresh();
                onClose();
            }
        } catch (error) {
            console.error("Failed to save:", error);
            alert("An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        setIsLoading(true);
        try {
            const res = await deleteAsset(asset.id);
            if (res.error) {
                alert(res.error);
            } else {
                router.refresh();
                onClose();
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Use Portal to render at root level to avoid z-index/transform issues
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            {/* 1. Dynamic Blur Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease'
                }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* 2. Modern Notification Card centered */}
            <div className="glass-panel" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                animation: 'zoomIn 0.2s ease',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1.125rem',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {formData.symbol.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{formData.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)'
                                }}>{formData.symbol}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.exchange}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="custom-scrollbar" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Section 1: Main Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Symbol</label>
                                    <input
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleChange}
                                        className="glass-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="glass-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="glass-input"
                                        style={{ appearance: 'none' }}
                                    >
                                        {["STOCK", "CRYPTO", "GOLD", "BOND", "FUND", "CASH", "COMMODITY"].map(t => (
                                            <option key={t} value={t} style={{ color: '#000' }}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Currency</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="glass-input"
                                        style={{ appearance: 'none' }}
                                    >
                                        {["USD", "EUR", "TRY"].map(c => (
                                            <option key={c} value={c} style={{ color: '#000' }}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financials */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position Data</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Quantity</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        step="any"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="glass-input"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Avg Cost</label>
                                    <input
                                        name="buyPrice"
                                        type="number"
                                        step="any"
                                        value={formData.buyPrice}
                                        onChange={handleChange}
                                        className="glass-input"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={12} style={{ opacity: 0.7 }} /> Next Earnings (Optional)
                                </label>
                                <input
                                    name="nextEarningsDate"
                                    type="date"
                                    value={formData.nextEarningsDate}
                                    onChange={handleChange}
                                    className="glass-input"
                                />
                            </div>
                        </div>

                        {/* Section 3: Metadata */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Sector</label>
                                    <input
                                        name="sector"
                                        value={formData.sector}
                                        onChange={handleChange}
                                        placeholder="Tech, Finance..."
                                        className="glass-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>Country</label>
                                    <input
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="US, DE..."
                                        className="glass-input"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            cursor: 'pointer',
                            padding: '0.375rem 0.5rem',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                transition: 'color 0.2s'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="glass-button"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1.25rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
