import { useState, useEffect } from 'react';
import { type Product } from './useCatalog';

export const useWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    // Load wishlist from local storage on mount and listen for changes
    useEffect(() => {
        const loadWishlist = () => {
            const saved = localStorage.getItem('atelier_wishlist');
            if (saved) {
                setWishlistItems(JSON.parse(saved));
            }
        };

        loadWishlist();

        // Listen for custom event to sync state across different components
        window.addEventListener('wishlistUpdated', loadWishlist);
        return () => window.removeEventListener('wishlistUpdated', loadWishlist);
    }, []);

    const toggleWishlist = (product: Product) => {
        let currentWishlist: Product[] = [];
        const saved = localStorage.getItem('atelier_wishlist');
        if (saved) {
            currentWishlist = JSON.parse(saved);
        }

        const isSaved = currentWishlist.some(item => item.id === product.id);
        let newWishlist;

        if (isSaved) {
            // Remove it
            newWishlist = currentWishlist.filter(item => item.id !== product.id);
        } else {
            // Add it
            newWishlist = [...currentWishlist, product];
        }

        localStorage.setItem('atelier_wishlist', JSON.stringify(newWishlist));
        setWishlistItems(newWishlist);
        
        // Dispatch event so other components update instantly
        window.dispatchEvent(new Event('wishlistUpdated'));
    };

    const isSaved = (productId: string | number) => {
        return wishlistItems.some(item => item.id === productId);
    };

    return { wishlistItems, toggleWishlist, isSaved };
};