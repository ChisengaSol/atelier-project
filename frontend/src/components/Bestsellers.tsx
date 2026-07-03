import { Heart } from 'lucide-react';
import '../styles/bestsellers.css';

import img1 from '../assets/tobias-tullius.jpg';
import img2 from '../assets/mariabeatrice-alonzi.jpg';
import img3 from '../assets/usama-akram.jpg';
import img4 from '../assets/alireza-dolati.jpg';

const Bestsellers = () => {
    const products = [
        {
            id: 1,
            image: img1,
            category: "KNITWEAR",
            title: "FINE-KNIT MERINO SWEATER",
            price: 145,
        },
        {
            id: 2,
            image: img2,
            category: "DRESSES",
            title: "EDITORIAL MAXI DRESS",
            price: 380,
            originalPrice: 495,
            badge: "SALE"
        },
        {
            id: 3,
            image: img3,
            category: "TOPS",
            title: "CLASSIC WHITE POPLIN SHIRT",
            price: 120,
            badge: "NEW"
        },
        {
            id: 4,
            image: img4,
            category: "ACCESSORIES",
            title: "WIDE BRIM WOOL HAT",
            price: 95,
        }
    ];

    return (
        <section className="bestsellers-section">
            <div className="bestsellers-header">
                <span className="bestsellers-subtitle">MOST LOVED</span>
                <h2 className="bestsellers-title">Bestsellers</h2>
            </div>

            <div className="bestsellers-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img src={product.image} alt={product.title} className="product-image" />
                            
                            {product.badge && (
                                <button className="product-badge">{product.badge}</button>
                            )}

                            <div className="product-hover-overlay">
                                <button className="heart-button" aria-label="Add to favorites">
                                    <Heart size={18} strokeWidth={1.5} />
                                </button>
                                <button className="quick-view-button">
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
                ))}
            </div>
        </section>
    );
}

export default Bestsellers;