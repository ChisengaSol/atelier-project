import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { fetchWithCredentials } from '../utils/api';
import '../styles/checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, isLoading: cartLoading } = useCart();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        apt: '',
        city: '',
        state: '',
        zip: ''
    });

    // Automatically pre-fill user details and fetch their default address
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || ''
            }));

            // Fetch addresses to find the default one
            const fetchDefaultAddress = async () => {
                try {
                    const res = await fetchWithCredentials('http://localhost:8000/api/users/me/addresses');
                    const data = await res.json();
                    
                    if (res.ok && data.status === 'success' && data.data.length > 0) {
                        const defaultAddr = data.data.find((addr: any) => addr.isDefault) || data.data[0];
                        setFormData(prev => ({
                            ...prev,
                            street: defaultAddr.street || '',
                            city: defaultAddr.city || '',
                            state: defaultAddr.state || '',
                            zip: defaultAddr.zip || ''
                        }));
                    }
                } catch (error) {
                    console.error("Failed to load default address", error);
                }
            };
            fetchDefaultAddress();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContinueToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/checkout/payment', { state: { shippingData: formData } });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;

    if (cartLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;

    // Prevent checkout with empty bag
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
                <Link to="/bag" className="back-to-bag-link">
                    <ChevronLeft size={14} /> BACK TO BAG
                </Link>

                <div className="checkout-stepper">
                    <div className="step active">
                        <div className="step-number">1</div>
                        <span>SHIPPING</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step">
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
                        <h1>Shipping Information</h1>
                        
                        <form onSubmit={handleContinueToPayment}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>FIRST NAME</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>LAST NAME</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                                </div>

                                <div className="input-group full-width">
                                    <label>EMAIL ADDRESS</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>

                                <div className="input-group">
                                    <label>PHONE NUMBER</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" />
                                </div>
                                
                                {/* Empty div to act as a spacer in the grid to match screenshot layout */}
                                <div></div>

                                <div className="input-group full-width">
                                    <label>STREET ADDRESS</label>
                                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} required />
                                </div>

                                <div className="input-group">
                                    <label>APT / SUITE (OPTIONAL)</label>
                                    <input type="text" name="apt" value={formData.apt} onChange={handleInputChange} />
                                </div>
                                <div className="input-group">
                                    <label>CITY</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                                </div>

                                <div className="input-group">
                                    <label>STATE</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>ZIP CODE</label>
                                    <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <button type="submit" className="continue-btn">
                                CONTINUE TO PAYMENT
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

export default Checkout;