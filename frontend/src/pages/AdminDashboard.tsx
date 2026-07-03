import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminOverviewTab from '../components/AdminOverviewTab';
import AdminOrdersTab from '../components/AdminOrdersTab';
import AdminProductsTab from '../components/AdminProductsTab';
import AdminCustomersTab from '../components/AdminCustomersTab';
import AdminAnalyticsTab from '../components/AdminAnalyticsTab';
import AdminDiscountsTab from '../components/AdminDiscountsTab';
import AdminSettingsTab from '../components/AdminSettingsTab';
import AdminAccountsTab from '../components/AdminAccountsTab';
import SuperAdminAllUsersTab from '../components/SuperAdminAllUsersTab';
import SuperAdminAuditLogTab from '../components/SuperAdminAuditLogTab';
import SuperAdminSystemTab from '../components/SuperAdminSystemTab';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { user, isLoading, logout } = useAuth(true);

    //Bounce regular customers out of the admin panel
    if (!isLoading && user && user.role === 'customer') {
        window.location.href = '/home';
        return null; // Stop rendering the page entirely
    }

    const renderUnauthorized = () => (
        <div className="admin-tab-placeholder" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3 style={{ color: '#d93025' }}>Unauthorized Access</h3>
            <p>You do not have the required permissions to view this section.</p>
        </div>
    );

    // Extract role safely for rendering logic
    const role = user?.role || '';

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <AdminOverviewTab setActiveTab={setActiveTab} />;
            case 'orders': return <AdminOrdersTab />;
            case 'products': return <AdminProductsTab />;
            case 'customers': return <AdminCustomersTab />;
            case 'analytics': return <AdminAnalyticsTab />;
            case 'discounts': return <AdminDiscountsTab />;
            case 'settings': return <AdminSettingsTab />;
            case 'admin-accounts': return <AdminAccountsTab />;
            
            case 'all-users':
                return role === 'superadmin' ? <SuperAdminAllUsersTab /> : renderUnauthorized();
            case 'audit-log':
                return role === 'superadmin' ? <SuperAdminAuditLogTab /> : renderUnauthorized();
            case 'system':
                return role === 'superadmin' ? <SuperAdminSystemTab /> : renderUnauthorized();
            
            default:
                return (
                    <div className="admin-tab-placeholder">
                        <p>Content for {activeTab.toUpperCase()} Admin Tabs</p>
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f5f7' }}>
                <h2 style={{ letterSpacing: '2px', color: '#111' }}>ATELIER...</h2>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                role={role} 
            />
            
            <div className="admin-main-wrapper">
                <AdminHeader 
                    activeTab={activeTab} 
                    user={user} 
                    onLogout={logout} 
                />
                
                <main className="admin-main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;