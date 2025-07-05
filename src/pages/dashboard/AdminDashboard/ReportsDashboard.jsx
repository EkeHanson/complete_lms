import React, { useState } from 'react';
import {
  Assessment as AssessmentIcon,
  Timeline as TrendsIcon, // Changed from Trends to Timeline
  AttachMoney as FinanceIcon, // Changed from Finance to AttachMoney
  Warning as FraudIcon, // Changed from Fraud to Warning
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Details as DetailsIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  InsertChartOutlined as ChartIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedReport, setSelectedReport] = useState(null);

  const userGrowthData = [
    { month: 'Jan', newUsers: 120, activeUsers: 450, returningUsers: 180 },
    { month: 'Feb', newUsers: 150, activeUsers: 520, returningUsers: 210 },
    { month: 'Mar', newUsers: 180, activeUsers: 600, returningUsers: 250 },
    { month: 'Apr', newUsers: 210, activeUsers: 720, returningUsers: 290 },
    { month: 'May', newUsers: 240, activeUsers: 850, returningUsers: 330 },
    { month: 'Jun', newUsers: 280, activeUsers: 920, returningUsers: 380 },
  ];

  const financialReports = [
    { id: 1, period: 'Daily', date: '2023-06-15', revenue: 12500, transactions: 342, avgOrder: 36.55, status: 'generated' },
    { id: 2, period: 'Weekly', date: '2023-06-12 to 2023-06-18', revenue: 87500, transactions: 2415, avgOrder: 36.23, status: 'generated' },
    { id: 3, period: 'Monthly', date: 'May 2023', revenue: 375000, transactions: 10280, avgOrder: 36.48, status: 'pending' },
    { id: 4, period: 'Daily', date: '2023-06-14', revenue: 11800, transactions: 325, avgOrder: 36.31, status: 'generated' },
  ];

  const fraudAnalysis = [
    { id: 1, userId: 'user123', email: 'user123@example.com', riskScore: 87, flags: ['Multiple IPs', 'Unusual activity', 'High refund rate'], lastActivity: '2023-06-15 14:32:45' },
    { id: 2, userId: 'user456', email: 'user456@example.com', riskScore: 65, flags: ['Suspicious payment', 'Unverified email'], lastActivity: '2023-06-15 11:15:22' },
    { id: 3, userId: 'user789', email: 'user789@example.com', riskScore: 92, flags: ['Bot-like behavior', 'Fake profile'], lastActivity: '2023-06-14 09:45:10' },
    { id: 4, userId: 'user012', email: 'user012@example.com', riskScore: 54, flags: ['Unusual login times'], lastActivity: '2023-06-13 22:18:37' },
  ];

  const featureUsage = [
    { id: 1, feature: 'Advanced Search', usageCount: 12500, uniqueUsers: 4500, satisfaction: 4.2, trend: 'up' },
    { id: 2, feature: 'Dashboard Customization', usageCount: 8700, uniqueUsers: 3200, satisfaction: 3.8, trend: 'steady' },
    { id: 3, feature: 'API Integration', usageCount: 5200, uniqueUsers: 1200, satisfaction: 4.5, trend: 'up' },
    { id: 4, feature: 'Mobile App', usageCount: 21500, uniqueUsers: 8500, satisfaction: 4.1, trend: 'up' },
    { id: 5, feature: 'Legacy Features', usageCount: 3200, uniqueUsers: 1500, satisfaction: 2.8, trend: 'down' },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenExportDialog = (report) => {
    setSelectedReport(report);
    setOpenExportDialog(true);
  };

  const handleCloseExportDialog = () => {
    setOpenExportDialog(false);
    setSelectedReport(null);
  };

  const handleExport = () => {
    console.log(`Exporting ${selectedReport?.period} report as ${exportFormat}`);
    handleCloseExportDialog();
  };

  const handleGenerateReport = (type) => {
    console.log(`Generating ${type} report`);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'generated': return 'active';
      case 'pending': return 'pending';
      case 'error': return 'rejected';
      default: return 'default';
    }
  };

  const riskColor = (score) => {
    if (score >= 80) return '#991b1b';
    if (score >= 60) return '#212529';
    return '#065f46';
  };

  const trendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const trendColor = (trend) => {
    switch (trend) {
      case 'up': return '#065f46';
      case 'down': return '#991b1b';
      default: return '#212529';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="rd-container">
        <div className="rd-header">
          <h1>
            <AssessmentIcon className="rd-icon" />
            Custom Reports & Data Exports
          </h1>
          <button className="rd-btn rd-btn-refresh">
            <RefreshIcon />
            Refresh Data
          </button>
        </div>

        <div className="rd-cards">
          <div className="rd-card">
            <span className="rd-card-title">New Users (30d)</span>
            <div className="rd-card-content">
              <TrendsIcon className="rd-icon" />
              <span className="rd-card-value">1,240</span>
            </div>
            <span className="rd-card-footer">↑ 12% from last month</span>
          </div>
          <div className="rd-card">
            <span className="rd-card-title">Total Revenue (30d)</span>
            <div className="rd-card-content">
              <FinanceIcon className="rd-icon" />
              <span className="rd-card-value">$375K</span>
            </div>
            <span className="rd-card-footer">↑ 8% from last month</span>
          </div>
          <div className="rd-card">
            <span className="rd-card-title">High Risk Users</span>
            <div className="rd-card-content">
              <FraudIcon className="rd-icon" />
              <span className="rd-card-value">24</span>
            </div>
            <span className="rd-card-footer">↓ 3 from last week</span>
          </div>
          <div className="rd-card">
            <span className="rd-card-title">Feature Adoption</span>
            <div className="rd-card-content">
              <AnalyticsIcon className="rd-icon" />
              <span className="rd-card-value">72%</span>
            </div>
            <span className="rd-card-footer">New features: 85% adoption</span>
          </div>
        </div>

        <div className="rd-main">
          <div className="rd-tabs">
            <button className={`rd-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => handleTabChange(null, 0)}>
              <TrendsIcon />
              User Growth Trends
            </button>
            <button className={`rd-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => handleTabChange(null, 1)}>
              <FinanceIcon />
              Financial Reports
            </button>
            <button className={`rd-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => handleTabChange(null, 2)}>
              <FraudIcon />
              Fraud Analysis
            </button>
            <button className={`rd-tab ${tabValue === 3 ? 'active' : ''}`} onClick={() => handleTabChange(null, 3)}>
              <AnalyticsIcon />
              Feature Usage
            </button>
          </div>

          <div className="rd-filter-bar">
            <div className="rd-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="rd-date-range">
              <CalendarIcon />
              <DatePicker
                className="rd-date-picker"
                value={dateRange[0]}
                onChange={(newValue) => handleDateChange(newValue, 0)}
                renderInput={(params) => <input {...params.inputProps} />}
              />
              <span>-</span>
              <DatePicker
                className="rd-date-picker"
                value={dateRange[1]}
                onChange={(newValue) => handleDateChange(newValue, 1)}
                renderInput={(params) => <input {...params.inputProps} />}
              />
            </div>
            <button className="rd-btn rd-btn-filter">
              <FilterIcon />
              Filters
            </button>
            <button className="rd-btn rd-btn-more" onClick={handleMenuOpen}>
              <MoreIcon />
            </button>
            <div className="rd-menu" style={{ display: anchorEl ? 'block' : 'none' }}>
              <div className="rd-menu-item" onClick={() => { handleMenuClose(); console.log('Export All Data'); }}>
                Export All Data
              </div>
              <div className="rd-menu-item" onClick={() => { handleMenuClose(); console.log('Schedule Report'); }}>
                Schedule Report
              </div>
              <div className="rd-menu-item" onClick={() => { handleMenuClose(); console.log('Custom Report'); }}>
                Custom Report
              </div>
            </div>
          </div>

          <div className="rd-content">
            {tabValue === 0 && (
              <div>
                <div className="rd-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="newUsers" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="returningUsers" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="rd-table-container">
                  <table className="rd-table">
                    <thead>
                      <tr>
                        <th><span>Month</span></th>
                        <th><span>New Users</span></th>
                        <th><span>Active Users</span></th>
                        <th><span>Returning Users</span></th>
                        <th><span>Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userGrowthData.map((row) => (
                        <tr key={row.month}>
                          <td>{row.month}</td>
                          <td>{row.newUsers.toLocaleString()}</td>
                          <td>{row.activeUsers.toLocaleString()}</td>
                          <td>{row.returningUsers.toLocaleString()}</td>
                          <td>
                            <button className="rd-btn rd-btn-action" onClick={() => handleOpenExportDialog({ period: `${row.month} User Growth` })}>
                              <DownloadIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabValue === 1 && (
              <div className="rd-table-container">
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th><span>Period</span></th>
                      <th><span>Date Range</span></th>
                      <th><span>Revenue</span></th>
                      <th><span>Transactions</span></th>
                      <th><span>Avg. Order</span></th>
                      <th><span>Status</span></th>
                      <th><span>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.period}</td>
                        <td>{report.date}</td>
                        <td>${report.revenue.toLocaleString()}</td>
                        <td>{report.transactions.toLocaleString()}</td>
                        <td>${report.avgOrder.toFixed(2)}</td>
                        <td>
                          <span className={`rd-status ${statusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <div className="rd-action-btns">
                            {report.status === 'generated' ? (
                              <button className="rd-btn rd-btn-action" onClick={() => handleOpenExportDialog(report)}>
                                <DownloadIcon />
                              </button>
                            ) : (
                              <button className="rd-btn rd-btn-action" onClick={() => handleGenerateReport(report.period)}>
                                <RefreshIcon />
                              </button>
                            )}
                            <button className="rd-btn rd-btn-action">
                              <DetailsIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tabValue === 2 && (
              <div>
                <div className="rd-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fraudAnalysis.map(user => ({ userId: 'user123', riskScore: 87 }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="userId" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="riskScore" fill="#991b1b" name="Risk Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rd-table-container">
                  <table className="rd-table">
                    <thead>
                      <tr>
                        <th><span>User ID</span></th>
                        <th><span>Email</span></th>
                        <th><span>Risk Score</span></th>
                        <th><span>Flags</span></th>
                        <th><span>Last Activity</span></th>
                        <th><span>Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fraudAnalysis.map((user) => (
                        <tr key={user.id}>
                          <td>{user.userId}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className="rd-chip" style={{ backgroundColor: riskColor(user.riskScore) }}>
                              {user.riskScore}
                            </span>
                          </td>
                          <td>
                            <div className="rd-chip-container">
                              {user.flags.map((flag, i) => (
                                <span key={i} className="rd-chip">{flag}</span>
                              ))}
                            </div>
                          </td>
                          <td>{user.lastActivity}</td>
                          <td>
                            <div className="rd-action-btns">
                              <button className="rd-btn rd-btn-action" onClick={() => handleOpenExportDialog({ period: `Fraud Report - ${user.userId}` })}>
                                <DownloadIcon />
                              </button>
                              <button className="rd-btn rd-btn-action">
                                <DetailsIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabValue === 3 && (
              <div className="rd-table-container">
                <table className="rd-table">
                  <thead>
                    <tr>
                      <th><span>Feature</span></th>
                      <th><span>Usage Count</span></th>
                      <th><span>Unique Users</span></th>
                      <th><span>Satisfaction</span></th>
                      <th><span>Trend</span></th>
                      <th><span>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureUsage.map((feature) => (
                      <tr key={feature.id}>
                        <td>{feature.feature}</td>
                        <td>{feature.usageCount.toLocaleString()}</td>
                        <td>{feature.uniqueUsers.toLocaleString()}</td>
                        <td>
                          <div className="rd-satisfaction">
                            <span>{feature.satisfaction.toFixed(1)}</span>
                            <ChartIcon />
                          </div>
                        </td>
                        <td>
                          <span style={{ color: trendColor(feature.trend) }}>
                            {trendIcon(feature.trend)}
                          </span>
                        </td>
                        <td>
                          <div className="rd-action-btns">
                            <button className="rd-btn rd-btn-action" onClick={() => handleOpenExportDialog({ period: `Feature Usage - ${feature.feature}` })}>
                              <DownloadIcon />
                            </button>
                            <button className="rd-btn rd-btn-action">
                              <DetailsIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rd-sidebar">
            <h2>Recent Report Activity</h2>
            <div className="rd-activity-list">
              <div className="rd-activity-item">
                <div className="rd-activity-icon rd-activity-success">
                  <DownloadIcon />
                </div>
                <div className="rd-activity-text">
                  <span>Daily financial report generated</span>
                  <span className="rd-text-secondary">2 hours ago - 342 transactions</span>
                </div>
              </div>
              <div className="rd-activity-item">
                <div className="rd-activity-icon rd-activity-warning">
                  <FraudIcon />
                </div>
                <div className="rd-activity-text">
                  <span>New high-risk user detected</span>
                  <span className="rd-text-secondary">5 hours ago - Risk score: 92</span>
                </div>
              </div>
              <div className="rd-activity-item">
                <div className="rd-activity-icon rd-activity-info">
                  <TrendsIcon />
                </div>
                <div className="rd-activity-text">
                  <span>User growth report exported</span>
                  <span className="rd-text-secondary">Yesterday - CSV format</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rd-dialog" style={{ display: openExportDialog ? 'block' : 'none' }}>
          <div className="rd-dialog-backdrop" onClick={handleCloseExportDialog}></div>
          <div className="rd-dialog-content">
            <h3>Export Report</h3>
            <p>Export {selectedReport?.period || 'selected'} data in your preferred format.</p>
            <div className="rd-form-field">
              <label>Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="rd-dialog-actions">
              <button className="rd-btn rd-btn-cancel" onClick={handleCloseExportDialog}>
                Cancel
              </button>
              <button className="rd-btn rd-btn-confirm" onClick={handleExport}>
                <DownloadIcon />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ReportsDashboard;