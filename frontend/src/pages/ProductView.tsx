import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, StarHalf, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../hooks/useCart';
import '../styles/product-view.css';

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Fetch hooks
    const { product, isLoading } = useProduct(id);
    const { addToCart } = useCart();

    const [selectedColor, setSelectedColor] = useState('DEFAULT');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    
    const mainImg = product?.image || 'https://via.placeholder.com/600x800?text=No+Image';
    const fallbackImages = [mainImg, mainImg, mainImg]; 
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const uiColors = ["DEFAULT", "BLACK", "WHITE"];
    const uiSizes = ["S", "M", "L", "XL"];

    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        } else if (type === 'increase' && quantity < (product?.stock || 10)) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleAddToBag = async () => {
        if (!product || !selectedSize) return;
        setIsAdding(true);
        const success = await addToCart(product.id, selectedSize, selectedColor, quantity);
        setIsAdding(false);
        
        if (success) {
            navigate('/bag'); 
        } else {
            alert("Please log in to add items to your bag.");
        }
    };

    if (isLoading) {
        return (
            <div className="product-view-page">
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <h2 style={{ letterSpacing: '2px', color: '#111' }}>LOADING PIECE...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-view-page">
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#d93025' }}>
                    <h2>Product not found</h2>
                    <Link to="/all-collections" style={{ textDecoration: 'underline', color: '#111', marginTop: '20px', display: 'inline-block' }}>Return to Shop</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const currentDisplayImage = activeImage || mainImg;
    const savings = product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : null;

    return (
        <div className="product-view-page">
            <Navbar />
            <main className="product-main-container">
                <div className="product-nav">
                    <Link to="/all-collections" className="back-link">
                        <ChevronLeft size={16} strokeWidth={1.5} /> BACK TO SHOP
                    </Link>
                </div>

                <div className="product-layout">
                    <div className="product-gallery">
                        <div className="thumbnail-list">
                            {fallbackImages.map((img, index) => (
                                <button 
                                    key={index} 
                                    className={`thumbnail-btn ${currentDisplayImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                        <div className="main-image-container">
                            {product.badge && <span className="product-badge sale-badge">{product.badge}</span>}
                            <img src={currentDisplayImage} alt={product.title} className="main-image" />
                        </div>
                    </div>

                    <div className="product-info-column">
                        <div className="product-header-section">
                            <span className="product-category-label">{product.category}</span>
                            <div className="title-and-wishlist">
                                <h1 className="product-title-large">{product.title}</h1>
                                <button className="wishlist-btn" aria-label="Add to wishlist">
                                    <Heart size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                            
                            <div className="product-reviews">
                                <div className="stars">
                                    <Star size={14} fill="#c9a76d" stroke="none" />
                                    <Star size={14} fill="#c9a76d" stroke="none" />
                                    <Star size={14} fill="#c9a76d" stroke="none" />
                                    <Star size={14} fill="#c9a76d" stroke="none" />
                                    <Star size={14} fill="#c9a76d" stroke="none" />
                                </div>
                                <span className="review-text">5.0 (Placeholder reviews)</span>
                            </div>

                            <div className="product-pricing-large">
                                <span className="current-price-large">${Number(product.price).toFixed(2)}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="original-price-large">${Number(product.originalPrice).toFixed(2)}</span>
                                        <span className="savings-badge">SAVE ${savings}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <hr className="divider" />

                        <div className="selectors-section">
                            <div className="selector-group">
                                <span className="selector-label">COLOR — <span className="selected-value-text">{selectedColor.charAt(0) + selectedColor.slice(1).toLowerCase()}</span></span>
                                <div className="button-group">
                                    {uiColors.map(color => (
                                        <button 
                                            key={color}
                                            className={`option-btn ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="selector-group">
                                <div className="size-header">
                                    <span className="selector-label">SIZE</span>
                                    <a href="#" className="size-guide-link">SIZE GUIDE</a>
                                </div>
                                <div className="button-group">
                                    {uiSizes.map(size => (
                                        <button 
                                            key={size}
                                            className={`option-btn size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {!selectedSize && <span className="selection-prompt">Please select a size</span>}
                            </div>
                        </div>

                        <div className="add-to-bag-row">
                            <div className="quantity-selector">
                                <button onClick={() => handleQuantityChange('decrease')} aria-label="Decrease quantity">−</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange('increase')} aria-label="Increase quantity">+</button>
                            </div>
                            <button 
                                onClick={handleAddToBag}
                                className={`add-to-bag-btn ${selectedSize && product.stock > 0 ? 'ready' : ''}`} 
                                disabled={product.stock === 0 || !selectedSize || isAdding}
                            >
                                {isAdding ? 'ADDING...' : (product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK')}
                            </button>
                        </div>
                        
                        {product.stock > 0 && product.stock <= 5 && (
                            <p style={{ color: '#d93025', fontSize: '12px', marginTop: '10px' }}>Only {product.stock} left in stock - order soon.</p>
                        )}

                        <div className="product-description-section">
                            <p className="description-text">
                                Elevate your wardrobe with the {product.title}. Carefully crafted and designed for the modern aesthetic. 
                                <br/><br/>
                                <strong>SKU:</strong> {product.sku}
                            </p>
                            
                            <hr className="divider" />
                            
                            <ul className="perks-list">
                                <li><Truck size={18} strokeWidth={1.5} className="perk-icon" /> Free shipping on orders over $200</li>
                                <li><RotateCcw size={18} strokeWidth={1.5} className="perk-icon" /> Free returns within 30 days</li>
                                <li><ShieldCheck size={18} strokeWidth={1.5} className="perk-icon" /> Authenticity guaranteed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductView;