"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface PortfolioChartProps {
    assets: {
        name: string;
        value: number;
        color?: string;
    }[];
    totalValueEUR: number;
    showLegend?: boolean;
    onHover?: (name: string | null) => void;
    activeSliceName?: string | null;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6', '#f97316'];

export function PortfolioChart({ assets, totalValueEUR, showLegend = true, onHover, activeSliceName }: PortfolioChartProps) {
    const chartData = assets;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', outline: 'none' }}>
            <div style={{ width: '100%', height: '100%', outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="75%"
                            outerRadius="100%"
                            paddingAngle={2}
                            dataKey="value"
                            onMouseEnter={(data) => onHover?.(data.name)}
                            onMouseLeave={() => onHover?.(null)}
                            style={{ outline: 'none', cursor: 'pointer' }}
                        >
                            {chartData.map((entry, index) => {
                                const isActive = activeSliceName === entry.name;
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || COLORS[index % COLORS.length]}
                                        style={{
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            transformOrigin: 'center',
                                            transition: 'transform 0.3s ease',
                                            outline: 'none'
                                        }}
                                    />
                                );
                            })}
                        </Pie>
                        {showLegend && <Legend />}
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
