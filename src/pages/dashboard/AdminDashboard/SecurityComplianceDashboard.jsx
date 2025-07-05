import React, { useState } from 'react';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Gavel as ComplianceIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as ResolveIcon,
  ArrowForward as DetailsIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './SecurityComplianceDashboard.css';

const SecurityComplianceDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');

  const failedLogins = [
    { id: 1, ip: '192.168.1.45', username: 'admin', timestamp: '2023-06-15 14:32:45', attempts: 5, status: 'active' },
    { id: 2, ip: '203.113.117.89', username: 'user123', timestamp: '2023-06-15 11:15:22', attempts: 3, status: 'blocked' },
    { id: 3, ip: '45.67.89.123', username: 'test_account', timestamp: '2023-06-14 09:45:10', attempts: 10, status: 'active' },
    { id: 4, ip: '118.92.156.72', username: 'admin', timestamp: '2023-06-13 22:18:37', attempts: 7, status: 'blocked' },
    { id: 5, ip: '91.204.33.156', username: 'service_account', timestamp: '2023-06-13 18:05:14', attempts: 4, status: 'active' }
  ];

  const blockedIPs = [
    { id: 1, ip: '203.113.117.89', reason: 'Repeated failed login attempts', timestamp: '2023-06-15 11:20:00', action: 'Auto-blocked' },
    { id: 2, ip: '45.67.89.123', reason: 'Known malicious IP', timestamp: '2023-06-14 10:00:00', action: 'Manual block' },
    { id: 3, ip: '118.92.156.72', reason: 'Brute force attack detected', timestamp: '2023-06-13 22:20:00', action: 'Auto-blocked' },
    { id: 4, ip: '185.143.223.67', reason: 'Suspected bot activity', timestamp: '2023-06-12 15:45:00', action: 'Manual block' }
  ];

  const auditLogs = [
    { id: 1, admin: 'superadmin@example.com', action: 'Modified user permissions', target: 'user@example.com', timestamp: '2023-06-15 16:20:12' },
    { id: 2, admin: 'admin@example.com', action: 'Approved listing', target: 'Listing #4587', timestamp: '2023-06-15 14:05:33' },
    { id: 3, admin: 'superadmin@example.com', action: 'Reset password', target: 'manager@example.com', timestamp: '2023-06-15 10:12:45' },
    { id: 4, admin: 'admin@example.com', action: 'Deleted comment', target: 'Comment #8912', timestamp: '2023-06-14 18:30:21' }
  ];

  const vulnerabilityAlerts = [
    { id: 1, severity: 'high', title: 'Outdated library detected', component: 'Payment processor', detected: '2023-06-15 09:15:00', status: 'pending' },
    { id: 2, severity: 'medium', title: 'Missing CORS headers', component: 'API Gateway', detected: '2023-06-14 14:30:00', status: 'in-progress' },
    { id: 3, severity: 'low', title: 'Deprecated function usage', component: 'User service', detected: '2023-06-13 11:45:00', status: 'resolved' }
  ];

  const complianceReports = [
    { id: 1, type: 'GDPR', status: 'compliant', lastAudit: '2023-05-30', nextAudit: '2023-11-30' },
    { id: 2, type: 'CCPA', status: 'compliant', lastAudit: '2023-04-15', nextAudit: '2023-10-15' },
    { id: 3, type: 'PCI DSS', status: 'pending-review', lastAudit: '2023-03-20', nextAudit: '2023-09-20' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const handleResolveAlert = (id) => {
    console.log(`Resolving alert ${id}`);
  };

  const handleBlockIP = (ip) => {
    console.log(`Blocking IP ${ip}`);
  };

  const severityColor = (severity) => {
    switch (severity) {
      case 'high': return '#991b1b';
      case 'medium': return '#d97706';
      case 'low': return '#065f46';
      default: return '#6251a4';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'active': return 'warning';
      case 'blocked': return 'error';
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'compliant': return 'success';
      case 'pending-review': return 'warning';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="scd-container">
        <div className="scd-header">
          <div className="scd-header-title">
            <SecurityIcon className="scd-icon" />
            <h1>Security & Compliance</h1>
          </div>
          <button className="scd-btn scd-btn-refresh">
            <RefreshIcon />
            Refresh Data
          </button>
        </div>

        <div className="scd-top-cards">
          <div className="scd-card">
            <h5>Failed Logins (24h)</h5>
            <div className="scd-card-content">
              <WarningIcon className="scd-icon-large" />
              <h3>12</h3>
            </div>
          </div>
          <div className="scd-card">
            <h5>Blocked IPs</h5>
            <div className="scd-card-content">
              <LockIcon className="scd-icon-large" />
              <h3>8</h3>
            </div>
          </div>
          <div className="scd-card">
            <h5>Active Alerts</h5>
            <div className="scd-card-content">
              <WarningIcon className="scd-icon-large" />
              <h3>3</h3>
            </div>
          </div>
          <div className="scd-card">
            <h5>Audit Events (7d)</h5>
            <div className="scd-card-content">
              <VisibilityIcon className="scd-icon-large" />
              <h3>42</h3>
            </div>
          </div>
          <div className="scd-card">
            <h5>Compliance Status</h5>
            <div className="scd-card-content">
              <ComplianceIcon className="scd-icon-large" />
              <h3>2/3</h3>
            </div>
          </div>
          <div className="scd-card">
            <h5>Data Requests (30d)</h5>
            <div className="scd-card-content">
              <HistoryIcon className="scd-icon-large" />
              <h3>5</h3>
            </div>
          </div>
        </div>

        <div className="scd-main-content">
          <div className="scd-tabs">
            <button className={`scd-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => handleTabChange(null, 0)}>
              <WarningIcon />
              Failed Logins
            </button>
            <button className={`scd-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => handleTabChange(null, 1)}>
              <BlockIcon />
              Blocked IPs
            </button>
            <button className={`scd-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => handleTabChange(null, 2)}>
              <VisibilityIcon />
              Audit Logs
            </button>
            <button className={`scd-tab ${tabValue === 3 ? 'active' : ''}`} onClick={() => handleTabChange(null, 3)}>
              <SecurityIcon />
              Vulnerability Alerts
            </button>
            <button className={`scd-tab ${tabValue === 4 ? 'active' : ''}`} onClick={() => handleTabChange(null, 4)}>
              <ComplianceIcon />
              Compliance Reports
            </button>
          </div>

          <div className="scd-filter-bar">
            <div className="scd-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="scd-date-picker">
              <CalendarIcon />
              <DatePicker
                label="From"
                value={dateRange[0]}
                onChange={(newValue) => handleDateChange(newValue, 0)}
                renderInput={(params) => <input {...params} />}
              />
              <span>-</span>
              <DatePicker
                label="To"
                value={dateRange[1]}
                onChange={(newValue) => handleDateChange(newValue, 1)}
                renderInput={(params) => <input {...params} />}
              />
            </div>
            <button className="scd-btn scd-btn-filter">
              <FilterIcon />
              Filters
            </button>
          </div>

          <div className="scd-table-container">
            {tabValue === 0 && (
              <table className="scd-table">
                <thead>
                  <tr>
                    <th><span>Timestamp</span></th>
                    <th><span>IP Address</span></th>
                    <th><span>Username</span></th>
                    <th><span>Attempts</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {failedLogins.map((row) => (
                    <tr key={row.id}>
                      <td>{row.timestamp}</td>
                      <td>{row.ip}</td>
                      <td>{row.username}</td>
                      <td>{row.attempts}</td>
                      <td>
                        <span className={`scd-status ${statusColor(row.status)}`}>{row.status}</span>
                      </td>
                      <td>
                        <div className="scd-action-btns">
                          <button className="scd-btn scd-btn-block" onClick={() => handleBlockIP(row.ip)} title="Block IP">
                            <BlockIcon />
                          </button>
                          <button className="scd-btn scd-btn-details" title="View details">
                            <DetailsIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 1 && (
              <table className="scd-table">
                <thead>
                  <tr>
                    <th><span>IP Address</span></th>
                    <th><span>Reason</span></th>
                    <th><span>Blocked At</span></th>
                    <th><span>Action</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIPs.map((row) => (
                    <tr key={row.id}>
                      <td>{row.ip}</td>
                      <td>{row.reason}</td>
                      <td>{row.timestamp}</td>
                      <td>{row.action}</td>
                      <td>
                        <div className="scd-action-btns">
                          <button className="scd-btn scd-btn-resolve" title="Unblock">
                            <ResolveIcon />
                          </button>
                          <button className="scd-btn scd-btn-details" title="View details">
                            <DetailsIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 2 && (
              <table className="scd-table">
                <thead>
                  <tr>
                    <th><span>Admin</span></th>
                    <th><span>Action</span></th>
                    <th><span>Target</span></th>
                    <th><span>Timestamp</span></th>
                    <th><span>Details</span></th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((row) => (
                    <tr key={row.id}>
                      <td>{row.admin}</td>
                      <td>{row.action}</td>
                      <td>{row.target}</td>
                      <td>{row.timestamp}</td>
                      <td>
                        <div className="scd-action-btns">
                          <button className="scd-btn scd-btn-details" title="View details">
                            <DetailsIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 3 && (
              <table className="scd-table">
                <thead>
                  <tr>
                    <th><span>Severity</span></th>
                    <th><span>Title</span></th>
                    <th><span>Component</span></th>
                    <th><span>Detected</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilityAlerts.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className="scd-chip" style={{ backgroundColor: severityColor(row.severity), color: '#fff' }}>
                          {row.severity}
                        </span>
                      </td>
                      <td>{row.title}</td>
                      <td>{row.component}</td>
                      <td>{row.detected}</td>
                      <td>
                        <span className={`scd-status ${statusColor(row.status)}`}>{row.status}</span>
                      </td>
                      <td>
                        <div className="scd-action-btns">
                          {row.status !== 'resolved' && (
                            <button
                              className="scd-btn scd-btn-resolve"
                              onClick={() => handleResolveAlert(row.id)}
                              title="Mark as resolved"
                            >
                              <ResolveIcon />
                            </button>
                          )}
                          <button className="scd-btn scd-btn-details" title="View details">
                            <DetailsIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 4 && (
              <table className="scd-table">
                <thead>
                  <tr>
                    <th><span>Standard</span></th>
                    <th><span>Status</span></th>
                    <th><span>Last Audit</span></th>
                    <th><span>Next Audit</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {complianceReports.map((row) => (
                    <tr key={row.id}>
                      <td>{row.type}</td>
                      <td>
                        <span className={`scd-status ${statusColor(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.lastAudit}</td>
                      <td>{row.nextAudit}</td>
                      <td>
                        <div className="scd-action-btns">
                          <button className="scd-btn scd-btn-view" title="Generate Report">
                            <VisibilityIcon />
                          </button>
                          <button className="scd-btn scd-btn-schedule" title="Schedule Audit">
                            <CalendarIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="scd-sidebar">
          <h2>Recent Security Events</h2>
          <div className="scd-event-list">
            <div className="scd-event-item">
              <div className="scd-event-icon">
                <WarningIcon />
              </div>
              <div className="scd-event-text">
                <span>Multiple failed login attempts</span>
                <span className="scd-text-secondary">5 minutes ago - IP: 192.168.1.45</span>
              </div>
            </div>
            <div className="scd-event-divider"></div>
            <div className="scd-event-item">
              <div className="scd-event-icon">
                <ResolveIcon />
              </div>
              <div className="scd-event-text">
                <span>Vulnerability resolved</span>
                <span className="scd-text-secondary">1 hour ago - Outdated library updated</span>
              </div>
            </div>
            <div className="scd-event-divider"></div>
            <div className="scd-event-item">
              <div className="scd-event-icon">
                <VisibilityIcon />
              </div>
              <div className="scd-event-text">
                <span>Admin permissions modified</span>
                <span className="scd-text-secondary">2 hours ago - User: admin@example.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default SecurityComplianceDashboard;