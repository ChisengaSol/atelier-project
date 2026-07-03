import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

const AdminSettingsTab = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [profile, setProfile] = useState({ name: '', email: '', dept: '', lastLogin: '', role: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        registrations: true,
        lowStock: true,
        performance: true,
        security: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/admin/settings');
                const json = await res.json();
                if (res.ok && json.status === 'success') {
                    setProfile(json.profile);
                    setNotifications(json.notifications);
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        if (passwords.new && passwords.new !== passwords.confirm) {
            alert("New passwords do not match!");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                full_name: profile.name,
                email: profile.email,
                department: profile.dept,
                current_password: passwords.current || null,
                new_password: passwords.new || null,
                notifications: notifications
            };

            const res = await fetchWithCredentials('http://localhost:8000/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Settings saved successfully!");
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading settings...</div>;
    }

    // Get initials safely
    const getInitials = (name: string) => {
        if (!name) return 'AD';
        const parts = name.trim().split(' ');
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
    };

    return (
        <div className="admin-settings-container">
            <h1 className="admin-page-title" style={{ marginBottom: '25px' }}>Settings</h1>

            <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">PROFILE INFORMATION</h3>
                <div className="admin-profile-header">
                    <div className="admin-avatar-large">{getInitials(profile.name)}</div>
                    <div className="admin-profile-info">
                        <h3>{profile.name || 'Admin'}</h3>
                        <span>{profile.role} · {profile.dept}</span>
                        <p>Last login: {profile.lastLogin}</p>
                    </div>
                </div>
                <div className="admin-settings-form-row">
                    <div className="admin-input-group">
                        <label>FULL NAME</label>
                        <input 
                            type="text" 
                            value={profile.name} 
                            onChange={e => setProfile({...profile, name: e.target.value})} 
                        />
                    </div>
                    <div className="admin-input-group">
                        <label>EMAIL</label>
                        <input 
                            type="email" 
                            value={profile.email} 
                            onChange={e => setProfile({...profile, email: e.target.value})} 
                        />
                    </div>
                </div>
                <div className="admin-input-group">
                    <label>DEPARTMENT</label>
                    <input 
                        type="text" 
                        value={profile.dept} 
                        onChange={e => setProfile({...profile, dept: e.target.value})} 
                    />
                </div>
            </div>

            <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">CHANGE PASSWORD</h3>
                <div className="admin-input-group">
                    <label>CURRENT PASSWORD</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwords.current}
                        onChange={e => setPasswords({...passwords, current: e.target.value})}
                    />
                </div>
                <div className="admin-input-group">
                    <label>NEW PASSWORD</label>
                    <div className="password-input-wrapper">
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={passwords.new}
                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                        />
                        <Eye size={16} className="password-eye-icon" />
                    </div>
                </div>
                <div className="admin-input-group">
                    <label>CONFIRM NEW PASSWORD</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                </div>
            </div>

            <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">NOTIFICATION PREFERENCES</h3>
                {Object.entries(notifications).map(([key, value]) => (
                    <div className="admin-preference-row" key={key}>
                        <span className="admin-preference-label">
                            {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </span>
                        <div className="admin-toggle-group">
                            <span className="admin-toggle-text">{value ? 'ON' : 'OFF'}</span>
                            <label className="admin-toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={value} 
                                    onChange={() => toggleNotification(key as keyof typeof notifications)} 
                                />
                                <span className="admin-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-settings-actions">
                <button 
                    className="admin-action-btn dark-btn" 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettingsTab;