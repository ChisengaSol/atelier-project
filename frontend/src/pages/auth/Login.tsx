import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { fetchWithCredentials } from '../../utils/api'; 
import '../../styles/register.css'; 
import '../../styles/login.css';    

import loginImage from '../../assets/alina-bordunova.jpg';

interface LoginProps {
    onLoginSuccess?: () => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract the success message passed from the Register page
    const successMessage = location.state?.message;

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Call secure FastAPI login endpoint
            const response = await fetchWithCredentials('http://localhost:8000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    // Check the role returned from the backend and route accordingly
                    if (data.role === 'superadmin' || data.role === 'admin') {
                        window.location.href = '/admin-dashboard'; 
                    } else {
                        window.location.href = '/home'; 
                    }
                }
            } else {
                setError(data.detail || 'Authentication failed. Please try again.');
            }
        } catch (err) {
            setError('Unable to connect to the authentication server. Ensure your backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page"> 
            <div className="register-image-side">
                <img src={loginImage} alt="Fashion model walking" className="register-image" />
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
                        <h2>Welcome back</h2>
                        <p className="subtitle">Sign in to your account</p>

                        {/* Success Message from Registration */}
                        {successMessage && (
                            <div style={{ 
                                padding: '12px', 
                                backgroundColor: '#d1e7dd', 
                                color: '#0f5132', 
                                border: '1px solid #badbcc',
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                marginBottom: '20px',
                                letterSpacing: '0.5px'
                            }}>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="admin-error" style={{ 
                                padding: '12px', 
                                backgroundColor: '#fce8e6', 
                                color: '#c5221f', 
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                marginBottom: '20px',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="input-group">
                                <label htmlFor="email">EMAIL ADDRESS</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    required 
                                />
                            </div>

                            <div className="input-group password-group">
                                <div className="password-header">
                                    <label htmlFor="password">PASSWORD</label>
                                    <a href="#" className="forgot-password-link">FORGOT PASSWORD?</a>
                                </div>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        id="password" 
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-text">Remember me for 30 days</span>
                                </label>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? 'AUTHENTICATING...' : (
                                    <>
                                        SIGN IN <ArrowRight size={18} strokeWidth={1.5} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="social-login-divider">
                            <span>or</span>
                        </div>

                        <button className="google-login-btn" disabled={isLoading}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            CONTINUE WITH GOOGLE
                        </button>

                        <div className="login-prompt">
                            <p>New to Atelier? <Link to="/register">CREATE AN ACCOUNT</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;