interface BarChartProps {
    data: { name: string; value: number; }[];
    totalValue: number;
    colors: string[];
    hoveredItem: string | null;
    onHover: (name: string | null) => void;
}

export function BarChart({ data, totalValue, colors, hoveredItem, onHover }: BarChartProps) {
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '0.5rem 0' }}>
            {sortedData.map((item, index) => {
                const pct = (item.value / totalValue) * 100;
                const color = colors[index % colors.length];
                const isHovered = hoveredItem === item.name;

                return (
                    <div
                        key={item.name}
                        onMouseEnter={() => onHover(item.name)}
                        onMouseLeave={() => onHover(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            opacity: (hoveredItem && !isHovered) ? 0.3 : 1,
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            marginBottom: '0.4rem'
                        }}
                    >
                        {/* Label - Left Aligned */}
                        <div style={{
                            minWidth: '90px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {item.name}
                        </div>

                        {/* Bar Container */}
                        <div style={{
                            flex: 1,
                            height: '28px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.5rem',
                            position: 'relative',
                            overflow: 'visible'
                        }}>
                            {/* Bar Fill */}
                            <div style={{
                                width: `${Math.max(pct, 2)}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${color}60, ${color})`,
                                borderRadius: '0.5rem',
                                transition: 'width 0.5s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: pct < 15 ? 'flex-start' : 'flex-end',
                                paddingLeft: pct < 15 ? '0.5rem' : '0',
                                paddingRight: pct < 15 ? '0' : '0.75rem',
                                position: 'relative'
                            }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: pct < 15 ? color : '#fff',
                                    textShadow: pct < 15 ? 'none' : '0 1px 3px rgba(0,0,0,0.7)',
                                    position: pct < 15 ? 'absolute' : 'relative',
                                    left: pct < 15 ? 'calc(100% + 0.5rem)' : 'auto',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {pct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
