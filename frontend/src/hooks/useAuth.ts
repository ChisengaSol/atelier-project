import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithCredentials } from '../utils/api';

export interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    created_at: string;
}

export const useAuth = (requireAuth = true) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuthentication = async () => {
            try {
                const response = await fetchWithCredentials('http://localhost:8000/api/auth/me');
                
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    if (requireAuth) navigate('/login');
                }
            } catch (err) {
                console.error("Auth fetch error:", err);
                if (requireAuth) navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuthentication();
    }, [navigate, requireAuth]);

    const logout = async () => {
        try {
            await fetchWithCredentials('http://localhost:8000/api/auth/logout', {
                method: 'POST'
            });
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return { user, isLoading, logout };
};