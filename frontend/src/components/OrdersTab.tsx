import { useState, useEffect } from 'react';
import OrderModal from './OrderModal';
import { fetchWithCredentials } from '../utils/api';

const OrdersTab = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/users/me/orders');
                const data = await res.json();
                
                if (res.ok && data.status === 'success') {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const renderStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        let badgeClass = 'status-badge ';
        
        if (statusLower === 'delivered') badgeClass += 'status-success';
        else if (statusLower === 'shipped') badgeClass += 'status-info';
        else if (statusLower === 'processing' || statusLower === 'pending' || statusLower === 'confirmed') badgeClass += 'status-warning';

        return <span className={badgeClass}>{status}</span>;
    };

    if (isLoading) {
        return <div style={{ padding: '40px 0', color: '#666' }}>Loading your orders...</div>;
    }

    return (
        <>
            <h2 className="content-title">
                My Orders {orders.length > 0 && `(${orders.length})`}
            </h2>
            
            {orders.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#666', backgroundColor: '#f9f9f9' }}>
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-meta">
                                    <span className="order-id">{order.id}</span>
                                    <span className="order-date">{order.date}</span>
                                </div>
                                <div className="order-status-price">
                                    {renderStatusBadge(order.status)}
                                    <span className="order-total-price">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="order-thumbnails">
                                {order.items.map((item: any) => (
                                    <img key={item.id} src={item.image} alt={item.title} className="order-thumbnail-img" />
                                ))}
                            </div>

                            <div className="order-actions">
                                <button className="btn-secondary" onClick={() => setSelectedOrder(order)}>
                                    <EyeIcon /> VIEW ORDER
                                </button>
                                {order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'processing' ? (
                                    <button className="btn-primary-alt">TRACK</button>
                                ) : order.status.toLowerCase() !== 'pending' && order.status.toLowerCase() !== 'confirmed' ? (
                                    <button className="btn-primary">BUY AGAIN</button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    renderStatusBadge={renderStatusBadge}
                />
            )}
        </>
    );
};

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default OrdersTab;