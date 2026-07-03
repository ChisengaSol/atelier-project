import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

interface Address {
    id: string;
    type: string;
    isDefault: boolean;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

const AddressesTab = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        type: 'HOME',
        first_name: '',
        last_name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States'
    });

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/addresses');
            const data = await res.json();
            
            if (res.ok && data.status === 'success') {
                setAddresses(data.data);
            }
        } catch (error) {
            console.error("Failed to load addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleRemoveAddress = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this address?")) return;
        
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/users/me/addresses/${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                fetchAddresses();
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to remove address");
            }
        } catch (error) {
            console.error("Error removing address:", error);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/users/me/addresses/${id}/default`, {
                method: 'PATCH'
            });
            
            if (res.ok) {
                fetchAddresses();
            }
        } catch (error) {
            console.error("Error setting default address:", error);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/users/me/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                // Reset form and close
                setFormData({
                    type: 'HOME', first_name: '', last_name: '', 
                    street: '', city: '', state: '', zip: '', country: 'United States'
                });
                setIsModalOpen(false);
                fetchAddresses();
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to add address");
            }
        } catch (error) {
            console.error("Error adding address:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading addresses...</div>;
    }

    return (
        <>
            <div className="content-header-row">
                <h2 className="content-title">Saved Addresses</h2>
                <button className="add-action-btn" onClick={() => setIsModalOpen(true)}>
                    + ADD ADDRESS
                </button>
            </div>
            
            <div className="addresses-grid">
                {addresses.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                        <p>No addresses saved.</p>
                    </div>
                ) : (
                    addresses.map(address => (
                        <div key={address.id} className={`address-card ${address.isDefault ? 'default-card' : ''}`}>
                            <div className="address-card-header">
                                <span className="address-type-label">{address.type}</span>
                                {address.isDefault && <span className="default-badge">Default</span>}
                            </div>
                            
                            <div className="address-details">
                                <h3 className="address-name">{address.firstName} {address.lastName}</h3>
                                <p className="address-line">{address.street}</p>
                                <p className="address-line">{address.city}, {address.state} {address.zip}</p>
                                <p className="address-line">{address.country}</p>
                            </div>
                            
                            <div className="address-actions">
                                {!address.isDefault && (
                                    <>
                                        <button 
                                            className="text-action-btn underline-btn" 
                                            onClick={() => handleSetDefault(address.id)}
                                        >
                                            SET DEFAULT
                                        </button>
                                        <button 
                                            className="text-action-btn remove-btn" 
                                            onClick={() => handleRemoveAddress(address.id)}
                                        >
                                            REMOVE
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Address Modal */}
            {isModalOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                }}>
                    <div style={{ 
                        backgroundColor: '#fff', padding: '30px', width: '500px', 
                        borderRadius: '8px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '500' }}>Add New Address</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>ADDRESS TYPE</label>
                                <select 
                                    name="type" value={formData.type} onChange={handleInputChange} required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="HOME">HOME</option>
                                    <option value="WORK">WORK</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>FIRST NAME</label>
                                    <input 
                                        type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>LAST NAME</label>
                                    <input 
                                        type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>STREET ADDRESS</label>
                                <input 
                                    type="text" name="street" value={formData.street} onChange={handleInputChange} required 
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>CITY</label>
                                    <input 
                                        type="text" name="city" value={formData.city} onChange={handleInputChange} required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>STATE</label>
                                    <input 
                                        type="text" name="state" value={formData.state} onChange={handleInputChange} required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>ZIP</label>
                                    <input 
                                        type="text" name="zip" value={formData.zip} onChange={handleInputChange} required 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>COUNTRY</label>
                                <input 
                                    type="text" name="country" value={formData.country} onChange={handleInputChange} required 
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                                />
                            </div>
                            
                            <button type="submit" className="save-changes-btn" style={{ width: '100%', marginTop: '10px' }}>
                                SAVE ADDRESS
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddressesTab;