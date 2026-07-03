import { ArrowRight } from 'lucide-react';
import '../styles/editorial.css';
import editorialImage from '../assets/morgane-leisser.jpg';

const Editorial = () => {
    return (
        <section className="editorial-section">
            <div className="editorial-image-container">
                <img src={editorialImage} alt="Editorial featuring two models" className="editorial-image" />
            </div>
            
            <div className="editorial-content">
                <span className="editorial-subtitle">EDITORIAL</span>
                <h2 className="editorial-title">
                    The Art of<br />
                    <i>Understated</i><br />
                    Elegance
                </h2>
                <p className="editorial-desc">
                    Our summer collection explores the relationship between simplicity and sophistication — pieces that speak softly and stay long in the memory.
                </p>
                <button className="editorial-btn">
                    READ MORE <ArrowRight size={16} strokeWidth={1.5} />
                </button>
            </div>
        </section>
    );
}

export default Editorial;