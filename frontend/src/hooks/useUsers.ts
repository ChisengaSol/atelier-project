import { useState, useEffect } from 'react';
import { fetchWithCredentials } from '../utils/api'; 

// The shape of User data 
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    role: string; 
}

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetchWithCredentials('http://localhost:8000/api/users');
                const data = await response.json();
                
                if (response.ok && data.status === 'success') {
                    setUsers(data.data);
                } else {
                    setError(data.detail || data.message || "Failed to fetch users");
                    
                    if (response.status === 401) {
                        window.location.href = '/login';
                    }
                }
            } catch (err) {
                setError("Failed to connect to the API.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, isLoading, error };
};