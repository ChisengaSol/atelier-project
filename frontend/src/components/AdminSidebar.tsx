import { LayoutGrid, ShoppingBag, Package, Users, BarChart2, Tag, Settings, LogOut, Shield, UserPlus, FileText, Server } from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role: string; 
    orderCount?: number; 
}

const AdminSidebar = ({ activeTab, setActiveTab, role, orderCount = 0 }: AdminSidebarProps) => {
    const storeItems = [
        { id: 'overview', label: 'OVERVIEW', icon: LayoutGrid },
        { id: 'orders', label: 'ORDERS', icon: ShoppingBag, badge: orderCount > 0 ? orderCount : undefined },
        { id: 'products', label: 'PRODUCTS', icon: Package },
        { id: 'customers', label: 'CUSTOMERS', icon: Users },
        { id: 'analytics', label: 'ANALYTICS', icon: BarChart2 },
        { id: 'discounts', label: 'DISCOUNTS', icon: Tag },
    ];

    const superAdminItems = [
        { id: 'admin-accounts', label: 'ADMIN ACCOUNTS', icon: Shield },
        { id: 'all-users', label: 'ALL USERS', icon: UserPlus },
        { id: 'audit-log', label: 'AUDIT LOG', icon: FileText },
        { id: 'system', label: 'SYSTEM', icon: Server },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>ATELIER</h2>
                <span>{role === 'superadmin' ? 'Super Admin Console' : 'Admin Console'}</span>
            </div>

            <div className="admin-sidebar-section">
                <span className="admin-sidebar-subtitle">STORE</span>
                <nav className="admin-sidebar-nav">
                    {storeItems.map(item => (
                        <button 
                            key={item.id} 
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(item.id)}
                        >
                            <div className="admin-nav-item-left">
                                <item.icon size={18} strokeWidth={1.5} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            {role === 'superadmin' && (
                <div className="admin-sidebar-section">
                    <span className="admin-sidebar-subtitle">SUPER ADMIN</span>
                    <nav className="admin-sidebar-nav">
                        {superAdminItems.map(item => (
                            <button 
                                key={item.id} 
                                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} 
                                onClick={() => setActiveTab(item.id)}
                            >
                                <div className="admin-nav-item-left">
                                    <item.icon size={18} strokeWidth={1.5} />
                                    <span>{item.label}</span>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            <div className="admin-sidebar-section">
                <span className="admin-sidebar-subtitle">ACCOUNT</span>
                <nav className="admin-sidebar-nav">
                    <button 
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('settings')}
                    >
                        <div className="admin-nav-item-left">
                            <Settings size={18} strokeWidth={1.5} />
                            <span>SETTINGS</span>
                        </div>
                    </button>
                </nav>
            </div>

            <div className="admin-sidebar-footer">
                <div className="admin-user-profile-mini">
                    <div className="admin-avatar-mini">
                        {role === 'superadmin' ? 'SA' : 'AD'}
                    </div>
                    <div className="admin-user-details-mini">
                        <span className="admin-user-name-mini">
                            {role === 'superadmin' ? 'Super Admin' : 'Staff Admin'}
                        </span>
                        <span className="admin-user-email-mini">
                            {role === 'superadmin' ? 'System Owner' : 'Store Management'}
                        </span>
                    </div>
                </div>
                <button className="admin-exit-btn" onClick={() => window.location.href = '/home'}>
                    <LogOut size={16} strokeWidth={1.5} />
                    EXIT TO STORE
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;