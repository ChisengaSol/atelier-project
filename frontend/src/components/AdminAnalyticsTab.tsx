import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

const AdminAnalyticsTab = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
    const [donutHovered, setDonutHovered] = useState<{ cat: any, x: number, y: number } | null>(null);
    const [barTooltip, setBarTooltip] = useState({ visible: false, x: 0, y: 0, content: null as any });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/admin/analytics');
                const json = await res.json();
                if (res.ok && json.status === 'success') {
                    setData(json.data);
                }
            } catch (error) {
                console.error("Failed to load analytics data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading || !data) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#666' }}>Loading analytics...</div>;
    }

    const chartData = data.chartData;
    
    const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 100);
    const maxOrders = Math.max(...chartData.map((d: any) => d.orders), 10);
    
    const linePoints = chartData.map((d: any, i: number) => {
        const x = i * (600 / (chartData.length > 1 ? chartData.length - 1 : 1));
        const y = maxRevenue > 0 ? 200 - (d.revenue / maxRevenue) * 200 : 200;
        return { x, y, ...d };
    });
    
    const svgPath = `M ${linePoints.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`;
    const areaPath = `${svgPath} L 600 200 L 0 200 Z`;

    const colors = ["#c9a76d", "#111111", "#555555", "#888888", "#e5e5e5"];
    let cumulativePercent = 0;

    const dateRangeText = chartData.length > 0 
        ? `${chartData[0].month} – ${chartData[chartData.length - 1].month} ${new Date().getFullYear()}` 
        : "";

    return (
        <div className="admin-analytics-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Analytics</h1>
                    <span className="admin-page-subtitle">{dateRangeText} · Live data</span>
                </div>
                <div className="admin-date-dropdown">
                    <select defaultValue="last-6">
                        <option value="last-6">Last 6 months</option>
                        <option value="last-12">Last 12 months</option>
                        <option value="ytd">Year to date</option>
                    </select>
                    <ChevronDown size={14} className="dropdown-icon" />
                </div>
            </div>

            <div className="admin-metrics-grid">
                <div className="analytics-metric-card">
                    <h2>${data.grossRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</h2>
                    <span className="analytics-metric-label">GROSS REVENUE</span>
                    <span className="analytics-metric-trend">Live calculation</span>
                </div>
                <div className="analytics-metric-card">
                    <h2>{data.totalOrders.toLocaleString()}</h2>
                    <span className="analytics-metric-label">TOTAL ORDERS</span>
                    <span className="analytics-metric-trend">Live calculation</span>
                </div>
                <div className="analytics-metric-card">
                    <h2>${data.avgOrderValue.toFixed(2)}</h2>
                    <span className="analytics-metric-label">AVG. ORDER VALUE</span>
                    <span className="analytics-metric-trend">Live calculation</span>
                </div>
                <div className="analytics-metric-card">
                    <h2>{data.returnRate.toFixed(1)}%</h2>
                    <span className="analytics-metric-label">RETURN RATE</span>
                    <span className="analytics-metric-trend">{data.totalReturns} returns total</span>
                </div>
            </div>

            <div className="analytics-trend-card" style={{ position: 'relative' }}>
                <h3>Revenue & Orders Trend</h3>
                
                <div 
                    className="analytics-trend-chart-area" 
                    style={{ display: 'flex', gap: '20px', height: '220px', marginTop: '30px' }}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                >
                    <div className="admin-y-axis" style={{ position: 'relative', width: '50px', fontSize: '11px', color: '#888' }}>
                        <span style={{ position: 'absolute', top: '0%', transform: 'translateY(-50%)' }}>${(maxRevenue).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span style={{ position: 'absolute', top: '25%', transform: 'translateY(-50%)' }}>${(maxRevenue * 0.75).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>${(maxRevenue * 0.5).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span style={{ position: 'absolute', top: '75%', transform: 'translateY(-50%)' }}>${(maxRevenue * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span style={{ position: 'absolute', top: '100%', transform: 'translateY(-50%)' }}>$0</span>
                    </div>
                    
                    <div className="analytics-visual-wrapper" style={{ position: 'relative', flex: 1 }}>
                        <div className="admin-grid-lines" style={{ position: 'absolute', inset: 0 }}>
                            <div style={{ position: 'absolute', top: '0%', width: '100%', borderBottom: '1px dashed #eaeaea' }}></div>
                            <div style={{ position: 'absolute', top: '25%', width: '100%', borderBottom: '1px dashed #eaeaea' }}></div>
                            <div style={{ position: 'absolute', top: '50%', width: '100%', borderBottom: '1px dashed #eaeaea' }}></div>
                            <div style={{ position: 'absolute', top: '75%', width: '100%', borderBottom: '1px dashed #eaeaea' }}></div>
                            <div style={{ position: 'absolute', top: '100%', width: '100%', borderBottom: '1px dashed #eaeaea' }}></div>
                        </div>
                        
                        <svg className="analytics-line-svg" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 1 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#c9a76d" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#c9a76d" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            <path d={areaPath} fill="url(#revenueGradient)" />
                            
                            {hoveredPointIndex !== null && (
                                <line 
                                    x1={linePoints[hoveredPointIndex].x} y1="0" 
                                    x2={linePoints[hoveredPointIndex].x} y2="200" 
                                    stroke="#e5e5e5" strokeWidth="2" strokeDasharray="4 4" 
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            <path d={svgPath} fill="none" stroke="#c9a76d" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                            
                            {linePoints.map((p: any, i: number) => {
                                const colWidth = 600 / (linePoints.length > 1 ? linePoints.length - 1 : 1);
                                return (
                                    <rect 
                                        key={`hover-zone-${i}`}
                                        x={p.x - (colWidth / 2)} y={0} width={colWidth} height={200} fill="transparent" 
                                        style={{ cursor: 'crosshair' }}
                                        onMouseEnter={() => setHoveredPointIndex(i)}
                                    />
                                );
                            })}
                        </svg>

                        {hoveredPointIndex !== null && (
                            <div className="analytics-chart-tooltip" style={{
                                position: 'absolute',
                                left: `${(linePoints[hoveredPointIndex].x / 600) * 100}%`,
                                top: `${(linePoints[hoveredPointIndex].y / 200) * 100}%`,
                                transform: 'translate(-50%, -100%)',
                                marginTop: '-15px',
                                zIndex: 10,
                                background: '#111',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}>
                                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                    {linePoints[hoveredPointIndex].month}
                                </strong>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                                    <span style={{ color: '#aaa' }}>Revenue:</span> 
                                    <span>${linePoints[hoveredPointIndex].revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '2px' }}>
                                    <span style={{ color: '#aaa' }}>Orders:</span> 
                                    <span>{linePoints[hoveredPointIndex].orders}</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', borderTop: '5px solid #111', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' }} />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="admin-x-axis analytics-x-axis" style={{ position: 'relative', height: '20px', marginLeft: '70px', marginTop: '10px', fontSize: '11px', color: '#888' }}>
                    {chartData.map((d: any, i: number) => (
                        <span key={d.month} style={{ position: 'absolute', left: `${(i / (chartData.length > 1 ? chartData.length - 1 : 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                            {d.month}
                        </span>
                    ))}
                </div>
            </div>

            <div className="analytics-split-grid">
                <div className="analytics-card">
                    <h3>Sales by Category</h3>
                    {data.categoryData.length === 0 ? (
                        <p style={{color: '#888', marginTop: '40px', textAlign: 'center'}}>No category data available.</p>
                    ) : (
                        <div className="donut-chart-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '20px' }}>
                            
                            <div className="donut-container-relative" style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                                <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', overflow: 'visible' }}>
                                    {data.categoryData.map((cat: any, i: number) => {
                                        const dash = cat.percentage;
                                        const gap = 100 - dash;
                                        const offset = -cumulativePercent;
                                        cumulativePercent += cat.percentage;
                                        
                                        return (
                                            <circle
                                                key={i}
                                                cx="21" cy="21" r="15.91549431"
                                                fill="transparent"
                                                stroke={colors[i % colors.length]}
                                                strokeWidth={donutHovered?.cat.name === cat.name ? "10" : "8"}
                                                strokeDasharray={`${dash} ${gap}`}
                                                strokeDashoffset={offset}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseMove={(e) => {
                                                    const parent = e.currentTarget.closest('.donut-container-relative');
                                                    if (parent) {
                                                        const rect = parent.getBoundingClientRect();
                                                        setDonutHovered({
                                                            cat: cat,
                                                            x: e.clientX - rect.left,
                                                            y: e.clientY - rect.top
                                                        });
                                                    }
                                                }}
                                                onMouseLeave={() => setDonutHovered(null)}
                                            />
                                        );
                                    })}
                                </svg>
                                
                                {donutHovered && (
                                    <div style={{
                                        position: 'absolute',
                                        left: `${donutHovered.x}px`,
                                        top: `${donutHovered.y - 15}px`,
                                        transform: 'translate(-50%, -100%)',
                                        background: '#111',
                                        color: '#fff',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap',
                                        zIndex: 20,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        <strong>{donutHovered.cat.name}</strong>: {donutHovered.cat.percentage.toFixed(1)}%
                                        <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', borderTop: '4px solid #111', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }} />
                                    </div>
                                )}
                            </div>

                            <div className="donut-legend" style={{ width: '100%' }}>
                                {data.categoryData.map((cat: any, idx: number) => (
                                    <div key={idx} className="donut-legend-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: donutHovered && donutHovered.cat.name !== cat.name ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="legend-dot" style={{ backgroundColor: colors[idx % colors.length], display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px' }}></span>
                                            {cat.name}
                                        </div>
                                        <strong>{cat.percentage.toFixed(1)}%</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="analytics-card">
                    <h3>Orders vs Returns</h3>
                    <div className="bar-chart-area" onMouseLeave={() => setBarTooltip({ visible: false, x: 0, y: 0, content: null })}>
                        <div className="admin-y-axis">
                            <span>{maxOrders}</span>
                            <span>{Math.round(maxOrders * 0.75)}</span>
                            <span>{Math.round(maxOrders * 0.5)}</span>
                            <span>{Math.round(maxOrders * 0.25)}</span>
                            <span>0</span>
                        </div>
                        <div className="admin-bar-visual" style={{ position: 'relative' }}>
                            <div className="admin-grid-lines">
                                {[...Array(5)].map((_, i) => <div key={i} className="admin-grid-line"></div>)}
                            </div>
                            <div className="admin-bars-container grouped-bars">
                                {chartData.map((d: any, idx: number) => {
                                    const orderHeight = maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0;
                                    const returnHeight = maxOrders > 0 ? (d.returns / maxOrders) * 100 : 0;
                                    return (
                                        <div 
                                            key={idx} 
                                            className="bar-group" 
                                            style={{ cursor: 'pointer' }}
                                            onMouseMove={(e) => {
                                                const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                                if (parentRect) {
                                                    setBarTooltip({
                                                        visible: true,
                                                        x: e.clientX - parentRect.left,
                                                        y: e.clientY - parentRect.top,
                                                        content: d
                                                    });
                                                }
                                            }}
                                        >
                                            <div className="gold-bar" style={{height: `${orderHeight}%`}}></div>
                                            <div className="black-bar" style={{height: `${returnHeight}%`}}></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {barTooltip.visible && barTooltip.content && (
                                <div className="analytics-chart-tooltip" style={{
                                    position: 'absolute',
                                    left: `${barTooltip.x}px`,
                                    top: `${barTooltip.y - 15}px`,
                                    transform: 'translate(-50%, -100%)',
                                    background: '#111',
                                    color: '#fff',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                    zIndex: 20,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '4px' }}>{barTooltip.content.month}</strong>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <span style={{ color: '#c9a76d' }}>Orders:</span> {barTooltip.content.orders}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '2px' }}>
                                        <span style={{ color: '#aaa' }}>Returns:</span> {barTooltip.content.returns}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', borderTop: '4px solid #111', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }} />
                                </div>
                            )}

                        </div>
                    </div>
                    <div className="admin-x-axis grouped-bar-x-axis">
                        {chartData.map((d: any) => <span key={d.month}>{d.month}</span>)}
                    </div>
                    <div className="analytics-chart-legend centered-legend">
                        <span className="legend-item"><span className="legend-dot gold"></span>Orders</span>
                        <span className="legend-item"><span className="legend-dot black"></span>Returns</span>
                    </div>
                </div>
            </div>

            <div className="analytics-table-card">
                <h3>Revenue by Country</h3>
                <div className="admin-table-wrapper">
                    {data.countryData.length === 0 ? (
                        <p style={{padding: '20px', color: '#888'}}>No order data available yet.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>COUNTRY</th>
                                    <th>ORDERS</th>
                                    <th>REVENUE</th>
                                    <th>SHARE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.countryData.map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        <td><span className="admin-td-primary">{row.country}</span></td>
                                        <td><span className="admin-td-standard">{row.orders}</span></td>
                                        <td><span className="admin-td-standard">${row.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></td>
                                        <td style={{width: '30%'}}>
                                            <div className="share-column" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="share-progress-bg" style={{flex: 1, height: '6px', backgroundColor: '#e5e5e5', borderRadius: '3px'}}>
                                                    <div className="share-progress-fill" style={{ width: `${row.share}%`, height: '100%', backgroundColor: '#111', borderRadius: '3px' }}></div>
                                                </div>
                                                <span className="share-text" style={{fontSize: '12px', minWidth: '35px', textAlign: 'right'}}>{row.share.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsTab;