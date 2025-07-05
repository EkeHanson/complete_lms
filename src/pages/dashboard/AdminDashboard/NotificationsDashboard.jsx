import React, { useState } from 'react';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
  AddShoppingCart as ListingIcon,
  HowToReg as ApprovalIcon,
  Security as SuspiciousIcon,
  ArrowForward as DetailsIcon,
  Refresh as RefreshIcon,
  // ResolveIcon, <-- remove this line
  AssignmentTurnedIn as ResolveIcon,  // or Done, CheckCircle, etc.
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  Error as CriticalIcon,
  Storage as StorageIcon,
  Traffic as TrafficIcon
} from '@mui/icons-material';


import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './NotificationsDashboard.css';

const NotificationsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');

  const systemWarnings = [
    { id: 1, type: 'API Failure', component: 'Payment Gateway', severity: 'critical', message: 'Failed to process 12 transactions', timestamp: '2023-06-15 14:32:45', status: 'unresolved' },
    { id: 2, type: 'High Traffic', component: 'Web Server', severity: 'high', message: 'Traffic spike detected (300% increase)', timestamp: '2023-06-15 11:15:22', status: 'monitoring' },
    { id: 3, type: 'Low Storage', component: 'Database Server', severity: 'medium', message: 'Only 10% storage remaining', timestamp: '2023-06-14 09:45:10', status: 'unresolved' },
    { id: 4, type: 'API Latency', component: 'User Service', severity: 'medium', message: 'Response time > 2s for 15% requests', timestamp: '2023-06-13 22:18:37', status: 'investigating' },
    { id: 5, type: 'Backup Failed', component: 'Storage System', severity: 'high', message: 'Nightly backup failed', timestamp: '2023-06-13 18:05:14', status: 'unresolved' }
  ];

  const userReports = [
    { id: 1, user: 'customer123@example.com', type: 'Complaint', subject: 'Product not as described', message: 'Received wrong color item', timestamp: '2023-06-15 16:20:12', status: 'new' },
    { id: 2, user: 'user456@example.com', type: 'Bug Report', subject: 'Checkout error', message: 'Getting 500 error when applying coupon', timestamp: '2023-06-15 14:05:33', status: 'in-progress' },
    { id: 3, user: 'shopper789@example.com', type: 'Feature Request', subject: 'Dark mode', message: 'Please add dark mode option', timestamp: '2023-06-15 10:12:45', status: 'review' },
    { id: 4, user: 'guest-4587', type: 'Complaint', subject: 'Late delivery', message: 'Package arrived 5 days late', timestamp: '2023-06-14 18:30:21', status: 'resolved' }
  ];

  const newListings = [
    { id: 1, itemId: 'PROD-4587', title: 'Wireless Headphones', seller: 'audio_shop', category: 'Electronics', timestamp: '2023-06-15 09:15:00', status: 'pending-review' },
    { id: 2, itemId: 'PROD-4588', title: 'Leather Wallet', seller: 'fashion_goods', category: 'Accessories', timestamp: '2023-06-14 14:30:00', status: 'approved' },
    { id: 3, itemId: 'PROD-4589', title: 'Smart Watch', seller: 'tech_deals', category: 'Electronics', timestamp: '2023-06-13 11:45:00', status: 'rejected' },
    { id: 4, itemId: 'PROD-4590', title: 'Organic Coffee', seller: 'food_market', category: 'Groceries', timestamp: '2023-06-12 15:45:00', status: 'pending-review' }
  ];

  const pendingApprovals = [
    { id: 1, requestId: 'REQ-4587', type: 'Vendor Application', user: 'new_vendor@example.com', submitted: '2023-06-15', status: 'pending' },
    { id: 2, requestId: 'REQ-4588', type: 'Refund Request', user: 'customer123@example.com', order: 'ORD-4587', submitted: '2023-06-14', status: 'pending' },
    { id: 3, requestId: 'REQ-4589', type: 'Content Update', user: 'editor@example.com', page: 'About Us', submitted: '2023-06-14', status: 'pending' },
    { id: 4, requestId: 'REQ-4590', type: 'Account Upgrade', user: 'pro_user@example.com', plan: 'Professional', submitted: '2023-06-13', status: 'pending' }
  ];

  const suspiciousActivities = [
    { id: 1, type: 'Multiple Accounts', user: 'user123@example.com', ip: '192.168.1.45', details: '3 accounts from same IP', timestamp: '2023-06-15 14:32:45', status: 'investigating' },
    { id: 2, type: 'Fraudulent Transaction', order: 'ORD-4587', amount: '$450', details: 'Possible stolen credit card', timestamp: '2023-06-15 11:15:22', status: 'blocked' },
    { id: 3, type: 'Bot Activity', ip: '45.67.89.123', details: 'Scraping product data', timestamp: '2023-06-14 09:45:10', status: 'blocked' },
    { id: 4, type: 'Fake Reviews', user: 'reviewer123@example.com', details: '5 identical positive reviews', timestamp: '2023-06-13 22:18:37', status: 'investigating' }
  ];

  const recentAlerts = [
    { id: 1, type: 'API Failure - Payment Gateway', message: '15 minutes ago - 12 failed transactions', icon: <CriticalIcon className="nd-icon" />, bgColor: '#fee2e2' },
    { id: 2, type: 'New user complaint', message: '1 hour ago - Wrong item received', icon: <ReportIcon className="nd-icon" />, bgColor: '#fff7e6' },
    { id: 3, type: 'Suspicious activity detected', message: '2 hours ago - Multiple accounts from same IP', icon: <SuspiciousIcon className="nd-icon" />, bgColor: '#e6f4ff' },
    { id: 4, type: 'New listing added', message: '3 hours ago - Wireless Headphones', icon: <ListingIcon className="nd-icon" />, bgColor: '#e6fffa' }
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

  const handleApproveRequest = (id) => {
    console.log(`Approving request ${id}`);
  };

  const severityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#991b1b';
      case 'high': return '#d32f2f';
      case 'medium': return '#ff9800';
      case 'low': return '#065f46';
      default: return '#6251a4';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'unresolved': return '#991b1b';
      case 'monitoring': return '#0288d1';
      case 'investigating': return '#ff9800';
      case 'resolved': return '#065f46';
      case 'new': return '#7226FF';
      case 'in-progress': return '#0288d1';
      case 'review': return '#6251a4';
      case 'pending': return '#ff9800';
      case 'pending-review': return '#ff9800';
      case 'approved': return '#065f46';
      case 'rejected': return '#991b1b';
      case 'blocked': return '#991b1b';
      default: return '#6251a4';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="nd-container">
        <div className="nd-header">
          <h1>
            <NotificationsIcon className="nd-icon" />
            Notifications & Alerts
          </h1>
          <button className="nd-btn nd-btn-refresh">
            <RefreshIcon className="nd-icon" />
            Refresh Data
          </button>
        </div>

        <div className="nd-top-cards">
          <div className="nd-card">
            <p>System Warnings</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#fee2e2' }}>
                <WarningIcon className="nd-icon" />
              </span>
              <div>
                <h3>8</h3>
                <span className="nd-card-subtext" style={{ color: '#991b1b' }}>3 critical</span>
              </div>
            </div>
          </div>
          <div className="nd-card">
            <p>User Reports</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#fff7e6' }}>
                <ReportIcon className="nd-icon" />
              </span>
              <div>
                <h3>12</h3>
                <span className="nd-card-subtext">5 new</span>
              </div>
            </div>
          </div>
          <div className="nd-card">
            <p>New Listings</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#e6f4ff' }}>
                <ListingIcon className="nd-icon" />
              </span>
              <div>
                <h3>24</h3>
                <span className="nd-card-subtext">7 pending</span>
              </div>
            </div>
          </div>
          <div className="nd-card">
            <p>Pending Approvals</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#f3edff' }}>
                <ApprovalIcon className="nd-icon" />
              </span>
              <div>
                <h3>9</h3>
              </div>
            </div>
          </div>
          <div className="nd-card">
            <p>Suspicious Activities</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#fee2e2' }}>
                <SuspiciousIcon className="nd-icon" />
              </span>
              <div>
                <h3>5</h3>
              </div>
            </div>
          </div>
          <div className="nd-card">
            <p>Total Alerts</p>
            <div className="nd-card-content">
              <span className="nd-card-icon" style={{ backgroundColor: '#fee2e2' }}>
                <CriticalIcon className="nd-icon" />
              </span>
              <div>
                <h3>58</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="nd-main-content">
          <div className="nd-tabs">
            <button className={`nd-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => handleTabChange(null, 0)}>
              <WarningIcon className="nd-icon" />
              System Warnings
            </button>
            <button className={`nd-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => handleTabChange(null, 1)}>
              <ReportIcon className="nd-icon" />
              User Reports
            </button>
            <button className={`nd-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => handleTabChange(null, 2)}>
              <ListingIcon className="nd-icon" />
              New Listings
            </button>
            <button className={`nd-tab ${tabValue === 3 ? 'active' : ''}`} onClick={() => handleTabChange(null, 3)}>
              <ApprovalIcon className="nd-icon" />
              Pending Approvals
            </button>
            <button className={`nd-tab ${tabValue === 4 ? 'active' : ''}`} onClick={() => handleTabChange(null, 4)}>
              <SuspiciousIcon className="nd-icon" />
              Suspicious Activities
            </button>
          </div>

          <div className="nd-filter-bar">
            <div className="nd-search-input">
              <SearchIcon className="nd-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="nd-date-picker">
              <CalendarIcon className="nd-icon" />
              <DatePicker
                value={dateRange[0]}
                onChange={(newValue) => handleDateChange(newValue, 0)}
                renderInput={({ inputRef, inputProps }) => (
                  <input ref={inputRef} {...inputProps} className="nd-date-input" placeholder="From" />
                )}
              />
              <span>-</span>
              <DatePicker
                value={dateRange[1]}
                onChange={(newValue) => handleDateChange(newValue, 1)}
                renderInput={({ inputRef, inputProps }) => (
                  <input ref={inputRef} {...inputProps} className="nd-date-input" placeholder="To" />
                )}
              />
            </div>
            <button className="nd-btn nd-btn-filter">
              <FilterIcon className="nd-icon" />
              Filters
            </button>
          </div>

          <div className="nd-table-container">
            {tabValue === 0 && (
              <table className="nd-table">
                <thead>
                  <tr>
                    <th><span>Type</span></th>
                    <th><span>Component</span></th>
                    <th><span>Severity</span></th>
                    <th><span>Message</span></th>
                    <th><span>Timestamp</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {systemWarnings.map((row) => (
                    <tr key={row.id}>
                      <td>{row.type}</td>
                      <td>{row.component}</td>
                      <td>
                        <span className="nd-chip" style={{ backgroundColor: severityColor(row.severity), color: '#fff' }}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="nd-text-truncate">{row.message}</td>
                      <td>{row.timestamp}</td>
                      <td>
                        <span className={`nd-status ${row.status}`} style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="nd-action-btns">
                          {row.status !== 'resolved' && (
                            <button className="nd-btn nd-btn-resolve" onClick={() => handleResolveAlert(row.id)}>
                              <ResolveIcon className="nd-icon" />
                            </button>
                          )}
                          <button className="nd-btn nd-btn-details">
                            <DetailsIcon className="nd-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 1 && (
              <table className="nd-table">
                <thead>
                  <tr>
                    <th><span>User</span></th>
                    <th><span>Type</span></th>
                    <th><span>Subject</span></th>
                    <th><span>Message</span></th>
                    <th><span>Timestamp</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {userReports.map((row) => (
                    <tr key={row.id}>
                      <td>{row.user}</td>
                      <td>
                        <span className="nd-chip" style={{ backgroundColor: row.type === 'Complaint' ? '#fee2e2' : '#e6f4ff', color: row.type === 'Complaint' ? '#991b1b' : '#0288d1' }}>
                          {row.type}
                        </span>
                      </td>
                      <td>{row.subject}</td>
                      <td className="nd-text-truncate">{row.message}</td>
                      <td>{row.timestamp}</td>
                      <td>
                        <span className={`nd-status ${row.status}`} style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="nd-action-btns">
                          <button className="nd-btn nd-btn-details">
                            <DetailsIcon className="nd-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 2 && (
              <table className="nd-table">
                <thead>
                  <tr>
                    <th><span>Item ID</span></th>
                    <th><span>Title</span></th>
                    <th><span>Seller</span></th>
                    <th><span>Category</span></th>
                    <th><span>Timestamp</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {newListings.map((row) => (
                    <tr key={row.id}>
                      <td>{row.itemId}</td>
                      <td>{row.title}</td>
                      <td>{row.seller}</td>
                      <td>{row.category}</td>
                      <td>{row.timestamp}</td>
                      <td>
                        <span className={`nd-status ${row.status}`} style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="nd-action-btns">
                          {row.status === 'pending-review' && (
                            <>
                              <button className="nd-btn nd-btn-resolve" onClick={() => handleApproveRequest(row.id)}>
                                <ResolveIcon className="nd-icon" />
                              </button>
                              <button className="nd-btn nd-btn-reject">
                                <BlockIcon className="nd-icon" />
                              </button>
                            </>
                          )}
                          <button className="nd-btn nd-btn-details">
                            <DetailsIcon className="nd-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 3 && (
              <table className="nd-table">
                <thead>
                  <tr>
                    <th><span>Request ID</span></th>
                    <th><span>Type</span></th>
                    <th><span>User</span></th>
                    <th><span>Details</span></th>
                    <th><span>Submitted</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((row) => (
                    <tr key={row.id}>
                      <td>{row.requestId}</td>
                      <td>{row.type}</td>
                      <td>{row.user}</td>
                      <td>
                        {row.order && `Order: ${row.order}`}
                        {row.page && `Page: ${row.page}`}
                        {row.plan && `Plan: ${row.plan}`}
                      </td>
                      <td>{row.submitted}</td>
                      <td>
                        <span className={`nd-status ${row.status}`} style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="nd-action-btns">
                          <button className="nd-btn nd-btn-resolve" onClick={() => handleApproveRequest(row.id)}>
                            <ResolveIcon className="nd-icon" />
                          </button>
                          <button className="nd-btn nd-btn-reject">
                            <BlockIcon className="nd-icon" />
                          </button>
                          <button className="nd-btn nd-btn-details">
                            <DetailsIcon className="nd-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tabValue === 4 && (
              <table className="nd-table">
                <thead>
                  <tr>
                    <th><span>Type</span></th>
                    <th><span>User/Order</span></th>
                    <th><span>IP Address</span></th>
                    <th><span>Details</span></th>
                    <th><span>Timestamp</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousActivities.map((row) => (
                    <tr key={row.id}>
                      <td>{row.type}</td>
                      <td>{row.user || row.order}</td>
                      <td>{row.ip}</td>
                      <td className="nd-text-truncate">{row.details}</td>
                      <td>{row.timestamp}</td>
                      <td>
                        <span className={`nd-status ${row.status}`} style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="nd-action-btns">
                          {row.status !== 'blocked' && (
                            <button className="nd-btn nd-btn-reject">
                              <BlockIcon className="nd-icon" />
                            </button>
                          )}
                          <button className="nd-btn nd-btn-details">
                            <DetailsIcon className="nd-icon" />
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

        <div className="nd-recent-alerts">
          <h2>Recent Alerts</h2>
          <div className="nd-alerts-list">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="nd-alert-item">
                <span className="nd-alert-icon" style={{ backgroundColor: alert.bgColor }}>
                  {alert.icon}
                </span>
                <div>
                  <span>{alert.type}</span>
                  <span className="nd-text-secondary">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default NotificationsDashboard;