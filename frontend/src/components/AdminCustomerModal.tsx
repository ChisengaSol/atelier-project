import { X, Mail, Phone, MapPin, Activity } from 'lucide-react';

interface AdminCustomerModalProps {
    customer: any;
    onClose: () => void;
}

const AdminCustomerModal = ({ customer, onClose }: AdminCustomerModalProps) => {
    // Calculate Average Order
    const avgOrder = customer.orders > 0 ? (customer.spent / customer.orders).toFixed(0) : "0";

    return (
        <div className="slide-modal-overlay" onClick={onClose}>
            <div className="slide-modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="customer-modal-header">
                    <h2 className="customer-modal-title">Customer Profile</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111' }}>
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="customer-modal-profile">
                    <div className="customer-modal-avatar">{customer.initials}</div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '500' }}>{customer.name}</h3>
                    <span style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>{customer.displayId}</span>
                    
                    <div className="admin-tags-wrapper" style={{ justifyContent: 'center', marginBottom: '30px' }}>
                        {customer.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="admin-customer-tag">{tag}</span>
                        ))}
                        <span className="admin-badge badge-delivered">{customer.status}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', color: '#666', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Mail size={16} /> <span>{customer.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Phone size={16} /> <span>{customer.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <MapPin size={16} style={{ marginTop: '2px' }} /> <span>{customer.fullAddress}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px' }}>{customer.orders}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Total Orders</div>
                    </div>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px' }}>${customer.spent.toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Total Spent</div>
                    </div>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px' }}>${avgOrder}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Avg. Order</div>
                    </div>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '5px' }}>{customer.memberSince}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Member Since</div>
                    </div>
                </div>

                <button style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#fff', border: 'none', fontWeight: '600', letterSpacing: '1px', fontSize: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <Mail size={16} /> SEND EMAIL
                </button>
                <button style={{ width: '100%', padding: '15px', backgroundColor: '#fff', color: '#111', border: '1px solid #ddd', fontWeight: '600', letterSpacing: '1px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <Activity size={16} /> VIEW ORDER HISTORY
                </button>
                
            </div>
        </div>
    );
}

export default AdminCustomerModal;