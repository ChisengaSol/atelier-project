import { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, Printer } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';
import AdminOrderModal from './AdminOrderModal';

const FILTERS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const AdminOrdersTab = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/orders');
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setOrders(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter and search logic
    const filteredOrders = orders.filter(order => {
        const matchesFilter = activeFilter === "All" || order.status.toLowerCase() === activeFilter.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            order.id.toLowerCase().includes(searchLower) || 
            order.customer.name.toLowerCase().includes(searchLower) ||
            order.customer.email.toLowerCase().includes(searchLower);
            
        return matchesFilter && matchesSearch;
    });

    const renderStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        let badgeClass = 'admin-badge ';
        
        if (statusLower === 'delivered') badgeClass += 'badge-delivered';
        else if (statusLower === 'shipped') badgeClass += 'badge-shipped';
        else if (statusLower === 'processing') badgeClass += 'badge-processing';
        else if (statusLower === 'pending') badgeClass += 'badge-pending';
        else if (statusLower === 'cancelled') badgeClass += 'badge-cancelled';
        else if (statusLower === 'refunded') badgeClass += 'badge-cancelled'; 

        return <span className={badgeClass}>{status}</span>;
    };

    return (
        <div className="admin-orders-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Orders</h1>
                    <span className="admin-page-subtitle">{filteredOrders.length} total orders</span>
                </div>
                <button className="admin-sync-btn" onClick={fetchOrders}>
                    <RefreshCw size={14} strokeWidth={2} className={isLoading ? "spin" : ""} /> SYNC
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-wrapper">
                    <Search size={16} strokeWidth={1.5} className="admin-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by order ID or customer..." 
                        className="admin-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="admin-filters-group">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            className={`admin-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-table-wrapper">
                {isLoading ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>Loading orders...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ORDER</th>
                                <th>CUSTOMER</th>
                                <th>DATE</th>
                                <th>ITEMS</th>
                                <th>TOTAL</th>
                                <th>PAYMENT</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <div className="admin-td-stacked">
                                            <span className="admin-td-primary">{order.id}</span>
                                            <span className="admin-td-secondary">{order.tracking}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-td-customer">
                                            <div className="admin-customer-avatar">{order.customer.initials}</div>
                                            <div className="admin-td-stacked">
                                                <span className="admin-td-primary">{order.customer.name}</span>
                                                <span className="admin-td-secondary">{order.customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="admin-td-standard">{order.date}</span></td>
                                    <td><span className="admin-td-standard">
                                        {order.items.reduce((sum: number, item: any) => sum + item.qty, 0)}
                                    </span></td>
                                    <td><span className="admin-td-bold">${order.total.toFixed(2)}</span></td>
                                    <td><span className="admin-td-standard">{order.payment}</span></td>
                                    <td>{renderStatusBadge(order.status)}</td>
                                    <td>
                                        <div className="admin-td-actions">
                                            <button 
                                                className="admin-icon-btn" 
                                                onClick={() => setSelectedOrder(order)}
                                                title="View Details"
                                            >
                                                <Eye size={16} strokeWidth={1.5} />
                                            </button>
                                            <button className="admin-icon-btn" title="Print Invoice">
                                                <Printer size={16} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedOrder && (
                <AdminOrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    onStatusUpdate={fetchOrders}
                />
            )}
        </div>
    );
};

export default AdminOrdersTab;