import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DashboardSidebar from '../components/DashboardSidebar';
import OrdersTab from '../components/OrdersTab';
import PaymentsTab from '../components/PaymentsTab';
import AddressesTab from '../components/AddressesTab';
import SettingsTab from '../components/SettingsTab';
import Wishlist from './Wishlist';
import { useAuth } from '../hooks/useAuth';
import { fetchWithCredentials } from '../utils/api';
import '../styles/customer-dashboard.css';

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orderStats, setOrderStats] = useState({ count: 0, total: 0 });
    
    // auth
    const { user, isLoading, logout } = useAuth(true);

    // Fetch order stats dynamically
    useEffect(() => {
        const fetchOrderStats = async () => {
            if (!user) return;
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/users/me/orders');
                const data = await res.json();
                
                if (res.ok && data.status === 'success') {
                    const orders = data.data;
                    const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0);
                    
                    setOrderStats({
                        count: orders.length,
                        total: totalSpent
                    });
                }
            } catch (error) {
                console.error("Failed to fetch order stats:", error);
            }
        };

        fetchOrderStats();
    }, [user]);

    const renderContent = () => {
        switch (activeTab) {
            case 'orders': return <OrdersTab />;
            case 'payments': return <PaymentsTab />;
            case 'addresses': return <AddressesTab />;
            case 'settings': return <SettingsTab />;
            case 'wishlist': return <Wishlist />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <Navbar />
                <div style={{ padding: '100px', textAlign: 'center' }}>Loading profile...</div>
            </div>
        );
    }

    // Dynamically generate initials and full name
    const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : '';
    const fullName = user ? `${user.first_name} ${user.last_name}` : '';

    return (
        <div className="dashboard-page">
            <Navbar />
            
            <main className="dashboard-container">
                <div className="profile-header">
                    <div className="profile-info-section">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-details">
                            <h1 className="profile-name">{fullName}</h1>
                            <p className="profile-meta">{user?.email} · Member</p>
                            <p className="profile-join-date">Member since {user?.created_at}</p>
                        </div>
                    </div>
                    <div className="profile-stats-section">
                        <div className="stat-block">
                            <span className="stat-value">{orderStats.count}</span>
                            <span className="stat-label">ORDERS</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-value">${orderStats.total.toFixed(2)}</span>
                            <span className="stat-label">TOTAL SPENT</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-value">0</span>
                            <span className="stat-label">SAVED ITEMS</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-layout">
                    <DashboardSidebar 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        onLogout={logout}
                        orderCount={orderStats.count}
                    />
                    
                    <section className="dashboard-content">
                        {renderContent()}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;