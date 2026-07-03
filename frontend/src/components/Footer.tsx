import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="newsletter-section">
                <span className="newsletter-subtitle">STAY INFORMED</span>
                <h2 className="newsletter-title">The Atelier Letter</h2>
                <p className="newsletter-desc">New arrivals, exclusive access, and curated edits — delivered to your inbox.</p>
                <form className="newsletter-form">
                    <input type="email" placeholder="your@email.com" required />
                    <button type="submit">SUBSCRIBE</button>
                </form>
            </div>

            <div className="footer-links-section">
                <div className="footer-heading footer-1">
                    <h4>ATELIER</h4>
                    <p>Premium fashion for the thoughtfully dressed.</p>
                </div>
                <div className="footer-heading footer-2">
                    <h5>SHOP</h5>
                    <a href="#">NEW IN</a>
                    <a href="#">WOMEN</a>
                    <a href="#">MEN</a>
                    <a href="#">SALE</a>
                    <a href="#">ACCESSORIES</a>
                </div>
                <div className="footer-heading footer-3">
                    <h5>HELP</h5>
                    <a href="#">SIZING GUIDE</a>
                    <a href="#">SHIPPING</a>
                    <a href="#">RETURNS</a>
                    <a href="#">CONTACT US</a>
                    <a href="#">FAQ</a>
                </div>
                <div className="footer-heading footer-4">
                    <h5>COMPANY</h5>
                    <a href="#">ABOUT</a>
                    <a href="#">SUSTAINABILITY</a>
                    <a href="#">CAREERS</a>
                    <a href="#">PRESS</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2026 Atelier. All rights reserved.</p>
                <div className="legal-links">
                    <a href="#">PRIVACY POLICY</a>
                    <a href="#">TERMS OF SERVICE</a>
                    <a href="#">COOKIE PREFERENCES</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;