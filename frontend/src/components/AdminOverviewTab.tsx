import { useState, useEffect } from 'react';
import { ArrowUpRight, Package, Users, Box } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

interface AdminOverviewTabProps {
    setActiveTab: (tab: string) => void;
}

const AdminOverviewTab = ({ setActiveTab }: AdminOverviewTabProps) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Tooltip States
    const [lineTooltip, setLineTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });
    const [barTooltip, setBarTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/admin/overview');
                const json = await res.json();
                if (res.ok && json.status === 'success') {
                    setData(json.data);
                }
            } catch (error) {
                console.error("Failed to load overview data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOverviewData();
    }, []);

    const renderStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        let badgeClass = 'admin-status-badge ';
        
        if (statusLower === 'delivered') badgeClass += 'admin-status-success';
        else if (statusLower === 'shipped') badgeClass += 'admin-status-info';
        else if (statusLower === 'processing') badgeClass += 'admin-status-primary';
        else if (statusLower === 'pending') badgeClass += 'admin-status-warning';

        return <span className={badgeClass}>{status}</span>;
    };

    if (isLoading || !data) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#666' }}>Loading overview metrics...</div>;
    }

    // Chart Calculations
    const chartData = data.chartData;
    const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 100); 
    const maxOrders = Math.max(...chartData.map((d: any) => d.orders), 10);
    
    // Line Chart SVG Generation
    const linePoints = chartData.map((d: any, i: number) => {
        const x = i * (600 / (chartData.length > 1 ? chartData.length - 1 : 1));
        const y = 180 - (d.revenue / maxRevenue) * 140; 
        return { x, y, month: d.month, revenue: d.revenue };
    });
    
    const svgPath = `M ${linePoints.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`;

    // Generate Dynamic Date Range text
    const dateRangeText = chartData.length > 0 
        ? `${chartData[0].month} – ${chartData[chartData.length - 1].month} ${new Date().getFullYear()}` 
        : "";

    return (
        <div className="admin-overview-container">
            <div className="admin-greeting-section">
                <h1>Dashboard Overview</h1>
                <p>Here's what's happening with your store today.</p>
            </div>

            <div className="admin-metrics-grid">
                <div className="admin-metric-card dark-metric-card">
                    <div className="admin-metric-header">
                        <div className="admin-metric-icon-wrap dark-icon-wrap">$</div>
                        <span className="admin-metric-trend trend-up">Active</span>
                    </div>
                    <div className="admin-metric-body">
                        <h2>${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        <span>TOTAL REVENUE</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-header">
                        <div className="admin-metric-icon-wrap"><Package size={16} strokeWidth={2} /></div>
                        <span className="admin-metric-trend trend-up">Active</span>
                    </div>
                    <div className="admin-metric-body">
                        <h2>{data.totalOrders.toLocaleString()}</h2>
                        <span>TOTAL ORDERS</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-header">
                        <div className="admin-metric-icon-wrap"><Users size={16} strokeWidth={2} /></div>
                        <span className="admin-metric-trend trend-up">Active</span>
                    </div>
                    <div className="admin-metric-body">
                        <h2>{data.activeCustomers.toLocaleString()}</h2>
                        <span>ACTIVE CUSTOMERS</span>
                    </div>
                </div>

                <div className="admin-metric-card">
                    <div className="admin-metric-header">
                        <div className="admin-metric-icon-wrap"><Box size={16} strokeWidth={2} /></div>
                        <span className="admin-metric-trend trend-down">Notice</span>
                    </div>
                    <div className="admin-metric-body">
                        <h2>{data.lowStockItems}</h2>
                        <span>LOW STOCK ITEMS</span>
                    </div>
                </div>
            </div>

            <div className="admin-charts-grid">
                {/* REVENUE LINE CHART */}
                <div className="admin-chart-card line-chart-card" style={{ position: 'relative' }}>
                    <div className="admin-chart-header">
                        <h3>Revenue Overview</h3>
                        <span className="admin-chart-date-range">{dateRangeText}</span>
                    </div>
                    <div className="admin-chart-area" onMouseLeave={() => setLineTooltip(prev => ({ ...prev, visible: false }))}>
                        <div className="admin-y-axis">
                            <span>${(maxRevenue).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span>${(maxRevenue * 0.75).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span>${(maxRevenue * 0.5).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span>${(maxRevenue * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span>$0</span>
                        </div>
                        <div className="admin-chart-visual" style={{ position: 'relative' }}>
                            <div className="admin-grid-lines">
                                {[...Array(5)].map((_, i) => <div key={i} className="admin-grid-line"></div>)}
                            </div>
                            
                            <svg className="admin-line-svg" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                {/* The Data Line */}
                                <path 
                                    d={svgPath} 
                                    fill="none" 
                                    stroke="#c9a76d" 
                                    strokeWidth="3" 
                                    vectorEffect="non-scaling-stroke"
                                />
                                
                                {/* Invisible Hover Columns */}
                                {linePoints.map((p: any, i: number) => {
                                    const colWidth = 600 / (linePoints.length > 1 ? linePoints.length - 1 : 1);
                                    return (
                                        <rect 
                                            key={`hover-${i}`}
                                            x={p.x - (colWidth / 2)}
                                            y={0}
                                            width={colWidth}
                                            height={200}
                                            fill="transparent"
                                            style={{ cursor: 'pointer' }}
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                                if (rect) {
                                                    setLineTooltip({
                                                        visible: true,
                                                        x: (p.x / 600) * rect.width, // scale x coordinate relative to actual DOM width
                                                        y: (p.y / 200) * rect.height,
                                                        content: `${p.month}: $${p.revenue.toLocaleString()}`
                                                    });
                                                }
                                            }}
                                        />
                                    );
                                })}
                                
                                {/* Data Dots */}
                                {linePoints.map((p: any, i: number) => (
                                    <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill="#c9a76d" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                ))}
                            </svg>

                            {/* Revenue Tooltip */}
                            {lineTooltip.visible && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${lineTooltip.x}px`,
                                    top: `${lineTooltip.y - 15}px`,
                                    transform: 'translate(-50%, -100%)',
                                    backgroundColor: '#111',
                                    color: '#fff',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                    zIndex: 10
                                }}>
                                    {lineTooltip.content}
                                    <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', borderTop: '4px solid #111', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="admin-x-axis">
                        {chartData.map((d: any) => <span key={d.month}>{d.month}</span>)}
                    </div>
                </div>

                {/* ORDERS BAR CHART */}
                <div className="admin-chart-card bar-chart-card" style={{ position: 'relative' }}>
                    <div className="admin-chart-header">
                        <h3>Orders by Month</h3>
                    </div>
                    <div className="admin-chart-area" onMouseLeave={() => setBarTooltip(prev => ({ ...prev, visible: false }))}>
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
                            <div className="admin-bars-container">
                                {chartData.map((d: any, i: number) => {
                                    const heightPct = maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0;
                                    return (
                                        <div 
                                            key={i} 
                                            className="admin-bar" 
                                            style={{ height: `${heightPct}%`, position: 'relative' }}
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                                if (containerRect) {
                                                    setBarTooltip({
                                                        visible: true,
                                                        x: (rect.left - containerRect.left) + (rect.width / 2),
                                                        y: containerRect.height - (containerRect.height * (heightPct / 100)),
                                                        content: `${d.month}: ${d.orders} Orders`
                                                    });
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Orders Tooltip */}
                            {barTooltip.visible && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${barTooltip.x}px`,
                                    top: `${barTooltip.y - 10}px`,
                                    transform: 'translate(-50%, -100%)',
                                    backgroundColor: '#111',
                                    color: '#fff',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                    zIndex: 10
                                }}>
                                    {barTooltip.content}
                                    <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', borderTop: '4px solid #111', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }} />
                                </div>
                            )}

                        </div>
                    </div>
                    <div className="admin-x-axis bar-x-axis">
                        {chartData.map((d: any) => <span key={d.month}>{d.month}</span>)}
                    </div>
                </div>
            </div>

            <div className="admin-lists-grid">
                <div className="admin-list-card">
                    <div className="admin-list-header">
                        <h3>Recent Orders</h3>
                        {/* Tab Navigation Hook applied here */}
                        <button className="admin-view-all-btn" onClick={() => setActiveTab('orders')}>
                            VIEW ALL <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="admin-list-content">
                        {data.recentOrders.length === 0 && <p style={{color: '#666', fontSize: '13px'}}>No recent orders.</p>}
                        {data.recentOrders.map((order: any, idx: number) => (
                            <div key={idx} className="admin-list-row">
                                <div className="admin-list-left">
                                    <div className="admin-list-avatar">{order.initials}</div>
                                    <div className="admin-list-text">
                                        <h4>{order.name}</h4>
                                        <span>{order.id}</span>
                                    </div>
                                </div>
                                <div className="admin-list-right">
                                    {renderStatusBadge(order.status)}
                                    <span className="admin-list-value">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-list-card">
                    <div className="admin-list-header">
                        <h3>Top Products</h3>
                        {/* Tab Navigation Hook applied here */}
                        <button className="admin-view-all-btn" onClick={() => setActiveTab('products')}>
                            VIEW ALL <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="admin-list-content">
                        {data.topProducts.length === 0 && <p style={{color: '#666', fontSize: '13px'}}>No products sold yet.</p>}
                        {data.topProducts.map((product: any, idx: number) => (
                            <div key={product.id} className="admin-list-row">
                                <div className="admin-list-left">
                                    <span className="admin-list-index">{idx + 1}</span>
                                    <img src={product.image} alt={product.title} className="admin-list-thumbnail" />
                                    <div className="admin-list-text">
                                        <h4>{product.title}</h4>
                                        <span>{product.sales} sales</span>
                                    </div>
                                </div>
                                <div className="admin-list-right">
                                    <span className="admin-list-value">${product.revenue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewTab;