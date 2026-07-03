import { useState } from 'react';
import { Search, User, Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    const handleSearchClick = () => {
        if (isSearchOpen) {
            if (searchValue.trim() === '') {
                setIsSearchOpen(false);
            }
            // search execution logic goes here
        } else {
            setIsSearchOpen(true);
        }
    };

    return (
        <header className="navbar-wrapper">
            <nav className="navbar-main">
                <div className="navbar-left">
                    <Link to="/all-collections">NEW IN</Link>
                    <Link to="/all-collections">WOMEN</Link>
                    <Link to="/all-collections">MEN</Link>
                    <Link to="/all-collections">SALE</Link>
                </div>
                
                <div className="navbar-center">
                    <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1>ATELIER</h1>
                    </Link>
                </div>
                
                <div className="navbar-right">
                    <button onClick={handleSearchClick} className="icon-button" title="Search">
                        <Search size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => navigate('/customer-dashboard')} className="icon-button" title="Account">
                        <User size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => navigate('/wishlist')} className="icon-button" title="Wishlist">
                        <Heart size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => navigate('/bag')} className="icon-button" title="Shopping Bag">
                        <ShoppingBag size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </nav>

            {isSearchOpen && (
                <div className="navbar-search-container">
                    <div className="search-input-wrapper">
                        <Search size={18} strokeWidth={1.5} className="search-inner-icon" />
                        <input 
                            type="text" 
                            placeholder="Search for pieces..." 
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;