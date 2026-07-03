import { useState } from 'react';
import { fetchWithCredentials } from '../utils/api';
import '../styles/admin-dashboard.css';

const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetchWithCredentials('http://localhost:8000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Cookie is automatically set by the browser here!
                onLoginSuccess();
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f5f7' }}>
            <form className="admin-settings-card" style={{ width: '400px', padding: '40px' }} onSubmit={handleLogin}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', letterSpacing: '2px' }}>ATELIER</h2>
                
                {error && <div className="admin-error" style={{ marginBottom: '20px', color: '#d93025' }}>{error}</div>}

                <div className="admin-input-group" style={{ marginBottom: '20px' }}>
                    <label>EMAIL</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                <div className="admin-input-group" style={{ marginBottom: '30px' }}>
                    <label>PASSWORD</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    className="admin-action-btn dark-btn" 
                    style={{ width: '100%', padding: '15px' }}
                    disabled={isLoading}
                >
                    {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;