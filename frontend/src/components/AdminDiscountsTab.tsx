import { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

const AdminDiscountsTab = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ active: 0, uses: 0, impact: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountValue: '',
        minOrder: '0',
        limit: '',
        expiry: '',
        type: 'Fixed Amount ($)'
    });

    const fetchCoupons = async () => {
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/discounts');
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                setCoupons(json.data.coupons);
                setMetrics(json.data.metrics);
            }
        } catch (error) {
            console.error("Failed to load coupons:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const toggleCouponStatus = async (id: number, currentStatus: string) => {
        if (currentStatus === 'Expired') return; 
        const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
        
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/admin/discounts/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) fetchCoupons();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const deleteCoupon = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/admin/discounts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchCoupons();
        } catch (error) {
            console.error("Failed to delete coupon:", error);
        }
    };

    const handleCreateCoupon = async () => {
        if (!formData.code || !formData.discountValue || !formData.limit || !formData.expiry) {
            alert("Please fill out all required fields.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const payload = {
                code: formData.code.toUpperCase().replace(/\s+/g, ''), // Ensure no spaces
                discount_type: formData.type,
                discount_value: parseFloat(formData.discountValue),
                min_order_value: parseFloat(formData.minOrder || "0"),
                usage_limit: parseInt(formData.limit),
                expires_at: formData.expiry
            };
            
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/discounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setShowModal(false);
                setFormData({ code: '', discountValue: '', minOrder: '0', limit: '', expiry: '', type: 'Fixed Amount ($)' });
                fetchCoupons();
            } else {
                alert("Failed to create coupon. The code may already exist.");
            }
        } catch (error) {
            console.error("Failed to create coupon:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#666' }}>Loading discounts...</div>;
    }

    return (
        <div className="admin-discounts-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Discounts & Coupons</h1>
                    <span className="admin-page-subtitle">{metrics.active} active codes · {metrics.uses} total uses</span>
                </div>
                <button className="admin-action-btn dark-btn" onClick={() => setShowModal(true)}>
                    + CREATE COUPON
                </button>
            </div>

            <div className="admin-metrics-grid">
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">{metrics.active}</span>
                    <span className="admin-simple-metric-label">ACTIVE CODES</span>
                </div>
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">{metrics.uses}</span>
                    <span className="admin-simple-metric-label">TOTAL REDEMPTIONS</span>
                </div>
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">${metrics.impact.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    <span className="admin-simple-metric-label">DISCOUNT IMPACT</span>
                </div>
            </div>

            <div className="admin-coupons-grid">
                {coupons.length === 0 ? (
                    <p style={{ color: '#888', padding: '20px 0' }}>No coupons created yet.</p>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon.id} className={`admin-coupon-card ${coupon.status.toLowerCase()}`}>
                            <div className="coupon-header">
                                <h3>{coupon.code}</h3>
                                <span className={`coupon-status ${coupon.status.toLowerCase()}`}>{coupon.status}</span>
                            </div>
                            <p className="coupon-desc">{coupon.desc}</p>
                            
                            <div className="coupon-progress">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min((coupon.used / coupon.limit) * 100, 100)}%` }}></div>
                                </div>
                                <div className="coupon-stats">
                                    <span>{coupon.used} used</span>
                                    <span>{coupon.limit} limit</span>
                                </div>
                            </div>
                            
                            <span className="coupon-expiry">Expires {coupon.expires}</span>
                            
                            <div className="coupon-actions">
                                <button 
                                    className={`status-toggle ${coupon.status.toLowerCase()}`}
                                    onClick={() => toggleCouponStatus(coupon.id, coupon.status)}
                                    disabled={coupon.status === 'Expired'}
                                    style={{ cursor: coupon.status === 'Expired' ? 'not-allowed' : 'pointer' }}
                                >
                                    {coupon.status === 'Active' ? 'DISABLE' : coupon.status === 'Disabled' ? 'ENABLE' : 'EXPIRED'}
                                </button>
                                <div className="icon-group">
                                    <button className="admin-icon-btn"><Edit2 size={16} /></button>
                                    <button className="admin-icon-btn" onClick={() => deleteCoupon(coupon.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Create Coupon</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="admin-modal-body">
                            
                            <div className="admin-input-group">
                                <label>COUPON CODE</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SUMMER20"
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>TYPE</label>
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option>Fixed Amount ($)</option>
                                    <option>Percentage (%)</option>
                                </select>
                            </div>
                            
                            <div className="admin-input-group">
                                <label>DISCOUNT VALUE</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    placeholder={formData.type === 'Fixed Amount ($)' ? "e.g. 15.00" : "e.g. 20"}
                                    value={formData.discountValue}
                                    onChange={e => setFormData({...formData, discountValue: e.target.value})}
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>MINIMUM ORDER ($)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    placeholder="Leave 0 for no minimum"
                                    value={formData.minOrder}
                                    onChange={e => setFormData({...formData, minOrder: e.target.value})}
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>USAGE LIMIT</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    placeholder="e.g. 500"
                                    value={formData.limit}
                                    onChange={e => setFormData({...formData, limit: e.target.value})}
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>EXPIRY DATE</label>
                                <input 
                                    type="date" 
                                    value={formData.expiry}
                                    onChange={e => setFormData({...formData, expiry: e.target.value})}
                                />
                            </div>

                            <button 
                                className="admin-modal-submit" 
                                onClick={handleCreateCoupon} 
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <Check size={16} strokeWidth={3} /> {isSubmitting ? 'CREATING...' : 'CREATE COUPON'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDiscountsTab;