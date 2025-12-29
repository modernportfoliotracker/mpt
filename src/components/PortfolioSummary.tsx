"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { PortfolioChart } from "./PortfolioChart";
import { BarChart } from "./BarChart";
import { ASSET_COLORS } from "@/lib/constants";

interface PortfolioSummaryProps {
    assets: {
        symbol: string;
        totalValueEUR: number;
        type: string;
        exchange?: string;
        sector?: string;
        currency?: string;
        country?: string;
        platform?: string;
    }[];
    totalValueEUR: number;
    isMock?: boolean;
    isBlurred?: boolean;
}

const TABS = ["1D", "1W", "1M", "YTD", "1Y", "ALL"];
const CURRENCIES = ["EUR", "USD", "TRY"] as const;
const ALLOCATION_VIEWS = ["Type", "Sector", "Platform", "Country"]; // Reduced list for compactness
const DEFAULT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6', '#f97316'];

// Country mapping from exchange
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

export function PortfolioSummary({ assets, totalValueEUR, isMock = false, isBlurred = false }: PortfolioSummaryProps) {
    const [activeTab, setActiveTab] = useState("1D");
    const { currency } = useCurrency();
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
    const [allocationView, setAllocationView] = useState("Type");
    const [chartView, setChartView] = useState<"pie" | "bar">("pie");

    // Static conversion rates for UI smoothness
    const rates: Record<string, number> = { EUR: 1, USD: 1.05, TRY: 38.5, ORG: 1 };
    const currencySymbols: Record<string, string> = { EUR: "€", USD: "$", TRY: "₺", ORG: "" };

    const convert = (amount: number) => {
        const rate = rates[currency] || 1;
        return amount * rate;
    };

    // Derived Stats
    const totalReturnAmtEUR = isMock ? 1245.50 : (totalValueEUR * 0.12);
    const totalReturnPct = isMock ? 15.4 : 12.0;

    // Period stats
    const factor = activeTab === "1D" ? 0.05 : activeTab === "1W" ? 0.3 : 1;
    const periodReturnAmtEUR = totalReturnAmtEUR * factor;
    const periodReturnPct = totalReturnPct * factor;

    // Display Values
    const displayBalance = convert(totalValueEUR);
    const displayPeriodReturn = convert(periodReturnAmtEUR);
    const displayTotalReturn = convert(totalReturnAmtEUR);
    const sym = currencySymbols[currency];

    // Dynamic data based on allocation view
    const getChartData = () => {
        let data: { name: string; value: number; color?: string }[] = [];

        switch (allocationView) {
            case "Type":
                data = assets.reduce((acc, asset) => {
                    const existing = acc.find(item => item.name === asset.type);
                    if (existing) { existing.value += asset.totalValueEUR; }
                    else { acc.push({ name: asset.type, value: asset.totalValueEUR, color: ASSET_COLORS[asset.type] || ASSET_COLORS['DEFAULT'] }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Sector":
                data = assets.reduce((acc, asset) => {
                    const name = asset.sector || 'Unknown';
                    const existing = acc.find(item => item.name === name);
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Platform":
                data = assets.reduce((acc, asset) => {
                    const name = asset.platform || 'Unknown';
                    const existing = acc.find(item => item.name === name);
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
            case "Country":
                data = assets.reduce((acc, asset) => {
                    const name = asset.country || getCountryFromExchange(asset.exchange);
                    const existing = acc.find(item => item.name === name);
                    if (existing) { existing.value += asset.totalValueEUR; } else { acc.push({ name, value: asset.totalValueEUR }); }
                    return acc;
                }, [] as typeof data);
                break;
        }
        return data;
    };

    const chartData = getChartData();
    const sortedData = [...chartData].sort((a, b) => b.value - a.value);
    const totalVal = sortedData.reduce((sum, item) => sum + item.value, 0);

    // Hovered Data
    const hoveredItem = hoveredSlice ? chartData.find(i => i.name === hoveredSlice) : null;
    const hoveredValue = hoveredItem ? convert(hoveredItem.value) : displayBalance;
    const hoveredPct = hoveredItem ? (hoveredItem.value / totalVal * 100) : null;

    return (
        <div className="glass-panel" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: 'fit-content' // Adapts to content height
        }}>

            {/* Header: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '4px', height: '1.4rem', background: '#ffc107', borderRadius: '2px', boxShadow: '0 0 10px rgba(255, 193, 7, 0.4)' }}></div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Total Portfolio</h2>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 900,
                            color: '#ffc107',
                            marginLeft: 'auto',
                            filter: isBlurred ? 'blur(8px)' : 'none',
                            textShadow: '0 0 15px rgba(255, 193, 7, 0.2)'
                        }}>
                            {sym}{displayBalance.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>

                {/* Return Stats (Row) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* Left: Time & Label */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.15rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '0.4rem' }}>
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: activeTab === tab ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '0.3rem',
                                        color: activeTab === tab ? '#6366f1' : 'rgba(255,255,255,0.3)',
                                        padding: '0.2rem 0.4rem',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.3, fontWeight: 700, letterSpacing: '0.05em', marginLeft: '0.2rem' }}>RETURN ({activeTab})</div>
                    </div>

                    {/* Right: Amount & Pct */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: periodReturnAmtEUR >= 0 ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                            {periodReturnAmtEUR >= 0 ? '+' : ''}{sym}{displayPeriodReturn.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: periodReturnAmtEUR >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)', marginTop: '0.2rem' }}>
                            {periodReturnPct.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Allocation Toggles (Now at mid-top) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {ALLOCATION_VIEWS.map(view => (
                            <button
                                key={view}
                                onClick={() => setAllocationView(view)}
                                style={{
                                    background: allocationView === view ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.35rem',
                                    color: allocationView === view ? '#fff' : 'rgba(255,255,255,0.4)',
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

                    {/* Currency Selector Removed from here as it's now in the Top Nav */}
                </div>
            </div>

            {/* Chart Section */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', maxHeight: '320px', margin: '0 auto' }}>
                <PortfolioChart
                    assets={chartData}
                    totalValueEUR={totalValueEUR}
                    showLegend={false}
                    onHover={setHoveredSlice}
                    activeSliceName={hoveredSlice}
                />

                {/* Center Content: Total Balance or Hover Info */}
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
                    width: '60%' // Prevent text overflow
                }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        {hoveredSlice ? hoveredSlice : 'Net Worth'}
                    </div>

                    <div style={{
                        fontSize: hoveredSlice ? '1.8rem' : '2.2rem',
                        fontWeight: 800,
                        lineHeight: 1,
                        filter: isBlurred ? 'blur(8px)' : 'none',
                        transition: 'all 0.2s',
                        color: hoveredItem?.color ? hoveredItem.color : '#fff'
                    }}>
                        {sym}{hoveredValue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>

                    {hoveredSlice && (
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.3rem', opacity: 0.8 }}>
                            {hoveredPct?.toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Legend (Compact Grid) */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginTop: '0.5rem'
            }}>
                {sortedData.map((item, index) => {
                    const color = (item as any).color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    const isHovered = hoveredSlice === item.name;
                    const pct = (item.value / totalVal * 100);
                    const val = convert(item.value);

                    return (
                        <div
                            key={item.name}
                            onMouseEnter={() => setHoveredSlice(item.name)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.6rem',
                                background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderRadius: '0.5rem',
                                cursor: 'default',
                                transition: 'all 0.2s',
                                opacity: hoveredSlice && !isHovered ? 0.3 : 1,
                                flex: '1 1 calc(50% - 0.4rem)', // 2 per row
                                minWidth: '140px'
                            }}
                        >
                            <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.3rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>{pct.toFixed(1)}%</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginTop: '-1px' }}>
                                    {sym}{val.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
}
