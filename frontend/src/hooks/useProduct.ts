import { useState, useEffect } from 'react';
import { useCatalog, type Product } from './useCatalog';

export const useProduct = (id: string | undefined) => {
    const { products, isLoading, error } = useCatalog();
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!isLoading && products.length > 0 && id) {
            // Find the product that matches the ID from the URL
            const foundProduct = products.find(p => String(p.id) === String(id));
            setProduct(foundProduct || null);
        }
    }, [id, products, isLoading]);

    return { product, isLoading, error };
};