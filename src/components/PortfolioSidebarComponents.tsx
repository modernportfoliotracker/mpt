"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { PortfolioChart } from "./PortfolioChart";
import { ASSET_COLORS } from "@/lib/constants";
import { ALLOCATION_VIEWS, TABS } from "@/lib/portfolioConstants";

// --- Shared Constants & Helpers ---
// const TABS = ["1D", "1W", "1M", "YTD", "1Y", "ALL"];
// const ALLOCATION_VIEWS = ["Type", "Sector", "Platform", "Country"];
const DEFAULT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6', '#f97316'];

const getCountryFromExchange = (exchange?: string): string => {
    if (!exchange) return 'Unknown';
    const ex = exchange.toUpperCase();
    if (ex.includes('BIST') || ex.includes('IST')) return 'Turkey';
    if (ex.includes('NASDAQ') || ex.includes('NYSE')) return 'USA';
    if (ex.includes('LON') || ex.includes('LSE')) return 'UK';
    if (ex.includes('FRA')) return 'Germany';
    if (ex.includes('PAR')) return 'France';
    return 'Other';
};

interface BaseProps {
    totalValueEUR: number;
    isMock?: boolean;
    isBlurred?: boolean;
}

// --- Unified Component: Total Value + Returns ---
export function UnifiedPortfolioSummary({ totalValueEUR, isMock = false, isBlurred = false }: BaseProps) {
    const [activeTab, setActiveTab] = useState("1D");
    const { currency } = useCurrency();

    const rates = { EUR: 1, USD: 1.05, TRY: 38.5 };
    const currencySymbols = { EUR: "€", USD: "$", TRY: "₺" };
    // @ts-ignore
    const convert = (amount: number) => amount * (rates[currency as keyof typeof rates] || 1);
    // @ts-ignore
    const sym = currencySymbols[currency as keyof typeof currencySymbols] || "€";

    const displayBalance = convert(totalValueEUR);

    // Derived Stats
    const totalReturnAmtEUR = isMock ? 1245.50 : (totalValueEUR * 0.12);
    const totalReturnPct = isMock ? 15.4 : 12.0;

    const factor = activeTab === "1D" ? 0.05 : activeTab === "1W" ? 0.3 : activeTab === "1M" ? 0.5 : activeTab === "YTD" ? 0.7 : activeTab === "1Y" ? 0.9 : 1;
    const periodReturnAmtEUR = totalReturnAmtEUR * factor; // Mock logic
    const periodReturnPct = totalReturnPct * factor;
    const displayPeriodReturn = convert(periodReturnAmtEUR);
    const isPositive = periodReturnAmtEUR >= 0;

    return (
        <div className="glass-panel" style={{
            borderRadius: '0.6rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            {/* Top Section: Total Value */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '4px', height: '1.2rem', background: '#ffc107', borderRadius: '2px', boxShadow: '0 0 10px rgba(255, 193, 7, 0.4)' }}></div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        Total Portfolio
                    </div>
                </div>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#ffc107',
                    filter: isBlurred ? 'blur(8px)' : 'none',
                    lineHeight: 1,
                    textShadow: '0 0 20px rgba(255, 193, 7, 0.2)'
                }}>
                    {sym}{displayBalance.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                </div>
            </div>

            {/* Middle Section: Time Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', background: 'var(--glass-bg)', padding: '0.2rem', borderRadius: '0.5rem', width: '100%' }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            background: activeTab === tab ? 'var(--bg-active)' : 'transparent',
                            border: 'none',
                            borderRadius: '0.4rem',
                            color: activeTab === tab ? 'var(--text-active)' : 'var(--text-muted)',
                            padding: '0.4rem 0',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Bottom Section: Returns (Side by Side) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: isPositive ? '#10b981' : '#ef4444',
                }}>
                    {isPositive ? '+' : ''}{periodReturnPct.toFixed(2)}%
                </div>
                <div style={{ width: '1px', height: '1.2rem', background: 'var(--glass-border)' }}></div>
                <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: isPositive ? '#10b981' : '#ef4444',
                    opacity: 0.9
                }}>
                    {isPositive ? '+' : ''}{sym}{displayPeriodReturn.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                </div>
            </div>
        </div>
    );
}

// Keeping legacy for now if needed, but not exporting them effectively replaces usage if I update imports.
// Actually I'm replacing the block so TotalValueCard and ReturnsCard are GONE from this file chunk.


// --- Component 3: AllocationCard ---
interface AllocationCardProps extends BaseProps {
    assets: any[];
}

export function AllocationCard({ assets, totalValueEUR, isBlurred = false }: AllocationCardProps) {
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
    const [allocationView, setAllocationView] = useState("Type");
    const { currency } = useCurrency();

    const rates = { EUR: 1, USD: 1.05, TRY: 38.5 };
    const currencySymbols = { EUR: "€", USD: "$", TRY: "₺" };
    // @ts-ignore
    const convert = (amount: number) => amount * (rates[currency as keyof typeof rates] || 1);
    // @ts-ignore
    const sym = currencySymbols[currency as keyof typeof currencySymbols] || "€";

    const displayBalance = convert(totalValueEUR);

    // Chart Data Logic
    const getChartData = () => {
        let data: { name: string; value: number; color?: string }[] = [];
        // @ts-ignore
        switch (allocationView) {
            case "Type":
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    // @ts-ignore
                    const existing = acc.find(item => item.name === asset.type);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; }
                    // @ts-ignore
                    else { acc.push({ name: asset.type, value: asset.totalValueEUR, color: ASSET_COLORS[asset.type] || ASSET_COLORS['DEFAULT'] }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Positions":
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    const name = asset.symbol || asset.name || 'Unknown';
                    // @ts-ignore
                    const existing = acc.find(item => item.name === name);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Sectors":
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    const name = asset.sector || 'Unknown';
                    // @ts-ignore
                    const existing = acc.find(item => item.name === name);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;

            case "Countries":
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    const name = asset.country || getCountryFromExchange(asset.exchange);
                    // @ts-ignore
                    const existing = acc.find(item => item.name === name);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Currencies":
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    const name = asset.currency || 'Unknown';
                    // @ts-ignore
                    const existing = acc.find(item => item.name === name);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
            // Legacy/Fallback cases just in case
            case "Platform": // Keeping platform logic if "Platform" was ever passed, though removed from TABS
                // @ts-ignore
                data = assets.reduce((acc, asset) => {
                    const name = asset.platform || 'Unknown';
                    // @ts-ignore
                    const existing = acc.find(item => item.name === name);
                    // @ts-ignore
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
        }
        return data;
    };

    const rawChartData = getChartData();
    const chartData = rawChartData.map((item, index) => ({
        ...item,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
    const sortedData = [...chartData].sort((a, b) => b.value - a.value);
    const totalVal = sortedData.reduce((sum, item) => sum + item.value, 0);

    const hoveredItem = hoveredSlice ? chartData.find(i => i.name === hoveredSlice) : null;
    const hoveredValue = hoveredItem ? convert(hoveredItem.value) : displayBalance;
    const hoveredPct = hoveredItem ? (hoveredItem.value / totalVal * 100) : null;

    return (
        <div className="glass-panel" style={{
            borderRadius: '0.6rem', // Match left side rounding
            padding: '0.6rem',
            paddingLeft: '0', // Zero out left padding as requested
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>

            {/* View Toggles */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.3rem', background: 'var(--glass-bg)', padding: '0.2rem', borderRadius: '0.5rem' }}>
                {ALLOCATION_VIEWS.map(view => (
                    <button
                        key={view}
                        onClick={() => setAllocationView(view)}
                        style={{
                            background: allocationView === view ? 'var(--bg-active)' : 'transparent',
                            border: 'none',
                            borderRadius: '0.4rem',
                            color: allocationView === view ? 'var(--text-active)' : 'var(--text-muted)',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {view}
                    </button>
                ))}
            </div>

            {/* Content Area: Chart (Left) + Legend (Right) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2%', marginTop: '0.2rem', height: '100%' }}>

                {/* Left: Chart (Maximized in smaller container) */}
                <div style={{ position: 'relative', width: '58%', aspectRatio: '1/1' }}>
                    <PortfolioChart
                        assets={chartData}
                        totalValueEUR={totalValueEUR}
                        showLegend={false}
                        onHover={setHoveredSlice}
                        activeSliceName={hoveredSlice}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        width: '70%'
                    }}>
                        {/* Center Text: Name */}
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', marginBottom: '0', lineHeight: 1.2 }}>
                            {hoveredSlice ? hoveredSlice : 'Net Worth'}
                        </div>

                        {/* Center Text: Value */}
                        <div style={{
                            fontSize: hoveredSlice ? '0.9rem' : '1.1rem',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            filter: isBlurred ? 'blur(8px)' : 'none',
                            transition: 'all 0.2s',
                            color: 'var(--text-primary)',
                            marginTop: '0.1rem'
                        }}>
                            {sym}{hoveredValue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>

                        {/* Center Text: Percentage */}
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            marginTop: '0.1rem'
                        }}>
                            {hoveredSlice ? `${Math.round(hoveredPct || 0)}%` : '100%'}
                        </div>
                    </div>
                </div>

                {/* Right: Vertical List Legend */}
                {/* Right: Vertical List Legend */}
                <div style={{
                    flex: '0 1 auto',
                    display: 'table', // Strict table layout
                    borderCollapse: 'separate',
                    borderSpacing: '0 0.2rem', // Vertical spacing between rows
                    width: 'fit-content',
                    minWidth: '30%',
                    maxWidth: '45%',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingLeft: '0',
                    paddingRight: '0'
                }}>
                    {sortedData.map((item, index) => {
                        const color = (item as any).color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                        const isHovered = hoveredSlice === item.name;
                        const pct = (item.value / totalVal * 100);

                        return (
                            <div
                                key={item.name}
                                onMouseEnter={() => setHoveredSlice(item.name)}
                                onMouseLeave={() => setHoveredSlice(null)}
                                style={{
                                    display: 'table-row',
                                    backgroundColor: color, // Solid slice color
                                    transition: 'all 0.2s',
                                    cursor: 'default',
                                    opacity: isHovered ? 1 : 0.9 // Subtle hover effect
                                }}
                            >
                                <div style={{
                                    display: 'table-cell',
                                    verticalAlign: 'middle',
                                    paddingLeft: '0.4rem',
                                    paddingRight: '0.5rem',
                                    paddingTop: '0.15rem',
                                    paddingBottom: '0.15rem',
                                    borderTopLeftRadius: '0.3rem',
                                    borderBottomLeftRadius: '0.3rem'
                                }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: '#fff', // White text
                                        opacity: 1,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        fontSize: '0.65rem',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.2,
                                        display: 'block'
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'table-cell',
                                    verticalAlign: 'middle',
                                    paddingRight: '0.4rem',
                                    paddingTop: '0.15rem',
                                    paddingBottom: '0.15rem',
                                    borderTopRightRadius: '0.3rem',
                                    borderBottomRightRadius: '0.3rem',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'right'
                                }}>
                                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.65rem' }}>{Math.round(pct)}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
