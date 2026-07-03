import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';
import AdminCustomerModal from './AdminCustomerModal';

const FILTERS = ["ALL", "VIP", "HIGH-VALUE", "LOYAL", "NEW", "REPEAT"];

const AdminCustomersTab = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetchWithCredentials('http://localhost:8000/api/admin/customers');
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    setCustomers(data.data);
                }
            } catch (error) {
                console.error("Failed to load customers", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // Filter and Search Logic
    const filteredCustomers = customers.filter(customer => {
        const matchesFilter = activeFilter === "ALL" || 
            customer.tags.map((t: string) => t.toUpperCase()).includes(activeFilter);
            
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.location.toLowerCase().includes(searchLower);
            
        return matchesFilter && matchesSearch;
    });

    // Dynamic Top Metrics
    const totalActive = customers.filter(c => c.status === "Active").length;
    const totalVIP = customers.filter(c => c.tags.includes("VIP")).length;
    const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : "0";

    const renderStatusBadge = (status: string) => {
        return <span className="admin-badge badge-delivered">{status}</span>;
    };

    return (
        <div className="admin-customers-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Customers</h1>
                    <span className="admin-page-subtitle">{customers.length} registered customers</span>
                </div>
                <button className="admin-action-btn light-btn">
                    EXPORT CSV
                </button>
            </div>

            <div className="admin-metrics-grid">
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">{customers.length}</span>
                    <span className="admin-simple-metric-label">TOTAL CUSTOMERS</span>
                </div>
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">{totalActive}</span>
                    <span className="admin-simple-metric-label">ACTIVE</span>
                </div>
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">{totalVIP}</span>
                    <span className="admin-simple-metric-label">VIP MEMBERS</span>
                </div>
                <div className="admin-simple-metric-card">
                    <span className="admin-simple-metric-value">${avgOrderValue}</span>
                    <span className="admin-simple-metric-label">AVG. ORDER VALUE</span>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-wrapper" style={{ width: '280px' }}>
                    <Search size={16} strokeWidth={1.5} className="admin-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search customers..." 
                        className="admin-search-input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="admin-filters-group">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            className={`admin-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-table-wrapper">
                {isLoading ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>Loading customers...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>CUSTOMER</th>
                                <th>LOCATION</th>
                                <th>ORDERS</th>
                                <th>TOTAL SPENT</th>
                                <th>LAST ORDER</th>
                                <th>TAGS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr 
                                    key={customer.id} 
                                    onClick={() => setSelectedCustomer(customer)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <div className="admin-td-customer">
                                            <div className="admin-customer-avatar">{customer.initials}</div>
                                            <div className="admin-td-stacked">
                                                <span className="admin-td-primary">{customer.name}</span>
                                                <span className="admin-td-secondary">{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="admin-td-standard">{customer.location}</span></td>
                                    <td><span className="admin-td-standard">{customer.orders}</span></td>
                                    <td><span className="admin-td-bold">${customer.spent.toLocaleString()}</span></td>
                                    <td><span className="admin-td-standard">{customer.lastOrder}</span></td>
                                    <td>
                                        <div className="admin-tags-wrapper">
                                            {customer.tags.map((tag: string, index: number) => (
                                                <span key={index} className="admin-customer-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{renderStatusBadge(customer.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedCustomer && (
                <AdminCustomerModal 
                    customer={selectedCustomer} 
                    onClose={() => setSelectedCustomer(null)} 
                />
            )}
        </div>
    );
};

export default AdminCustomersTab;