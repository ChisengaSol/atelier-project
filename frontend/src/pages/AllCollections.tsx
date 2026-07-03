import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { useCatalog } from '../hooks/useCatalog';
import '../styles/all-collections.css';

const AllCollections = () => {
    // Grab data from our shared hook!
    const { products, categories, isLoading, error } = useCatalog();

    // Filter & Sort State
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [sortOption, setSortOption] = useState("NEWEST");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [maxPrice, setMaxPrice] = useState(500);
    const [showOnlySale, setShowOnlySale] = useState(false);

    // Build category tabs array dynamically: "ALL" + Database Categories
    const categoriesList = ["ALL", ...categories.map(c => c.name.toUpperCase())];

    // Filter Logic
    // We filter out archived/draft products automatically for the storefront
    let displayedProducts = products
        .filter(p => p.status === 'Active') 
        .filter(p => {
            const matchesCategory = activeCategory === "ALL" || p.category === activeCategory;
            const matchesPrice = p.price <= maxPrice;
            const matchesSale = showOnlySale ? (p.badge === "SALE" || p.originalPrice) : true;
            return matchesCategory && matchesPrice && matchesSale;
        });

    // Sort Logic
    displayedProducts.sort((a, b) => {
        if (sortOption === "PRICE: LOW TO HIGH") return a.price - b.price;
        if (sortOption === "PRICE: HIGH TO LOW") return b.price - a.price;
        if (sortOption === "BESTSELLING") return b.sales - a.sales;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(); 
    });

    const resetFilters = () => {
        const highestPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 500;
        setMaxPrice(Math.ceil(highestPrice / 10) * 10);
        setShowOnlySale(false);
    };

    if (isLoading) {
        return (
            <div className="collections-page">
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <h2 style={{ letterSpacing: '2px', color: '#111' }}>LOADING PIECES...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="collections-page">
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#d93025' }}>
                    <h3>{error}</h3>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="collections-page">
            <Navbar />

            <div className="collections-header-wrapper">
                <div className="collections-titles">
                    <span className="collections-subtitle">BROWSE</span>
                    <h1 className="collections-main-title">All Collections</h1>
                </div>

                <div className="filter-bar">
                    <div className="categories-scroll-container">
                        {categoriesList.map(cat => (
                            <button 
                                key={cat}
                                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="filter-actions">
                        <span className="item-count">{displayedProducts.length} pieces</span>
                        
                        <button className="filter-toggle-btn" onClick={() => setIsFilterOpen(true)}>
                            <SlidersHorizontal size={16} strokeWidth={1.5} /> FILTER
                        </button>

                        <div className="sort-dropdown-container">
                            <button 
                                className="sort-toggle-btn"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {sortOption} <ChevronDown size={16} strokeWidth={1.5} />
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="sort-dropdown-menu">
                                    {["NEWEST", "PRICE: LOW TO HIGH", "PRICE: HIGH TO LOW", "BESTSELLING"].map(opt => (
                                        <button 
                                            key={opt}
                                            className={`sort-option ${sortOption === opt ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSortOption(opt);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isFilterOpen && (
                <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}>
                    <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-sidebar-header">
                            <h2>Filters</h2>
                            <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)}>
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="filter-section">
                            <h3>Max Price: ${maxPrice}</h3>
                            <input 
                                type="range" 
                                min="0" 
                                max="1000" 
                                step="10"
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="price-slider"
                            />
                            <div className="price-labels">
                                <span>$0</span>
                                <span>$1000+</span>
                            </div>
                        </div>

                        <div className="filter-section">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={showOnlySale}
                                    onChange={(e) => setShowOnlySale(e.target.checked)}
                                />
                                <span>Show Sale Items Only</span>
                            </label>
                        </div>

                        <div className="filter-sidebar-footer">
                            <button className="clear-filters-btn" onClick={resetFilters}>CLEAR ALL</button>
                            <button className="apply-filters-btn" onClick={() => setIsFilterOpen(false)}>
                                APPLY ({displayedProducts.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {displayedProducts.length > 0 ? (
                <div className="collection-grid-wrapper">
                    <ProductGrid 
                        subtitle="" 
                        title="" 
                        products={displayedProducts} 
                        headerStyle="center" 
                    />
                </div>
            ) : (
                <div className="empty-state-container">
                    <h3>No pieces found</h3>
                    <p>We couldn't find any items matching your current filters.</p>
                    <button className="clear-filters-btn" onClick={resetFilters}>
                        CLEAR FILTERS
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AllCollections;