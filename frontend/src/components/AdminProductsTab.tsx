import { useState, useRef } from 'react';
import { Search, AlertTriangle, Edit2, Archive, RotateCcw, X, Image as ImageIcon } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';
import { useCatalog, type Product } from '../hooks/useCatalog';

const AdminProductsTab = () => {
    const [activeTab, setActiveTab] = useState("All");
    const { products, categories, isLoading, refetch } = useCatalog();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const url = editingProduct 
            ? `http://localhost:8000/api/products/${editingProduct.id}` 
            : 'http://localhost:8000/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                body: formData,
                credentials: 'include' 
            });
            
            const data = await res.json();
            
            if (res.ok) {
                closeModal();
                refetch(); 
            } else {
                let errorMessage = "Error saving product";
                if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else if (Array.isArray(data.detail)) {
                    errorMessage = data.detail.map((err: any) => {
                        const fieldName = err.loc[err.loc.length - 1];
                        return `Field '${fieldName}': ${err.msg}`;
                    }).join('\n');
                }
                alert(errorMessage);
            }
        } catch (error) {
            alert("Network error while saving product");
        }
    };

    const handleArchiveToggle = async (id: string, currentStatus: string) => {
        const action = currentStatus === 'Archived' ? 'unarchive' : 'archive';
        const confirmMsg = currentStatus === 'Archived' 
            ? "Restore this product to Active status?" 
            : "Are you sure you want to archive this product?";
            
        if (!window.confirm(confirmMsg)) return;
        
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/products/${id}/${action}`, {
                method: 'PATCH'
            });
            if (res.ok) refetch(); 
        } catch (error) {
            console.error(`Failed to ${action} product`, error);
        }
    };

    const filteredProducts = products.filter(p => {
        if (activeTab === "All") return true;
        if (activeTab === "Active") return p.status === "Active";
        if (activeTab === "Draft") return p.status === "Draft";
        if (activeTab === "Archived") return p.status === "Archived";
        if (activeTab === "Low Stock") return p.stock <= 20;
        return true;
    });

    const renderStatusBadge = (status: string) => {
        let badgeClass = "badge-delivered"; 
        if (status === "Archived") badgeClass = "badge-cancelled"; 
        if (status === "Draft") badgeClass = "badge-pending"; 
        
        return <span className={`admin-badge ${badgeClass}`}>{status}</span>;
    };

    if (isLoading) return <div style={{ padding: '20px' }}>Loading products...</div>;

    return (
        <div className="admin-products-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Products</h1>
                    <span className="admin-page-subtitle">{products.length} products in catalogue</span>
                </div>
                <button 
                    className="admin-action-btn dark-btn"
                    onClick={openAddModal}
                >
                    + ADD PRODUCT
                </button>
            </div>

            <div className="admin-products-tabs">
                <button className={`admin-tab-btn ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>
                    All <span className="admin-tab-count">{products.length}</span>
                </button>
                <button className={`admin-tab-btn ${activeTab === 'Active' ? 'active' : ''}`} onClick={() => setActiveTab('Active')}>
                    Active <span className="admin-tab-count">{products.filter(p => p.status === 'Active').length}</span>
                </button>
                <button className={`admin-tab-btn ${activeTab === 'Archived' ? 'active' : ''}`} onClick={() => setActiveTab('Archived')}>
                    Archived <span className="admin-tab-count">{products.filter(p => p.status === 'Archived').length}</span>
                </button>
                <button className={`admin-tab-btn warning-tab ${activeTab === 'Low Stock' ? 'active' : ''}`} onClick={() => setActiveTab('Low Stock')}>
                    <AlertTriangle size={14} /> Low Stock <span className="admin-tab-count warning-count">{products.filter(p => p.stock <= 20).length}</span>
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-wrapper" style={{ width: '400px' }}>
                    <Search size={16} strokeWidth={1.5} className="admin-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..." 
                        className="admin-search-input"
                    />
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>PRODUCT</th>
                            <th>SKU</th>
                            <th>CATEGORY</th>
                            <th>PRICE</th>
                            <th>STOCK</th>
                            <th>SALES</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <div className="admin-td-product">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="admin-product-thumbnail" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div className="admin-product-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
                                                <ImageIcon size={20} color="#999" />
                                            </div>
                                        )}
                                        <div className="admin-td-stacked">
                                            <span className="admin-td-primary">{product.title}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="admin-td-standard sku-text">{product.sku}</span></td>
                                <td><span className="admin-td-standard">{product.category}</span></td>
                                <td><span className="admin-td-bold">${Number(product.price).toFixed(2)}</span></td>
                                <td>
                                    <span className={`admin-td-bold ${product.stock <= 20 ? 'stock-low' : 'stock-high'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td><span className="admin-td-standard">{product.sales}</span></td>
                                <td>{renderStatusBadge(product.status)}</td>
                                <td>
                                    <div className="admin-td-actions">
                                        <button 
                                            className="admin-icon-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(product)}
                                        >
                                            <Edit2 size={16} strokeWidth={1.5} />
                                        </button>
                                        
                                        {product.status === 'Archived' ? (
                                            <button 
                                                className="admin-icon-btn" 
                                                title="Unarchive" 
                                                onClick={() => handleArchiveToggle(product.id, product.status)}
                                            >
                                                <RotateCcw size={16} strokeWidth={1.5} />
                                            </button>
                                        ) : (
                                            <button 
                                                className="admin-icon-btn" 
                                                title="Archive" 
                                                onClick={() => handleArchiveToggle(product.id, product.status)}
                                            >
                                                <Archive size={16} strokeWidth={1.5} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', width: '500px', borderRadius: '8px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <form key={editingProduct?.id || 'new'} ref={formRef} onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>TITLE</label>
                                <input type="text" name="title" defaultValue={editingProduct?.title} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>SKU</label>
                                    <input type="text" name="sku" defaultValue={editingProduct?.sku} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>PRICE ($)</label>
                                    <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>CATEGORY</label>
                                    <select name="category_id" defaultValue={editingProduct?.category_id} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>STOCK</label>
                                    <input type="number" name="stock" defaultValue={editingProduct?.stock} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
                                    PRODUCT IMAGE {editingProduct && '(Leave empty to keep current image)'}
                                </label>
                                <input type="file" name="image" accept="image/*" style={{ width: '100%', padding: '10px', border: '1px dashed #ddd', borderRadius: '4px' }} />
                            </div>
                            
                            <button type="submit" className="admin-action-btn dark-btn" style={{ marginTop: '10px', width: '100%' }}>
                                {editingProduct ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsTab;