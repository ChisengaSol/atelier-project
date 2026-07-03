import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { type Product } from '../hooks/useCatalog';
import '../styles/product-grid.css';

interface ProductGridProps {
    subtitle: string;
    title: string;
    products: Product[];
    headerStyle?: 'center' | 'split'; 
}

const ProductGrid = ({ subtitle, title, products, headerStyle = 'center' }: ProductGridProps) => {
    const navigate = useNavigate();
    const { toggleWishlist, isSaved } = useWishlist();
    
    return (
        <section className="product-grid-section">
            <div className={`product-grid-header ${headerStyle === 'split' ? 'header-split' : 'header-center'}`}>
                <div className="header-text-content">
                    <span className="product-grid-subtitle">{subtitle}</span>
                    <h2 className="product-grid-title">{title}</h2>
                </div>
                
                {/* Only show the "SHOP ALL" button if the header is split */}
                {headerStyle === 'split' && (
                    <a href="#" className="shop-all-link">
                        SHOP ALL <ArrowRight size={16} strokeWidth={1.5} />
                    </a>
                )}
            </div>

            <div className="grid-container">
                {products.map((product) => {
                    const saved = isSaved(product.id);
                    return (
                        <div key={product.id} className="product-card">
                            <div className="product-image-container">
                                <img src={product.image} alt={product.title} className="product-image" />
                                
                                {product.badge && (
                                    <button className="product-badge">{product.badge}</button>
                                )}

                                <div className="product-hover-overlay">
                                    <button 
                                        className="heart-button" 
                                        aria-label="Add to favorites"
                                        onClick={() => toggleWishlist(product)}
                                    >
                                        <Heart 
                                            size={18} 
                                            strokeWidth={saved ? 0 : 1.5} 
                                            fill={saved ? '#111' : 'transparent'}
                                            color={saved ? '#111' : 'currentColor'}
                                        />
                                    </button>
                                    <button onClick={() => navigate(`/product/${product.id}`)} className="quick-view-button">
                                        QUICK VIEW
                                    </button>
                                </div>
                            </div>

                            <div className="product-info">
                                <span className="product-category">{product.category}</span>
                                <a href="#" className="product-title">{product.title}</a>
                                <div className="product-pricing">
                                    <span className="current-price">${product.price}</span>
                                    {product.originalPrice && (
                                        <span className="original-price">${product.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default ProductGrid;