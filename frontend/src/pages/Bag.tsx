import { useState } from 'react';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../hooks/useCart';
import '../styles/bag.css';

const Bag = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, isLoading } = useCart();
    const [promoCode, setPromoCode] = useState('');

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;

    if (isLoading) {
        return (
            <div className="bag-page">
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <h2 style={{ letterSpacing: '2px', color: '#111' }}>LOADING BAG...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bag-page">
            <Navbar />

            <main className="bag-main-container">
                {cartItems.length > 0 ? (
                    <>
                        <h1 className="bag-page-title">Your Bag ({cartItems.length} items)</h1>
                        
                        <div className="bag-content-layout">
                            <div className="bag-items-column">
                                <div className="bag-items-header">
                                    <span className="header-product">PRODUCT</span>
                                    <span className="header-quantity">QUANTITY</span>
                                    <span className="header-total">TOTAL</span>
                                </div>

                                <div className="bag-items-list">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="bag-item-row">
                                            <div className="item-product-details">
                                                <img src={item.image} alt={item.title} className="item-image" />
                                                <div className="item-info">
                                                    <span className="item-category">{item.category}</span>
                                                    <h3 className="item-title">{item.title}</h3>
                                                    <div className="item-variants">
                                                        <span>Size: {item.size}</span>
                                                        <span>Color: {item.color}</span>
                                                    </div>
                                                    <span className="item-unit-price">${item.price.toFixed(2)}</span>
                                                    <button className="item-remove-btn" onClick={() => removeFromCart(item.id)}>
                                                        <X size={14} strokeWidth={2} /> REMOVE
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="item-quantity-column">
                                                <div className="bag-quantity-selector">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                            </div>

                                            <div className="item-total-column">
                                                <span className="item-total-price">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bag-summary-column">
                                <div className="summary-box">
                                    <h2 className="summary-title">ORDER SUMMARY</h2>
                                    
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping</span>
                                        <span className="shipping-free">Free</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Tax (est.)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>

                                    <div className="summary-divider"></div>

                                    <div className="summary-row summary-total">
                                        <span>TOTAL</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>

                                    <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                                        PROCEED TO CHECKOUT <ArrowRight size={18} strokeWidth={1.5} />
                                    </button>
                                    
                                    <button className="continue-shopping-btn" onClick={() => navigate('/all-collections')}>
                                        CONTINUE SHOPPING
                                    </button>
                                </div>

                                <div className="promo-code-section">
                                    <span className="promo-label">PROMO CODE</span>
                                    <div className="promo-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Enter code" 
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                        />
                                        <button>APPLY</button>
                                    </div>
                                    <div className="secure-checkout-logos">
                                        Secure checkout · Visa · Mastercard · Amex · PayPal
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bag-empty-state">
                        <ShoppingBag size={56} strokeWidth={1} color="#888888" className="empty-bag-icon" />
                        <h2>Your bag is empty</h2>
                        <p>Discover pieces you'll love in our collection.</p>
                        <button className="start-shopping-btn" onClick={() => navigate('/all-collections')}>
                            START SHOPPING <ArrowRight size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Bag;