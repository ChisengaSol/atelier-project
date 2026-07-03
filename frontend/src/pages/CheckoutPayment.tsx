import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ChevronLeft, Lock, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { fetchWithCredentials } from '../utils/api';
import '../styles/checkout.css';

const CheckoutPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, isLoading: cartLoading } = useCart();
    const { user } = useAuth();

    // Catch the shipping data passed from Step 1
    const shippingData = location.state?.shippingData;

    const [formData, setFormData] = useState({
        cardNumber: '',
        nameOnCard: '',
        expiry: '',
        cvv: '',
        saveCard: false
    });

    // Auto-fill payment details if they exist in the database
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nameOnCard: `${user.first_name} ${user.last_name}`
            }));

            const fetchDefaultPayment = async () => {
                try {
                    const res = await fetchWithCredentials('http://localhost:8000/api/users/me/payments');
                    const data = await res.json();
                    
                    if (res.ok && data.status === 'success' && data.data.length > 0) {
                        const defaultCard = data.data.find((card: any) => card.isDefault) || data.data[0];
                        setFormData(prev => ({
                            ...prev,
                            // Pad the card number for UI purposes since we only store last4
                            cardNumber: `**** **** **** ${defaultCard.last4}`,
                            expiry: defaultCard.expires,
                            saveCard: true
                        }));
                    }
                } catch (error) {
                    console.error("Failed to load default payment", error);
                }
            };
            fetchDefaultPayment();
        }
    }, [user]);

    // If they refresh the page or skip Step 1, send them back to the start
    if (!shippingData) {
        return <Navigate to="/checkout" />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleReviewOrder = (e: React.FormEvent) => {
        e.preventDefault();
        // Pass both the shipping data and the new payment data
        navigate('/checkout/review', { 
            state: { 
                shippingData: shippingData, 
                paymentData: formData 
            } 
        });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;

    if (cartLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>Your bag is empty</h2>
                    <button onClick={() => navigate('/all-collections')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        RETURN TO SHOP
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Navbar />

            <main className="checkout-main-container">
                <Link to="/checkout" className="back-to-bag-link">
                    <ChevronLeft size={14} /> BACK
                </Link>

                <div className="checkout-stepper">
                    <div className="step completed">
                        <div className="step-number"><Check size={14} strokeWidth={3} /></div>
                        <span>SHIPPING</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step active">
                        <div className="step-number">2</div>
                        <span>PAYMENT</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <span>REVIEW</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    <div className="checkout-form-section">
                        <h1>Payment Details</h1>
                        <div className="secure-text">
                            <Lock size={14} strokeWidth={1.5} />
                            <span>Your payment info is encrypted and secure</span>
                        </div>
                        
                        <form onSubmit={handleReviewOrder}>
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label>CARD NUMBER</label>
                                    <input 
                                        type="text" 
                                        name="cardNumber" 
                                        value={formData.cardNumber} 
                                        onChange={handleInputChange} 
                                        placeholder="0000 0000 0000 0000"
                                        required 
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label>NAME ON CARD</label>
                                    <input 
                                        type="text" 
                                        name="nameOnCard" 
                                        value={formData.nameOnCard} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>

                                <div className="input-group">
                                    <label>EXPIRY DATE</label>
                                    <input 
                                        type="text" 
                                        name="expiry" 
                                        value={formData.expiry} 
                                        onChange={handleInputChange} 
                                        placeholder="MM / YY"
                                        required 
                                    />
                                </div>

                                <div className="input-group">
                                    <label>CVV</label>
                                    <input 
                                        type="password" 
                                        name="cvv" 
                                        value={formData.cvv} 
                                        onChange={handleInputChange} 
                                        placeholder="•••"
                                        required 
                                    />
                                </div>

                                <div className="full-width save-card-container">
                                    <input 
                                        type="checkbox" 
                                        id="saveCard"
                                        name="saveCard"
                                        checked={formData.saveCard}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="saveCard">Save this card for future purchases</label>
                                </div>
                            </div>

                            <button type="submit" className="continue-btn">
                                REVIEW ORDER
                            </button>
                        </form>
                    </div>

                    <div className="checkout-summary">
                        <h2>ORDER SUMMARY</h2>
                        
                        <div className="summary-items-list">
                            {cartItems.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div style={{ display: 'flex' }}>
                                        <div className="summary-item-image-wrapper">
                                            <img src={item.image} alt={item.title} className="summary-item-image" />
                                            <div className="item-quantity-badge">{item.quantity}</div>
                                        </div>
                                        <div className="summary-item-details">
                                            <span className="summary-item-title">{item.title}</span>
                                            <span className="summary-item-variant">{item.size} · {item.color}</span>
                                        </div>
                                    </div>
                                    <span className="summary-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals-section">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>TOTAL</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPayment;