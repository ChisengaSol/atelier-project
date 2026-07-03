import { useState, useRef } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

// Define the shape of the user data we expect
export interface AdminUser {
    first_name: string;
    last_name: string;
    role: string;
}

interface AdminHeaderProps {
    activeTab: string;
    user?: AdminUser | null;
    onLogout?: () => void;
}

const AdminHeader = ({ activeTab, user, onLogout }: AdminHeaderProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    // Dynamically calculate initials and names
    const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : '...';
    const firstName = user ? user.first_name : 'Loading';
    const displayRole = user ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Admin';

    return (
        <header className="admin-header">
            <div className="admin-breadcrumbs">
                <span>Console</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>

            <div className="admin-header-actions">
                <button className="admin-notification-btn">
                    <Bell size={20} strokeWidth={1.5} />
                    <span className="admin-notification-dot"></span>
                </button>
                
                {/* Profile Section with Dropdown Toggle */}
                <div 
                    className="admin-header-profile" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    ref={dropdownRef}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="admin-avatar-small">{initials}</div>
                    <div className="admin-header-profile-text">
                        <span className="admin-header-name">{firstName}</span>
                        <span className="admin-header-role">{displayRole}</span>
                    </div>
                    <ChevronDown 
                        size={14} 
                        strokeWidth={1.5} 
                        color="#888888" 
                        style={{ 
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s ease'
                        }} 
                    />

                    {/* The Logout Dropdown */}
                    {isDropdownOpen && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: 0, 
                            marginTop: '10px', 
                            backgroundColor: '#fff', 
                            border: '1px solid #eee', 
                            borderRadius: '6px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                            zIndex: 100, 
                            minWidth: '160px', 
                            overflow: 'hidden' 
                        }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    if(onLogout) onLogout();
                                }}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    border: 'none', 
                                    background: 'none', 
                                    cursor: 'pointer', 
                                    fontSize: '13px', 
                                    color: '#d93025', 
                                    textAlign: 'left',
                                    fontFamily: 'inherit'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fce8e6'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={16} strokeWidth={1.5} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;