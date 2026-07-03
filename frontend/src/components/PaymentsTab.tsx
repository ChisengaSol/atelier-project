import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

// Define the shape of payment data
interface PaymentMethod {
    id: string;
    type: string;
    last4: string;
    expires: string;
    isDefault: boolean;
    icon: string;
}

const PaymentsTab = () => {
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // Fetch payments from the database
    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/payments');
            const data = await res.json();
            
            if (res.ok && data.status === 'success') {
                setPayments(data.data);
            }
        } catch (error) {
            console.error("Failed to load payment methods:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load payments when the component mounts
    useEffect(() => {
        fetchPayments();
    }, []);

    const handleRemoveCard = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this payment method?")) return;
        
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/users/me/payments/${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                fetchPayments();
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to remove payment method");
            }
        } catch (error) {
            console.error("Error removing card:", error);
            alert("Network error occurred");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/users/me/payments/${id}/default`, {
                method: 'PATCH'
            });
            
            if (res.ok) {
                // Refresh the list directly from the database
                fetchPayments();
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to set default payment method");
            }
        } catch (error) {
            console.error("Error setting default card:", error);
            alert("Network error occurred");
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation and formatting
        const cleanNumber = cardNumber.replace(/\D/g, '');
        if (cleanNumber.length < 15) return alert("Please enter a valid card number.");
        
        const last4 = cleanNumber.slice(-4);
        
        let type = "Card";
        if (cleanNumber.startsWith('4')) { type = "Visa"; }
        else if (cleanNumber.startsWith('5')) { type = "Mastercard"; }
        else if (cleanNumber.startsWith('3')) { type = "Amex"; }

        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    last4: last4,
                    expires: expiry
                })
            });
            
            if (res.ok) {
                // Reset form and close modal
                setCardNumber('');
                setExpiry('');
                setCvv('');
                setIsModalOpen(false);
                
                // Refresh the list from the database
                fetchPayments();
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to add payment method");
            }
        } catch (error) {
            console.error("Error adding card:", error);
            alert("Network error occurred");
        }
    };

    if (isLoading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading payment methods...</div>;
    }

    return (
        <>
            <div className="content-header-row">
                <h2 className="content-title">Payment Methods</h2>
                <button className="add-action-btn" onClick={() => setIsModalOpen(true)}>
                    + ADD CARD
                </button>
            </div>
            
            <div className="payment-methods-list">
                {payments.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                        <p>No payment methods saved.</p>
                    </div>
                ) : (
                    payments.map(payment => (
                        <div key={payment.id} className={`payment-card-row ${payment.isDefault ? 'default-card' : ''}`}>
                            <div className="payment-card-info">
                                <div className="payment-card-icon" style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '40px', height: '28px', backgroundColor: '#f4f5f7', 
                                    borderRadius: '4px', fontWeight: '600', fontSize: '12px'
                                }}>
                                    {payment.icon}
                                </div>
                                <div className="payment-card-details">
                                    <span className="payment-card-name">{payment.type} •••• {payment.last4}</span>
                                    <span className="payment-card-expiry">Expires {payment.expires}</span>
                                </div>
                            </div>
                            <div className="payment-card-actions">
                                {payment.isDefault ? (
                                    <span className="default-badge">Default</span>
                                ) : (
                                    <button 
                                        className="set-default-btn" 
                                        onClick={() => handleSetDefault(payment.id)}
                                        style={{ background: 'none', border: 'none', fontSize: '11px', color: '#666', cursor: 'pointer', textDecoration: 'underline', marginRight: '15px' }}
                                    >
                                        SET DEFAULT
                                    </button>
                                )}
                                <button className="remove-card-btn" onClick={() => handleRemoveCard(payment.id)}>
                                    REMOVE
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Card Modal */}
            {isModalOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                }}>
                    <div style={{ 
                        backgroundColor: '#fff', padding: '30px', width: '400px', 
                        borderRadius: '8px', position: 'relative' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '500' }}>Add Payment Method</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>CARD NUMBER</label>
                                <input 
                                    type="text" 
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="0000 0000 0000 0000" 
                                    maxLength={19}
                                    required 
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>EXPIRY (MM/YY)</label>
                                    <input 
                                        type="text" 
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        placeholder="MM/YY" 
                                        maxLength={5}
                                        required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>CVV</label>
                                    <input 
                                        type="password" 
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="123" 
                                        maxLength={4}
                                        required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                            </div>
                            
                            <p style={{ fontSize: '11px', color: '#888', marginTop: '10px' }}>
                                For your security, we do not store full credit card information on our servers.
                            </p>
                            
                            <button type="submit" className="save-changes-btn" style={{ width: '100%', marginTop: '10px' }}>
                                SAVE CARD
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentsTab;