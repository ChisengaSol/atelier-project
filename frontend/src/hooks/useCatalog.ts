import { useState, useEffect, useCallback } from 'react';
import { fetchWithCredentials } from '../utils/api';

export interface Product {
    id: string;
    image_url: string; 
    image: string;     
    title: string;
    tag: string;
    sku: string;
    category_id: string;
    category: string;
    price: number;
    originalPrice?: number | null;
    badge?: string | null;
    stock: number;
    sales: number;
    revenue: number;
    status: string;
    dateAdded: string;
}

export interface Category {
    id: string;
    name: string;
}

export const useCatalog = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // We use useCallback so we can return this function and call it 
    // from the admin panel whenever we add/edit a product and need to refresh the table.
    const fetchCatalog = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetchWithCredentials('http://localhost:8000/api/products'),
                fetchWithCredentials('http://localhost:8000/api/categories')
            ]);

            if (!productsRes.ok || !categoriesRes.ok) {
                throw new Error("Failed to fetch catalog data");
            }

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();

            if (categoriesData.status === 'success') {
                setCategories(categoriesData.data);
            }

            if (productsData.status === 'success') {
                // Map the raw DB data to our universal frontend model
                const formattedProducts = productsData.data.map((p: any) => ({
                    id: p.id,
                    image_url: p.image_url || '',
                    image: p.image_url || 'https://via.placeholder.com/400x500?text=No+Image',
                    title: p.title,
                    tag: p.tag || '',
                    sku: p.sku || 'N/A',
                    category_id: p.category_id || '',
                    category: p.category ? p.category.toUpperCase() : 'UNCATEGORIZED',
                    price: p.price,
                    originalPrice: null,
                    badge: p.stock <= 5 && p.stock > 0 ? 'LOW STOCK' : null,
                    stock: p.stock || 0,
                    sales: p.sales || 0,
                    revenue: p.revenue || 0,
                    status: p.status,
                    dateAdded: new Date().toISOString()
                }));
                setProducts(formattedProducts);
            }
        } catch (err) {
            console.error(err);
            setError("Unable to load catalog data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    return { products, categories, isLoading, error, refetch: fetchCatalog };
};