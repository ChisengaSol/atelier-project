import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import '../styles/checkout.css';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const orderNumber = location.state?.orderNumber;
    if (!orderNumber) {
        return <Navigate to="/all-collections" />;
    }

    const customerName = user ? `${user.first_name}` : "valued customer";

    return (
        <div className="checkout-page">
            <Navbar />

            <main className="success-page-container">
                <div className="success-icon-wrapper">
                    <Check size={32} strokeWidth={2} />
                </div>
                
                <h1 className="success-title">Order Confirmed</h1>
                
                <p className="success-subtitle">
                    Thank you, {customerName}!
                </p>
                
                <p className="success-order-number">
                    Order #{orderNumber}
                </p>
                
                <p className="success-description">
                    A confirmation email has been sent to your email. Your order will arrive in 3–5 business days.
                </p>

                <button 
                    className="continue-shopping-black-btn"
                    onClick={() => navigate('/all-collections')}
                >
                    CONTINUE SHOPPING
                </button>
            </main>
        </div>
    );
};

export default CheckoutSuccess;