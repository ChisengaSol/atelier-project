import { useState, useEffect } from 'react';
import { Search, Download, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { fetchWithCredentials } from '../utils/api';

const FILTERS = ["All", "Info", "Warning", "Critical"];

const SuperAdminAuditLogTab = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchLogs = async () => {
        try {
            const res = await fetchWithCredentials('http://localhost:8000/api/admin/audit-logs');
            const json = await res.json();
            if (res.ok) setLogs(json.data);
        } catch (error) {
            console.error("Error loading logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = activeFilter === "All" || log.severity.toLowerCase() === activeFilter.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            log.action.toLowerCase().includes(searchLower) || 
            log.actorName.toLowerCase().includes(searchLower) ||
            log.target?.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    const renderSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'info': return <Info size={16} className="severity-icon severity-info" />;
            case 'warning': return <AlertTriangle size={16} className="severity-icon severity-warning" />;
            case 'critical': return <AlertCircle size={16} className="severity-icon severity-critical" />;
            default: return null;
        }
    };

    return (
        <div className="admin-audit-container">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Audit Log</h1>
                    <span className="admin-page-subtitle">Complete record of all privileged actions</span>
                </div>
                <button className="admin-action-btn light-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={14} strokeWidth={2} /> EXPORT
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-wrapper" style={{ width: '350px' }}>
                    <Search size={16} strokeWidth={1.5} className="admin-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search actions, actors, targets..." 
                        className="admin-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="audit-filters-group">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            className={`audit-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-table-wrapper">
                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading logs...</div>
                ) : (
                    <table className="admin-table audit-table">
                        <thead>
                            <tr>
                                <th>SEVERITY</th>
                                <th>ACTOR</th>
                                <th>ACTION</th>
                                <th>TARGET</th>
                                <th>TIMESTAMP</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className={log.severity === 'critical' ? 'row-critical' : ''}>
                                    <td>
                                        <div className="audit-severity-cell">
                                            {renderSeverityIcon(log.severity)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-td-stacked">
                                            <span className="admin-td-primary">{log.actorName}</span>
                                            <span className="admin-td-secondary">{log.actorRole}</span>
                                        </div>
                                    </td>
                                    <td><span className="admin-td-standard" style={{ color: '#000' }}>{log.action}</span></td>
                                    <td><span className="admin-td-standard">{log.target}</span></td>
                                    <td><span className="admin-td-standard">{log.timestamp}</span></td>
                                    <td><span className="admin-td-standard">{log.ip}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SuperAdminAuditLogTab;