import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import '../../styles/register.css';

import registerImage from '../../assets/chyntia-juls.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        agreedToTerms: false,
        wantsEmails: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Generates a highly secure 16-character password
    const handleSuggestPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let strongPassword = "";
        for (let i = 0; i < 16; i++) {
            strongPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        setFormData(prev => ({ ...prev, password: strongPassword }));
        setShowPassword(true); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                navigate('/login', { state: { message: "Account created successfully! Please log in." } });
            } else {
                setError(data.detail || data.message || "Registration failed");
            }
        } catch (err) {
            setError("Network error. Please make sure the server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-image-side">
                <img src={registerImage} alt="Fashion model" className="register-image" />
                <div className="quote-overlay">
                    <p className="quote-text">
                        "Style is a way to say who you are without having to speak."
                    </p>
                    <span className="quote-author">— Rachel Zoe</span>
                </div>
            </div>

            <div className="register-form-side">
                <div className="register-form-container">
                    <div className="register-header">
                        <h1 className="brand-logo">ATELIER</h1>
                    </div>

                    <div className="register-content">
                        <h2>Create account</h2>
                        <p className="subtitle">Join Atelier for exclusive access</p>

                        {error && (
                            <div style={{ color: '#d93025', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="name-row">
                                <div className="input-group">
                                    <label htmlFor="firstName">FIRST NAME</label>
                                    <input 
                                        type="text" 
                                        id="firstName" 
                                        name="firstName"
                                        placeholder="Jane"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="lastName">LAST NAME</label>
                                    <input 
                                        type="text" 
                                        id="lastName" 
                                        name="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="email">EMAIL ADDRESS</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                    disabled={isLoading}
                                    autoComplete="username"
                                />
                            </div>

                            <div className="input-group password-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                    <label htmlFor="password" style={{ marginBottom: 0 }}>PASSWORD</label>
                                    <button 
                                        type="button" 
                                        onClick={handleSuggestPassword}
                                        style={{ background: 'none', border: 'none', color: '#666', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                        disabled={isLoading}
                                    >
                                        Suggest strong password
                                    </button>
                                </div>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        id="password" 
                                        name="password"
                                        placeholder="Min. 8 characters"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        minLength={8}
                                        required 
                                        disabled={isLoading}
                                        autoComplete="new-password" 
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        name="agreedToTerms"
                                        checked={formData.agreedToTerms}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-text">I agree to the Terms of Service and Privacy Policy</span>
                                </label>
                            </div>

                            <div className="checkbox-group">
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        name="wantsEmails"
                                        checked={formData.wantsEmails}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-text">I'd like to receive emails about new arrivals and exclusive offers</span>
                                </label>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? 'CREATING ACCOUNT...' : (
                                    <>CREATE ACCOUNT <ArrowRight size={18} strokeWidth={1.5} /></>
                                )}
                            </button>
                        </form>

                        <div className="login-prompt">
                            <p>Already have an account? <Link to="/login">SIGN IN</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;