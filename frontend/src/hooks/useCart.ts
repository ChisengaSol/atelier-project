import { useState, useEffect } from 'react';
import { fetchWithCredentials } from '../utils/api';

export interface CartItem {
    id: string;
    product_id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    size: string;
    color: string;
    quantity: number;
}

export const useCart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/cart');
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setCartItems(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch and sync across tabs/components
    useEffect(() => {
        fetchCart();
        window.addEventListener('cartUpdated', fetchCart);
        return () => window.removeEventListener('cartUpdated', fetchCart);
    }, []);

    const addToCart = async (productId: string | number, size: string, color: string, quantity: number) => {
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: String(productId), size, color, quantity })
            });
            
            if (res.ok) {
                window.dispatchEvent(new Event('cartUpdated')); // Syncs navbar icon and bag
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to add to cart", error);
            return false;
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        
        // UI update for instant feedback
        setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
        
        try {
            await fetchWithCredentials(`http://localhost:8000/api/users/me/cart/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            fetchCart(); // Revert if failed
        }
    };

    const removeFromCart = async (itemId: string) => {
        //UI update
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        
        try {
            await fetchWithCredentials(`http://localhost:8000/api/users/me/cart/${itemId}`, {
                method: 'DELETE'
            });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            fetchCart(); // Revert if failed
        }
    };

    return { cartItems, isLoading, fetchCart, addToCart, updateQuantity, removeFromCart };
};