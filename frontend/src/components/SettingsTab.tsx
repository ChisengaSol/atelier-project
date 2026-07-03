import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const SettingsTab = () => {
    // Grab the dynamic user data from custom hook
    const { user } = useAuth();

    const [preferences, setPreferences] = useState({
        orderUpdates: true,
        atelierLetter: true,
        promotions: false
    });

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for future backend update route
        alert("Profile update functionality will be connected to the database soon!");
    };

    return (
        <div className="settings-tab-container">
            <form onSubmit={handleSaveChanges}>
                <div className="settings-card">
                    <h3 className="settings-section-title">PERSONAL INFORMATION</h3>
                    <div className="settings-form-row">
                        <div className="settings-input-group">
                            <label htmlFor="firstName">FIRST NAME</label>
                            {/* Dynamically insert first name */}
                            <input type="text" id="firstName" defaultValue={user?.first_name || ''} required />
                        </div>
                        <div className="settings-input-group">
                            <label htmlFor="lastName">LAST NAME</label>
                            {/* Dynamically insert last name */}
                            <input type="text" id="lastName" defaultValue={user?.last_name || ''} required />
                        </div>
                    </div>
                    <div className="settings-form-row">
                        <div className="settings-input-group">
                            <label htmlFor="email">EMAIL</label>
                            {/* Dynamically insert email and make it read-only so they can't accidentally break their login */}
                            <input type="email" id="email" defaultValue={user?.email || ''} readOnly style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                        </div>
                        <div className="settings-input-group">
                            <label htmlFor="phone">PHONE</label>
                            {/* We leave phone blank for now since it's not in your DB schema yet */}
                            <input type="tel" id="phone" placeholder="Add phone number" />
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <h3 className="settings-section-title">EMAIL PREFERENCES</h3>
                    
                    <div className="preference-row">
                        <span className="preference-label">ORDER UPDATES & SHIPPING NOTIFICATIONS</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={preferences.orderUpdates} 
                                onChange={() => handleToggle('orderUpdates')} 
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div className="preference-row">
                        <span className="preference-label">ATELIER LETTER — EDITORIAL CONTENT & LOOKBOOKS</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={preferences.atelierLetter} 
                                onChange={() => handleToggle('atelierLetter')} 
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="preference-row">
                        <span className="preference-label">PROMOTIONS, SALES, AND EXCLUSIVE OFFERS</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={preferences.promotions} 
                                onChange={() => handleToggle('promotions')} 
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-card">
                    <h3 className="settings-section-title">PASSWORD</h3>
                    <div className="settings-input-group">
                        <label htmlFor="currentPassword">CURRENT PASSWORD</label>
                        <input type="password" id="currentPassword" placeholder="••••••••" />
                    </div>
                    <div className="settings-input-group">
                        <label htmlFor="newPassword">NEW PASSWORD</label>
                        <input type="password" id="newPassword" placeholder="Leave blank to keep current" />
                    </div>
                    <div className="settings-input-group">
                        <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                        <input type="password" id="confirmPassword" placeholder="Leave blank to keep current" />
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="save-changes-btn">SAVE CHANGES</button>
                </div>
            </form>
        </div>
    );
};

export default SettingsTab;