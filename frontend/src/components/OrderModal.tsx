import React from 'react';
import { X, Star } from 'lucide-react';

interface OrderModalProps {
    order: any;
    onClose: () => void;
    renderStatusBadge: (status: string) => React.ReactNode;
}

const OrderModal = ({ order, onClose, renderStatusBadge }: OrderModalProps) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <span className="modal-subtitle">{order.id}</span>
                        <h2 className="modal-title">Order Details</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-order-meta">
                        <span>{order.date}</span>
                        {renderStatusBadge(order.status)}
                    </div>

                    <div className="modal-items-list">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="modal-item-row">
                                <img src={item.image} alt={item.title} className="modal-item-img" />
                                <div className="modal-item-info">
                                    <div className="modal-item-header">
                                        <h4 className="modal-item-title">{item.title}</h4>
                                        <span className="modal-item-price">${item.price.toFixed(2)}</span>
                                    </div>
                                    <span className="modal-item-variants">{item.size} · {item.color} · Qty {item.qty}</span>
                                    
                                    {item.rating && (
                                        <div className="modal-item-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < item.rating ? "#c9a76d" : "none"} stroke={i < item.rating ? "#c9a76d" : "#cccccc"} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-summary">
                        <div className="modal-summary-row">
                            <span>Subtotal</span>
                            <span>${(order.subtotal || order.total).toFixed(2)}</span>
                        </div>
                        <div className="modal-summary-row">
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? 'Free' : `$${order.shipping?.toFixed(2)}`}</span>
                        </div>
                        <div className="modal-summary-row">
                            <span>Tax</span>
                            <span>${(order.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="modal-summary-row modal-summary-total">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="modal-footer-info">
                        <p>Shipped to: {order.shippingAddress || "Address on file"}</p>
                        <p>Paid via: {order.paymentMethod || "Card on file"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;