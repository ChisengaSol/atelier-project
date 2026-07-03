import { ArrowRight } from 'lucide-react';
import '../styles/shop-by-category.css';

import cat1 from '../assets/malicki-m-beser.jpg';
import cat2 from '../assets/aiony-haust.jpg';
import cat3 from '../assets/mohamadreza-khashay.jpg';

const ShopByCategory = () => {
    const categories = [
        { id: 1, image: cat1, count: "14 PIECES", name: "OUTERWEAR" },
        { id: 2, image: cat2, count: "22 PIECES", name: "DRESSES" },
        { id: 3, image: cat3, count: "18 PIECES", name: "KNITWEAR" }
    ];

    return (
        <section className="category-section">
            <div className="category-header">
                <h2 className="category-title">
                    Shop by<br />
                    <i>Category</i>
                </h2>
                <a href="#" className="view-all-link">
                    VIEW ALL <ArrowRight size={16} strokeWidth={1.5} />
                </a>
            </div>

            <div className="category-grid">
                {categories.map((category) => (
                    <a href="#" key={category.id} className="category-card">
                        <img src={category.image} alt={category.name} className="category-image" />
                        
                        <div className="category-overlay"></div>
                        
                        <div className="category-info">
                            <span className="category-count">{category.count}</span>
                            <h3 className="category-name">{category.name}</h3>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}

export default ShopByCategory;