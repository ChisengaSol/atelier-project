import { useState, useEffect } from 'react';
import { Edit2, UserX, UserCheck, Shield, Lock, Check } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

const AdminAccountsTab = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchAdmins = async () => {
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/accounts');
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                setAdmins(json.data);
            }
        } catch (error) {
            console.error("Failed to load admins:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const res = await fetchWithCredentials(`http://localhost:8000/api/admin/accounts/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchAdmins();
            else alert("Failed to update status. You cannot suspend your own account.");
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'badge-active';
            case 'Suspended': return 'badge-suspended';
            case 'Inactive': return 'badge-inactive';
            default: return '';
        }
    };

    const activeCount = admins.filter(a => a.status === 'Active').length;

    if (isLoading) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#666' }}>Loading admin accounts...</div>;
    }

    return (
        <div className="admin-accounts-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Admin Accounts</h1>
                    <span className="admin-page-subtitle">{activeCount} active admins · Super Admin only</span>
                </div>
                <button className="admin-action-btn gold-btn" onClick={() => setShowModal(true)}>
                    + CREATE ADMIN
                </button>
            </div>

            <div className="admin-accounts-grid">
                {admins.map(admin => (
                    <div key={admin.id} className="admin-account-card">
                        <div className="account-card-header">
                            <div className="admin-td-customer">
                                <div className="admin-customer-avatar">{admin.initials}</div>
                                <div className="admin-td-stacked">
                                    <span className="admin-td-primary">{admin.name}</span>
                                    <span className="admin-td-secondary">{admin.email}</span>
                                </div>
                            </div>
                            <span className={`admin-badge ${getStatusClass(admin.status)}`}>
                                {admin.status}
                            </span>
                        </div>

                        <div className="account-details-grid">
                            <span className="detail-label">Department</span>
                            <span className="detail-value">{admin.department}</span>
                            
                            <span className="detail-label">Created</span>
                            <span className="detail-value">{admin.created}</span>
                            
                            <span className="detail-label">Last Login</span>
                            <span className="detail-value">{admin.lastLogin}</span>
                        </div>

                        <div className="account-permissions">
                            {admin.permissions.map((perm: string) => (
                                <span key={perm} className="permission-tag">{perm}</span>
                            ))}
                            {admin.permissions.length === 0 && <span className="detail-label">No explicit permissions</span>}
                        </div>

                        <div className="account-actions">
                            <button className="account-btn edit-btn">
                                <Edit2 size={14} /> EDIT
                            </button>
                            <button 
                                className={`account-btn ${admin.status === 'Active' ? 'suspend-btn' : 'activate-btn'}`}
                                onClick={() => toggleStatus(admin.id, admin.status)}
                            >
                                {admin.status === 'Active' ? (
                                    <><UserX size={14} /> SUSPEND</>
                                ) : (
                                    <><UserCheck size={14} /> ACTIVATE</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && <CreateAdminModal onClose={() => setShowModal(false)} onRefresh={fetchAdmins} />}
        </div>
    );
};

const CreateAdminModal = ({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) => {
    const permissionsList = ["Products", "Orders", "Customers", "Analytics", "Discounts", "Settings"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        department: 'Operations',
        email: ''
    });
    
    const [selectedPerms, setSelectedPerms] = useState<string[]>(['Products', 'Orders']);

    const togglePermission = (perm: string) => {
        setSelectedPerms(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleCreate = async () => {
        if (!formData.fullName || !formData.email) {
            alert("Please provide a name and email.");
            return;
        }

        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        setIsSubmitting(true);
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: formData.email,
                    department: formData.department,
                    permissions: selectedPerms.join(',')
                })
            });

            if (res.ok) {
                onRefresh();
                onClose();
            } else {
                const errorData = await res.json();
                alert(errorData.detail || "Failed to create admin");
            }
        } catch (error) {
            console.error("Error creating admin:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3 className="modal-title-with-icon">
                        <Shield size={20} className="gold-icon" /> Create Admin Account
                    </h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="admin-modal-body">
                    <div className="admin-settings-form-row">
                        <div className="admin-input-group">
                            <label>FULL NAME</label>
                            <input 
                                type="text" 
                                placeholder="Jane Smith" 
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>
                        <div className="admin-input-group">
                            <label>DEPARTMENT</label>
                            <select 
                                value={formData.department}
                                onChange={e => setFormData({...formData, department: e.target.value})}
                            >
                                <option value="Operations">Operations</option>
                                <option value="Merchandising">Merchandising</option>
                                <option value="Customer Service">Customer Service</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-input-group">
                        <label>EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            placeholder="admin@atelier.com" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="admin-input-group">
                        <label>ACCESS PERMISSIONS</label>
                        <div className="permissions-checkbox-grid">
                            {permissionsList.map(perm => (
                                <label key={perm} className="permission-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedPerms.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                    />
                                    <span>{perm}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="admin-warning-box">
                        <Lock size={16} />
                        <p>A temporary password will be emailed to the new admin. They must reset it on first login.</p>
                    </div>

                    <button 
                        className="admin-modal-submit" 
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        <Check size={16} strokeWidth={3} /> {isSubmitting ? 'CREATING...' : 'CREATE ADMIN ACCOUNT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAccountsTab;