import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { useWishlist } from '../hooks/useWishlist';
import '../styles/wishlist.css';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlistItems } = useWishlist();

    return (
        <div className="wishlist-page">
            <div className="wishlist-header-wrapper" style={{ marginTop: '50px' }}>
                <span className="wishlist-subtitle">SAVED</span>
                <h1 className="wishlist-main-title">Your Wishlist</h1>
            </div>

            {wishlistItems.length > 0 ? (
                <div className="wishlist-grid-wrapper">
                    <ProductGrid 
                        subtitle="" 
                        title="" 
                        products={wishlistItems} 
                        headerStyle="center" 
                    />
                </div>
            ) : (
                <div className="wishlist-empty-state">
                    <Heart size={56} strokeWidth={1} color="#888888" className="empty-heart-icon" />
                    <h2>Nothing saved yet</h2>
                    <p>Browse our collection and save pieces you love.</p>
                    <button 
                        className="shop-collection-btn"
                        onClick={() => navigate('/all-collections')}
                    >
                        SHOP THE COLLECTION
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;