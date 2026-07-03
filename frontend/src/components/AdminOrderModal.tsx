import React, { useState } from 'react';
import { X } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

interface AdminOrderModalProps {
    order: any;
    onClose: () => void;
    onStatusUpdate: () => void; 
}

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const AdminOrderModal = ({ order, onClose, onStatusUpdate }: AdminOrderModalProps) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === order.status) return;
        setIsUpdating(true);
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/admin/orders/${order.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                onStatusUpdate(); 
                order.status = newStatus; 
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
            <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: '8px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <span style={{ fontSize: '12px', color: '#666', letterSpacing: '1px' }}>{order.id}</span>
                        <h2 style={{ fontSize: '24px', fontWeight: '500', margin: '5px 0 0 0' }}>Order Details</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                        <X size={24} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Status Update Section */}
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>UPDATE STATUS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {STATUS_OPTIONS.map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusUpdate(status)}
                                disabled={isUpdating}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    border: `1px solid ${order.status === status ? '#111' : '#e5e5e5'}`,
                                    backgroundColor: order.status === status ? '#111' : '#fff',
                                    color: order.status === status ? '#fff' : '#111',
                                    fontSize: '13px',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
                        <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>CUSTOMER</p>
                        <p style={{ fontWeight: '500', margin: '0 0 5px 0' }}>{order.customer.name}</p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>{order.customer.email}</p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{order.customer.phone}</p>
                    </div>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
                        <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>SHIP TO</p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                            {order.shippingAddress}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '15px' }}>ITEMS</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {order.items.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover' }} />
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>{item.title}</p>
                                        <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{item.size} · {item.color} · Qty {item.qty}</p>
                                    </div>
                                </div>
                                <span style={{ fontWeight: '500' }}>${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                        <span>Shipping</span>
                        <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                        <span>Tax</span>
                        <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '16px', marginTop: '10px' }}>
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <p style={{ fontSize: '13px', color: '#666' }}>Payment: {order.payment}</p>
            </div>
        </div>
    );
};

export default AdminOrderModal;