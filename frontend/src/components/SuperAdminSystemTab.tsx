import { useState } from 'react';
import { Server, Database, Globe, Shield, RefreshCw, Bell, ShieldAlert } from 'lucide-react';

const SuperAdminSystemTab = () => {
    const [config, setConfig] = useState({
        maintenanceMode: false,
        newRegistrations: true,
        guestCheckout: true,
        analyticsTracking: true,
        require2fa: false,
        ipRateLimiting: true,
        auditLogging: true,
        adminEmails: true,
        orderEmails: true,
        lowStockAlerts: true,
    });

    const toggleConfig = (key: keyof typeof config) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderToggle = (label: string, description: string, key: keyof typeof config) => (
        <div className="system-config-row">
            <div className="system-config-text">
                <strong>{label}</strong>
                <span>{description}</span>
            </div>
            <label className="admin-toggle-switch system-toggle">
                <input 
                    type="checkbox" 
                    checked={config[key]} 
                    onChange={() => toggleConfig(key)} 
                />
                <span className="admin-toggle-slider"></span>
            </label>
        </div>
    );

    const renderDangerAction = (label: string, description: string) => (
        <div className="system-config-row">
            <div className="system-config-text">
                <strong>{label}</strong>
                <span>{description}</span>
            </div>
            <button className="danger-run-btn">RUN</button>
        </div>
    );

    return (
        <div className="super-admin-system-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">System Settings</h1>
                    <span className="admin-page-subtitle">Global platform configuration · Super Admin only</span>
                </div>
            </div>

            <div className="admin-settings-card system-health-card">
                <h3 className="admin-settings-section-title">SYSTEM HEALTH</h3>
                <div className="system-health-grid">
                    <div className="health-item operational">
                        <Server size={18} />
                        <div className="health-item-text">
                            <strong>API Server</strong>
                            <span>Operational</span>
                        </div>
                    </div>
                    <div className="health-item operational">
                        <Database size={18} />
                        <div className="health-item-text">
                            <strong>Database</strong>
                            <span>Operational</span>
                        </div>
                    </div>
                    <div className="health-item operational">
                        <Globe size={18} />
                        <div className="health-item-text">
                            <strong>CDN</strong>
                            <span>Operational</span>
                        </div>
                    </div>
                    <div className="health-item operational">
                        <Shield size={18} />
                        <div className="health-item-text">
                            <strong>Security</strong>
                            <span>All Clear</span>
                        </div>
                    </div>
                </div>
                <div className="system-health-footer">
                    <span>Last checked: 2026-06-20 09:15 UTC</span>
                    <button className="health-refresh-btn">
                        <RefreshCw size={14} /> REFRESH STATUS
                    </button>
                </div>
            </div>

            <div className="system-config-grid">
                <div className="admin-settings-card">
                    <h3 className="system-section-header">
                        <Globe size={18} /> STORE
                    </h3>
                    <div className="system-config-list">
                        {renderToggle("Maintenance Mode", "Temporarily take the storefront offline for maintenance", "maintenanceMode")}
                        {renderToggle("New Registrations", "Allow new customers to create accounts", "newRegistrations")}
                        {renderToggle("Guest Checkout", "Allow checkout without creating an account", "guestCheckout")}
                        {renderToggle("Analytics Tracking", "Collect anonymized usage analytics", "analyticsTracking")}
                    </div>
                </div>

                <div className="admin-settings-card">
                    <h3 className="system-section-header">
                        <Shield size={18} /> SECURITY
                    </h3>
                    <div className="system-config-list">
                        {renderToggle("2FA Required for Admins", "Require two-factor authentication for all admin logins", "require2fa")}
                        {renderToggle("IP Rate Limiting", "Limit login attempts per IP address", "ipRateLimiting")}
                        {renderToggle("Audit Logging", "Record all privileged actions in the audit log", "auditLogging")}
                    </div>
                </div>

                <div className="admin-settings-card">
                    <h3 className="system-section-header">
                        <Bell size={18} /> NOTIFICATIONS
                    </h3>
                    <div className="system-config-list">
                        {renderToggle("Admin Email Notifications", "Send alerts to admin email on critical events", "adminEmails")}
                        {renderToggle("Order Confirmation Emails", "Automatically send order confirmations to customers", "orderEmails")}
                        {renderToggle("Low Stock Alerts", "Notify admins when products drop below 10 units", "lowStockAlerts")}
                    </div>
                </div>

                <div className="admin-settings-card danger-zone-card">
                    <h3 className="system-section-header danger-header">
                        <ShieldAlert size={18} /> DANGER ZONE
                    </h3>
                    <div className="system-config-list">
                        {renderDangerAction("Clear All Sessions", "Force all admins to log in again")}
                        {renderDangerAction("Reset Audit Log", "Permanently delete all audit entries")}
                        {renderDangerAction("Flush Cache", "Clear all server-side caches")}
                    </div>
                </div>
            </div>

            <div className="admin-settings-actions">
                <button className="admin-action-btn dark-btn">SAVE CHANGES</button>
            </div>
        </div>
    );
};

export default SuperAdminSystemTab;