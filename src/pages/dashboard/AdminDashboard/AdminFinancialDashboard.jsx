import React, { useState } from 'react';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Error as FailedIcon,
  SwapHoriz as EscrowIcon,
  Receipt as ReceiptIcon,
  CreditCard as SubscriptionIcon,
  Warning as DisputeIcon,
  TrendingUp as RevenueIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminFinancialDashboard.css';

const AdminFinancialDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      id: 'TX-1001',
      date: '2023-06-15T14:30:00Z',
      user: 'Alex Johnson',
      amount: 89.00,
      type: 'rental',
      status: 'completed',
      escrow: 'released',
      payout: 'processed',
      dispute: false
    },
    {
      id: 'TX-1002',
      date: '2023-06-14T09:15:00Z',
      user: 'Sarah Williams',
      amount: 250.00,
      type: 'rental',
      status: 'pending',
      escrow: 'held',
      payout: 'pending',
      dispute: false
    },
    {
      id: 'TX-1003',
      date: '2023-06-13T11:45:00Z',
      user: 'Michael Chen',
      amount: 45.00,
      type: 'rental',
      status: 'failed',
      escrow: 'none',
      payout: 'none',
      dispute: true
    },
    {
      id: 'TX-1004',
      date: '2023-06-12T18:20:00Z',
      user: 'Emily Davis',
      amount: 75.00,
      type: 'subscription',
      status: 'completed',
      escrow: 'none',
      payout: 'processed',
      dispute: false
    },
    {
      id: 'TX-1005',
      date: '2023-06-10T10:05:00Z',
      user: 'David Wilson',
      amount: 120.00,
      type: 'rental',
      status: 'refunded',
      escrow: 'refunded',
      payout: 'reversed',
      dispute: true
    }
  ]);

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$24,589', 
      icon: <MoneyIcon />,
      change: '+18% from last month',
      trend: 'up'
    },
    { 
      title: 'Completed Payments', 
      value: '1,842', 
      icon: <CompletedIcon />,
      change: '92% success rate',
      trend: 'up'
    },
    { 
      title: 'Escrow Holdings', 
      value: '$8,742', 
      icon: <EscrowIcon />,
      change: 'Currently held',
      trend: 'neutral'
    },
    { 
      title: 'Active Subscriptions', 
      value: '328', 
      icon: 'SubscriptionsIcon',
      change: '12 new this week',
      trend: 'up'
    },
    { 
      title: 'Disputes', 
      value: '23', 
      icon: <DisputeIcon />,
      change: '5 resolved this week',
      trend: 'down'
    },
    { 
      title: 'Commission Earnings', 
      value: '$4,917', 
      icon: <RevenueIcon />,
      change: '15% of transactions',
      trend: 'up'
    }
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4200, commission: 840 },
    { name: 'Feb', revenue: 5800, commission: 1160 },
    { name: 'Mar', revenue: 7100, commission: 1420 },
    { name: 'Apr', revenue: 8900, commission: 1780 },
    { name: 'May', revenue: 12500, commission: 2500 },
    { name: 'Jun', revenue: 15800, commission: 3160 },
  ];

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    escrow: 'all',
    search: '',
    dateFrom: null,
    dateTo: null
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0);
  };

  const filteredTransactions = transactions.filter(tx => {
    return (
      (filters.type === 'all' || tx.type === filters.type) &&
      (filters.status === 'all' || tx.status === filters.status) &&
      (filters.escrow === 'all' || tx.escrow === filters.escrow) &&
      (filters.search === '' || 
        tx.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.user.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.dateFrom || new Date(tx.date) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(tx.date) <= new Date(filters.dateTo))
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const StatusChip = ({ status }) => {
    const statusMap = {
      completed: { color: '#065f46', icon: <CompletedIcon className="afd-icon" /> },
      pending: { color: '#212529', icon: <PendingIcon className="afd-icon" /> },
      failed: { color: '#991b1b', icon: <FailedIcon className="afd-icon" /> },
      refunded: { color: '#2575FC', icon: <FailedIcon className="afd-icon" /> }
    };
    
    return (
      <span className={`afd-status ${status}`}>
        {statusMap[status]?.icon}
        {status}
      </span>
    );
  };

  const EscrowChip = ({ status }) => {
    const statusMap = {
      held: { color: '#212529', label: 'Held' },
      released: { color: '#065f46', label: 'Released' },
      refunded: { color: '#2575FC', label: 'Refunded' },
      none: { color: '#6251a4', label: 'None' }
    };
    
    return (
      <span className={`afd-status ${status}`}>
        {statusMap[status]?.label || status}
      </span>
    );
  };

  const DisputeChip = ({ hasDispute }) => {
    return hasDispute ? (
      <span className="afd-status dispute">
        <DisputeIcon className="afd-icon" />
        Dispute
      </span>
    ) : (
      <span className="afd-text-secondary">-</span>
    );
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="afd-container">
        <h1 className="afd-title">Financial Dashboard</h1>

        <div className="afd-tabs">
          <button className={`afd-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => handleTabChange(null, 0)}>
            <MoneyIcon className="afd-icon" />
            Overview
          </button>
          <button className={`afd-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => handleTabChange(null, 1)}>
            <ReceiptIcon className="afd-icon" />
            Transactions
          </button>
          <button className={`afd-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => handleTabChange(null, 2)}>
            <EscrowIcon className="afd-icon" />
            Escrow
          </button>
          <button className={`afd-tab ${tabValue === 3 ? 'active' : ''}`} onClick={() => handleTabChange(null, 3)}>
            <SubscriptionIcon className="afd-icon" />
            Subscriptions
          </button>
          <button className={`afd-tab ${tabValue === 4 ? 'active' : ''}`} onClick={() => handleTabChange(null, 4)}>
            <DisputeIcon className="afd-icon" />
            Disputes
          </button>
        </div>

        {tabValue === 0 && (
          <>
            <div className="afd-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="afd-stat-card">
                  <div className="afd-stat-header">
                    <span>{stat.title}</span>
                    <div className="afd-stat-icon">{stat.icon}</div>
                  </div>
                  <h3>{stat.value}</h3>
                  <p>{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="afd-chart-container">
              <h2>Revenue & Commission (Last 6 Months)</h2>
              <div className="afd-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#7226FF" name="Total Revenue" />
                    <Bar dataKey="commission" fill="#F042FF" name="Commission" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tabValue === 1 && (
          <>
            <div className="afd-filters">
              <div className="afd-filter-item">
                <div className="afd-search-input">
                  <SearchIcon className="afd-icon" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              <div className="afd-filter-item">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="rental">Rental</option>
                  <option value="subscription">Subscription</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div className="afd-filter-item">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="afd-filter-item">
                <label>From</label>
                <DatePicker
                  value={filters.dateFrom}
                  onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
                  renderInput={(params) => (
                    <input
                      type="text"
                      value={params.inputProps.value}
                      onChange={params.inputProps.onChange}
                      className="afd-date-input"
                    />
                  )}
                />
              </div>
              <div className="afd-filter-item">
                <label>To</label>
                <DatePicker
                  value={filters.dateTo}
                  onChange={(newValue) => handleFilterChange('dateTo', newValue)}
                  renderInput={(params) => (
                    <input
                      type="text"
                      value={params.inputProps.value}
                      onChange={params.inputProps.onChange}
                      className="afd-date-input"
                    />
                  )}
                />
              </div>
              <div className="afd-filter-actions">
                <button className="afd-btn afd-btn-action" onClick={handleRefresh} disabled={loading}>
                  {loading ? <div className="afd-spinner"></div> : <RefreshIcon className="afd-icon" />}
                </button>
                <button className="afd-btn afd-btn-action">
                  <ExportIcon className="afd-icon" />
                </button>
              </div>
            </div>

            <div className="afd-table-container">
              <table className="afd-table">
                <thead>
                  <tr>
                    <th><span>Transaction ID</span></th>
                    <th><span>Date</span></th>
                    <th><span>User</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Type</span></th>
                    <th><span>Status</span></th>
                    <th><span>Escrow</span></th>
                    <th><span>Dispute</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.id}</td>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>
                          <div className="afd-user-cell">
                            <div className="afd-avatar">{tx.user.charAt(0)}</div>
                            <span>{tx.user}</span>
                          </div>
                        </td>
                        <td>${tx.amount.toFixed(2)}</td>
                        <td><span className="afd-chip">{tx.type}</span></td>
                        <td><StatusChip status={tx.status} /></td>
                        <td><EscrowChip status={tx.escrow} /></td>
                        <td><DisputeChip hasDispute={tx.dispute} /></td>
                        <td>
                          <div className="afd-action-btns">
                            <button className="afd-btn afd-btn-action">
                              <MoreIcon className="afd-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="afd-pagination">
                <div className="afd-items-per-page">
                  <span>Items per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                </div>
                <div className="afd-page-navigation">
                  <span>
                    {((page * rowsPerPage) + 1)}-
                    {Math.min((page + 1) * rowsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                  </span>
                  <div className="afd-page-btns">
                    <button
                      onClick={() => handleChangePage(null, page - 1)}
                      disabled={page === 0}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleChangePage(null, page + 1)}
                      disabled={(page + 1) * rowsPerPage >= filteredTransactions.length}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tabValue === 2 && (
          <div className="afd-section">
            <h2>Escrow Management</h2>
            <div className="afd-grid">
              <div className="afd-card">
                <h3>Funds Currently in Escrow</h3>
                <span className="afd-value">$8,742.00</span>
                <p>42 transactions • Average hold time: 3.5 days</p>
              </div>
              <div className="afd-card">
                <h3>Recent Escrow Activity</h3>
                <div className="afd-list">
                  <div className="afd-list-item">
                    <div className="afd-list-icon">
                      <EscrowIcon className="afd-icon" />
                    </div>
                    <div>
                      <span>TX-1002 - $250.00</span>
                      <p>Held for Sarah Williams • Rental</p>
                    </div>
                  </div>
                  <div className="afd-list-item">
                    <div className="afd-list-icon">
                      <EscrowIcon className="afd-icon" />
                    </div>
                    <div>
                      <span>TX-1007 - $180.00</span>
                      <p>Released to Michael Chen • Completed</p>
                    </div>
                  </div>
                  <div className="afd-list-item">
                    <div className="afd-list-icon">
                      <EscrowIcon className="afd-icon" />
                    </div>
                    <div>
                      <span>TX-1005 - $120.00</span>
                      <p>Refunded to David Wilson • Dispute resolved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabValue === 3 && (
          <div className="afd-section">
            <h2>Subscription Management</h2>
            <div className="afd-grid">
              <div className="afd-card">
                <h3>Active Subscriptions</h3>
                <span className="afd-value">328</span>
                <p>$9,840 MRR • 12 new this week</p>
              </div>
              <div className="afd-card">
                <h3>Renewals This Month</h3>
                <span className="afd-value">84</span>
                <p>$2,520 expected revenue</p>
              </div>
              <div className="afd-card">
                <h3>Expiring Soon</h3>
                <span className="afd-value">19</span>
                <p>In next 7 days • $570 at risk</p>
              </div>
            </div>
          </div>
        )}

        {tabValue === 4 && (
          <div className="afd-section">
            <h2>Dispute Resolution Center</h2>
            <div className="afd-grid">
              <div className="afd-card">
                <h3>Open Disputes</h3>
                <span className="afd-value afd-value-error">14</span>
                <p>$1,250 in disputed amounts</p>
              </div>
              <div className="afd-card">
                <h3>Recently Resolved</h3>
                <span className="afd-value afd-value-success">5</span>
                <p>This week • $420 refunded</p>
              </div>
              <div className="afd-card afd-card-full">
                <h3>Dispute Breakdown</h3>
                <div className="afd-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Jan', disputes: 8, resolved: 5 },
                        { name: 'Feb', disputes: 12, resolved: 9 },
                        { name: 'Mar', disputes: 15, resolved: 11 },
                        { name: 'Apr', disputes: 10, resolved: 8 },
                        { name: 'May', disputes: 18, resolved: 12 },
                        { name: 'Jun', disputes: 14, resolved: 5 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="disputes" fill="#991b1b" name="New Disputes" />
                      <Bar dataKey="resolved" fill="#065f46" name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default AdminFinancialDashboard;