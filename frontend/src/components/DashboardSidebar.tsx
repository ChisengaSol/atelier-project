import { Package, MapPin, CreditCard, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    orderCount?: number; 
}

const DashboardSidebar = ({ activeTab, setActiveTab, onLogout, orderCount = 0 }: SidebarProps) => {
    const navItems = [
        { id: 'orders', label: 'ORDERS', icon: Package, badge: orderCount > 0 ? orderCount : undefined },
        { id: 'addresses', label: 'ADDRESSES', icon: MapPin },
        { id: 'payments', label: 'PAYMENT METHODS', icon: CreditCard },
        { id: 'wishlist', label: 'WISHLIST', icon: Heart },
        { id: 'settings', label: 'ACCOUNT SETTINGS', icon: Settings },
    ];

    return (
        <aside className="dashboard-sidebar">
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
                        onClick={() => setActiveTab(item.id)}
                    >
                        <div className="nav-item-left">
                            <item.icon size={18} strokeWidth={1.5} />
                            <span>{item.label}</span>
                        </div>
                        <div className="nav-item-right">
                            {item.badge && <span className="notification-badge">{item.badge}</span>}
                            <ChevronRight size={16} strokeWidth={1.5} />
                        </div>
                    </button>
                ))}
            </nav>
            
            <div className="sidebar-footer">
                <button className="sign-out-btn" onClick={onLogout}>
                    <LogOut size={16} strokeWidth={1.5} />
                    SIGN OUT
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;