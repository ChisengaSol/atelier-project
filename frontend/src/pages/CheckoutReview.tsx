import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ChevronLeft, Check, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../hooks/useCart';
import { fetchWithCredentials } from '../utils/api';
import '../styles/checkout.css';

const CheckoutReview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, isLoading: cartLoading } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const shippingDetails = location.state?.shippingData;
    const paymentDetails = location.state?.paymentData;

    //If they refresh the page or skip steps, redirect to start
    if (!shippingDetails || !paymentDetails) {
        return <Navigate to="/checkout" />;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;

    // Format card number to show only last 4 digits
    const rawCard = paymentDetails.cardNumber.replace(/\s+/g, '');
    const last4 = rawCard.slice(-4) || '0000';

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subtotal: subtotal.toFixed(2),
                    tax: tax.toFixed(2),
                    total: total.toFixed(2)
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                // Trigger a refresh of the cart count for the Navbar
                window.dispatchEvent(new Event('cartUpdated'));
                
                // Navigate to success page with the actual order number from DB
                navigate('/checkout/success', { 
                    state: { orderNumber: data.orderNumber } 
                });
            } else {
                alert(data.detail || "Failed to place order.");
            }
        } catch (error) {
            console.error("Order processing error:", error);
            alert("A network error occurred.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

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
                <Link to="/checkout/payment" className="back-to-bag-link">
                    <ChevronLeft size={14} /> BACK
                </Link>

                <div className="checkout-stepper">
                    <div className="step completed">
                        <div className="step-number"><Check size={14} strokeWidth={3} /></div>
                        <span>SHIPPING</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step completed">
                        <div className="step-number"><Check size={14} strokeWidth={3} /></div>
                        <span>PAYMENT</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step active">
                        <div className="step-number">3</div>
                        <span>REVIEW</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    <div className="checkout-form-section">
                        <h1>Review Your Order</h1>
                        
                        <div className="review-block">
                            <div className="review-block-header">
                                <span className="review-block-title">SHIPPING TO</span>
                                <Link to="/checkout" className="review-block-edit">EDIT</Link>
                            </div>
                            <div className="review-block-content">
                                <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
                                <p>{shippingDetails.street} {shippingDetails.apt && `, ${shippingDetails.apt}`}</p>
                                <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zip}</p>
                            </div>
                        </div>

                        <div className="review-block">
                            <div className="review-block-header">
                                <span className="review-block-title">PAYMENT</span>
                                <Link to="/checkout/payment" className="review-block-edit">EDIT</Link>
                            </div>
                            <div className="review-block-content">
                                <p>•••• •••• •••• {last4}</p>
                            </div>
                        </div>

                        <div className="review-items-list">
                            {cartItems.map(item => (
                                <div key={item.id} className="review-item-row">
                                    <div className="review-item-left">
                                        <img src={item.image} alt={item.title} className="review-item-image" />
                                        <div className="review-item-details">
                                            <span className="review-item-title">{item.title}</span>
                                            <span className="review-item-meta">{item.size} · {item.color} · Qty {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="review-item-price">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="place-order-btn" 
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                        >
                            <Lock size={16} strokeWidth={2} />
                            {isPlacingOrder ? 'PROCESSING...' : `PLACE ORDER — $${total.toFixed(2)}`}
                        </button>
                        <p className="terms-text">
                            By placing your order you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>

                    <div className="checkout-summary">
                        <h2>ORDER SUMMARY</h2>
                        
                        <div className="summary-items-list">
                            {cartItems.map(item => (
                                <div key={`summary-${item.id}`} className="summary-item">
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

export default CheckoutReview;