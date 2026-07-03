import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Editorial from "../components/Editorial"; 
import ProductGrid from "../components/ProductGrid"; 
import ShopByCategory from '../components/ShopByCategory';
import '../styles/landingpage.css';
import heroImage from '../assets/tamara-bellis.jpg';
import new1 from '../assets/valna-studio.jpg';
import new2 from '../assets/dom-hill.jpg';
import new3 from '../assets/dwayne-joe.jpg';
import new4 from '../assets/malicki-m-beser.jpg';
import best1 from '../assets/tobias-tullius.jpg';
import best2 from '../assets/mariabeatrice-alonzi.jpg';
import best3 from '../assets/usama-akram.jpg';
import best4 from '../assets/alireza-dolati.jpg';

const Landingpage = () => {
    const announcements = [
        "NEW ARRIVALS EVERY THURSDAY",
        "SUSTAINABLY MADE",
        "FREE SHIPPING OVER $200"
    ];

    // Data for the New Arrivals section
    const newArrivalsData = [
        { id: 1, image: new1, category: "OUTERWEAR", title: "OVERSIZED CASHMERE COAT", price: 485, originalPrice: 620, badge: "SALE" },
        { id: 2, image: new2, category: "DRESSES", title: "SILK BIAS-CUT DRESS", price: 295, badge: "NEW" },
        { id: 3, image: new3, category: "TROUSERS", title: "RELAXED LINEN TROUSERS", price: 175 },
        { id: 4, image: new4, category: "JACKETS", title: "STRUCTURED WOOL BLAZER", price: 320, badge: "BESTSELLER" }
    ];

    // Data for the Bestsellers section
    const bestsellersData = [
        { id: 1, image: best1, category: "KNITWEAR", title: "FINE-KNIT MERINO SWEATER", price: 145 },
        { id: 2, image: best2, category: "DRESSES", title: "EDITORIAL MAXI DRESS", price: 380, originalPrice: 495, badge: "SALE" },
        { id: 3, image: best3, category: "TOPS", title: "CLASSIC WHITE POPLIN SHIRT", price: 120, badge: "NEW" },
        { id: 4, image: best4, category: "ACCESSORIES", title: "WIDE BRIM WOOL HAT", price: 95 }
    ];

    const navigate = useNavigate();

    return (
        <div className="landing-wrapper">
            <Navbar />
            
            <main className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <div className="hero-left">
                        <span className="collection-subtitle">SUMMER COLLECTION 2026</span>
                        <h1 className="hero-title">
                            Dressed<br />
                            <i>for the</i><br />
                            moment.
                        </h1>
                        <button className="shop-btn" onClick={() => navigate("/all-collections")}>
                            SHOP THE COLLECTION <ArrowRight size={18} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="hero-right">
                        <p className="hero-desc">
                            Effortless pieces designed for the modern wardrobe. Thoughtfully crafted, seasonlessly worn.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">340+</span>
                                <span className="stat-label">PIECES</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">28</span>
                                <span className="stat-label">COUNTRIES</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator">
                    <ChevronDown size={24} strokeWidth={1.5} />
                </div>

                <button className="help-btn">?</button>
            </main>

            <div className="announcement-bar">
                <div className="announcement-track">
                    <div className="announcement-set">
                        {announcements.map((item, idx) => (
                            <span key={`set1-${idx}`} className="announcement-item">
                                {item} <span className="announcement-star">&#x2726;</span>
                            </span>
                        ))}
                    </div>
                    <div className="announcement-set">
                        {announcements.map((item, idx) => (
                            <span key={`set2-${idx}`} className="announcement-item">
                                {item} <span className="announcement-star">&#x2726;</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <ShopByCategory />

            <ProductGrid 
                subtitle="JUST IN"
                title="New Arrivals"
                products={newArrivalsData}
                headerStyle="split"
            />

            <Editorial /> 
            
            <ProductGrid 
                subtitle="MOST LOVED"
                title="Bestsellers"
                products={bestsellersData}
                headerStyle="center"
            />

            <Footer />
        </div>
    );
}

export default Landingpage;