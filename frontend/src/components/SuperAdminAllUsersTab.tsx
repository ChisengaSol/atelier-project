import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';

const SuperAdminAllUsersTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pull data, loading, and error states from custom hook
    const { users, isLoading, error } = useUsers();

    const renderStatusBadge = (status: string) => {
        if (status === 'Active') {
            return <span className="admin-badge badge-active">{status}</span>;
        }
        return <span className="admin-badge badge-inactive">{status}</span>;
    };

    // Handle Loading State
    if (isLoading) {
        return (
            <div className="super-admin-users-container">
                <div className="admin-page-header">
                    <span className="admin-page-subtitle">Loading users from database...</span>
                </div>
            </div>
        );
    }

    // Handle Error State
    if (error) {
        return (
            <div className="super-admin-users-container">
                <div className="admin-page-header">
                    <span className="admin-page-subtitle" style={{ color: '#d93025' }}>
                        Error loading users: {error}
                    </span>
                </div>
            </div>
        );
    }

    // Apply the search filter to the real data
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || email.includes(search);
    });

    return (
        <div className="super-admin-users-container">
            <div className="admin-page-header" style={{ marginBottom: '10px' }}>
                <div>
                    <span className="admin-page-subtitle" style={{ fontSize: '1.1rem', color: '#888888' }}>
                        {users.length} registered customers
                    </span>
                </div>
            </div>

            <div className="admin-toolbar" style={{ marginBottom: '20px' }}>
                <div className="admin-search-wrapper" style={{ width: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        className="admin-search-input"
                        style={{ paddingLeft: '15px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>USER</th>
                            <th>JOIN DATE</th>
                            <th>ORDERS</th>
                            <th>TOTAL SPENT</th>
                            <th>COUNTRY</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            const fullName = `${user.first_name} ${user.last_name}`;
                            const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div className="admin-td-customer">
                                            <div className="admin-customer-avatar">{initials}</div>
                                            <div className="admin-td-stacked">
                                                <span className="admin-td-primary">{fullName}</span>
                                                <span className="admin-td-secondary">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {/* These fields will need to be added to the Python API query later */}
                                    <td><span className="admin-td-standard">—</span></td>
                                    <td><span className="admin-td-standard">—</span></td>
                                    <td><span className="admin-td-bold">—</span></td>
                                    <td><span className="admin-td-standard">—</span></td>
                                    
                                    <td>{renderStatusBadge(user.status)}</td>
                                    <td>
                                        <button className="admin-text-action-link">VIEW</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    No users found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdminAllUsersTab;