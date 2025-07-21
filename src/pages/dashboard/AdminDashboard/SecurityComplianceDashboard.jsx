import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  FilterList as FilterIcon,
  LockOpen as UnblockIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { securityComplianceAPI } from '../../../config';
import './SecurityComplianceDashboard.css';

const SecurityComplianceDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedLogins, setFailedLogins] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [vulnerabilityAlerts, setVulnerabilityAlerts] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [failedLoginsRes, blockedIPsRes, auditLogsRes, alertsRes, reportsRes, eventsRes, statsRes] = await Promise.all([
          securityComplianceAPI.getFailedLogins({ search: searchQuery, date_from: dateRange[0], date_to: dateRange[1] }),
          securityComplianceAPI.getBlockedIPs({ search: searchQuery, date_from: dateRange[0], date_to: dateRange[1] }),
          securityComplianceAPI.getAuditLogs({ search: searchQuery, date_from: dateRange[0], date_to: dateRange[1] }),
          securityComplianceAPI.getVulnerabilityAlerts({ search: searchQuery, date_from: dateRange[0], date_to: dateRange[1] }),
          securityComplianceAPI.getComplianceReports({ search: searchQuery }),
          securityComplianceAPI.getRecentSecurityEvents(),
          securityComplianceAPI.getSecurityDashboardStats(),
        ]);
        setFailedLogins(failedLoginsRes.data.results || []);
        setBlockedIPs(blockedIPsRes.data.results || []);
        setAuditLogs(auditLogsRes.data.results || []);
        setVulnerabilityAlerts(alertsRes.data.results || []);
        setComplianceReports(reportsRes.data.results || []);
        setRecentEvents(eventsRes.data.results || []);
        setDashboardStats(statsRes.data || {});
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, dateRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const handleViewDetails = (item, type) => {
    setSelectedDetails({ ...item, type });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDetails(null);
  };

  const handleResolveAlert = async (id) => {
    try {
      await securityComplianceAPI.resolveVulnerabilityAlert(id);
      setVulnerabilityAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: 'resolved' } : alert));
      toast.success('Vulnerability alert resolved');
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to resolve alert');
      toast.error(`Failed to resolve alert: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleGenerateReport = async (id) => {
    try {
      const response = await securityComplianceAPI.generateComplianceReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance_report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Compliance report generated successfully');
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to generate report');
      toast.error(`Failed to generate report: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleScheduleAudit = async (id) => {
    try {
      const auditDate = prompt('Enter audit date (YYYY-MM-DD):');
      if (!auditDate) return;
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(auditDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.');
      }
      await securityComplianceAPI.scheduleAudit(id, auditDate);
      setComplianceReports(prev => prev.map(report => report.id === id ? { ...report, nextAudit: auditDate } : report));
      toast.success('Audit scheduled successfully');
    } catch (err) {
      console.error('Failed to schedule audit:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to schedule audit');
      toast.error(`Failed to schedule audit: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleBlockIP = async (ip) => {
    try {
      await securityComplianceAPI.blockIP(ip);
      setFailedLogins(prev => prev.map(login => login.ip_address === ip ? { ...login, status: 'blocked' } : login));
      const blockedIPsRes = await securityComplianceAPI.getBlockedIPs({ search: searchQuery, date_from: dateRange[0], date_to: dateRange[1] });
      setBlockedIPs(blockedIPsRes.data.results || []);
      toast.success(`IP ${ip} blocked successfully`);
    } catch (err) {
      console.error('Failed to block IP:', err);
      const errorMessage = err.response?.data?.ip_address?.[0] || err.response?.data?.detail || err.message || 'Failed to block IP';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      await securityComplianceAPI.unblockIP(ip);
      setBlockedIPs(prev => prev.filter(blocked => blocked.ip_address !== ip));
      setFailedLogins(prev => prev.map(login => login.ip_address === ip ? { ...login, status: 'active' } : login));
      toast.success(`IP ${ip} unblocked successfully`);
    } catch (err) {
      console.error('Failed to unblock IP:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to unblock IP';
      setError(errorMessage);
      toast.error(errorMessage);
    }
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

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="scd-top-cards">
              <div className="scd-card">
                <h5>Failed Logins (24h)</h5>
                <div className="scd-card-content">
                  <WarningIcon className="scd-icon-large" />
                  <h3>{dashboardStats.failed_logins || 0}</h3>
                </div>
              </div>
              <div className="scd-card">
                <h5>Blocked IPs</h5>
                <div className="scd-card-content">
                  <LockIcon className="scd-icon-large" />
                  <h3>{dashboardStats.blocked_ips || 0}</h3>
                </div>
              </div>
              <div className="scd-card">
                <h5>Active Alerts</h5>
                <div className="scd-card-content">
                  <WarningIcon className="scd-icon-large" />
                  <h3>{dashboardStats.active_alerts || 0}</h3>
                </div>
              </div>
              <div className="scd-card">
                <h5>Audit Events (7d)</h5>
                <div className="scd-card-content">
                  <VisibilityIcon className="scd-icon-large" />
                  <h3>{dashboardStats.audit_events || 0}</h3>
                </div>
              </div>
              <div className="scd-card">
                <h5>Compliance Status</h5>
                <div className="scd-card-content">
                  <ComplianceIcon className="scd-icon-large" />
                  <h3>{dashboardStats.compliance_status || '0/0'}</h3>
                </div>
              </div>
              <div className="scd-card">
                <h5>Data Requests (30d)</h5>
                <div className="scd-card-content">
                  <HistoryIcon className="scd-icon-large" />
                  <h3>{dashboardStats.data_requests || 0}</h3>
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
                      {failedLogins.map((row) => {
                        const isBlocked = blockedIPs.some(blocked => blocked.ip_address === row.ip_address);
                        return (
                          <tr key={row.id}>
                            <td>{row.timestamp}</td>
                            <td>{row.ip_address}</td>
                            <td>{row.username}</td>
                            <td>{row.attempts}</td>
                            <td>
                              <span className={`scd-status ${statusColor(row.status)}`}>{row.status}</span>
                            </td>
                            <td>
                              <div className="scd-action-btns">
                                <button
                                  className={`scd-btn scd-btn-block ${isBlocked ? 'scd-btn-disabled' : ''}`}
                                  onClick={() => !isBlocked && handleBlockIP(row.ip_address)}
                                  title={isBlocked ? 'IP Already Blocked' : 'Block IP'}
                                  disabled={isBlocked}
                                >
                                  <BlockIcon />
                                </button>
                                <button className="scd-btn scd-btn-details" title="View details" onClick={() => handleViewDetails(row, 'failed_login')}>
                                  <DetailsIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                          <td>{row.ip_address}</td>
                          <td>{row.reason}</td>
                          <td>{row.timestamp}</td>
                          <td>{row.action}</td>
                          <td>
                            <div className="scd-action-btns">
                              <button
                                className="scd-btn scd-btn-unblock"
                                onClick={() => handleUnblockIP(row.ip_address)}
                                title="Unblock IP"
                              >
                                <UnblockIcon />
                              </button>
                              <button className="scd-btn scd-btn-details" title="View details" onClick={() => handleViewDetails(row, 'blocked_ip')}>
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
                              <button className="scd-btn scd-btn-details" title="View details" onClick={() => handleViewDetails(row, 'audit_log')}>
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
                              <button className="scd-btn scd-btn-details" title="View details" onClick={() => handleViewDetails(row, 'vulnerability_alert')}>
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
                              <button className="scd-btn scd-btn-view" title="Generate Report" onClick={() => handleGenerateReport(row.id)}>
                                <DownloadIcon />
                              </button>
                              <button className="scd-btn scd-btn-schedule" title="Schedule Audit" onClick={() => handleScheduleAudit(row.id)}>
                                <CalendarIcon />
                              </button>
                              <button className="scd-btn scd-btn-details" title="View details" onClick={() => handleViewDetails(row, 'compliance_report')}>
                                <DetailsIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="scd-sidebar">
                <h2>Recent Security Events</h2>
                <div className="scd-event-list">
                  {recentEvents.map((event, index) => (
                    <React.Fragment key={index}>
                      <div className="scuserdata: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    title?: string;
    bio?: string;
    status?: string;
  }d-event-item">
                        <div className="scd-event-icon">
                          <WarningIcon />
                        </div>
                        <div className="scd-event-text">
                          <span>{event.title}</span>
                          <span className="scd-text-secondary">{event.timestamp} - {event.details}</span>
                        </div>
                      </div>
                      {index < recentEvents.length - 1 && <div className="scd-event-divider"></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {isModalOpen && selectedDetails && (
              <div className="scd-modal">
                <div className="scd-modal-content">
                  <h2>{selectedDetails.type.replace('_', ' ').toUpperCase()} Details</h2>
                  <div className="scd-modal-body">
                    {selectedDetails.type === 'audit_log' && (
                      <>
                        <p><strong>Admin:</strong> {selectedDetails.admin}</p>
                        <p><strong>Action:</strong> {selectedDetails.action}</p>
                        <p><strong>Target:</strong> {selectedDetails.target}</p>
                        <p><strong>Timestamp:</strong> {selectedDetails.timestamp}</p>
                        <p><strong>Details:</strong> {selectedDetails.details}</p>
                        <p><strong>Status:</strong> {selectedDetails.status}</p>
                      </>
                    )}
                    {selectedDetails.type === 'vulnerability_alert' && (
                      <>
                        <p><strong>Severity:</strong> {selectedDetails.severity}</p>
                        <p><strong>Title:</strong> {selectedDetails.title}</p>
                        <p><strong>Component:</strong> {selectedDetails.component}</p>
                        <p><strong>Detected:</strong> {selectedDetails.detected}</p>
                        <p><strong>Status:</strong> {selectedDetails.status}</p>
                        <p><strong>Description:</strong> {selectedDetails.description || 'No description available'}</p>
                      </>
                    )}
                    {selectedDetails.type === 'compliance_report' && (
                      <>
                        <p><strong>Standard:</strong> {selectedDetails.type}</p>
                        <p><strong>Status:</strong> {selectedDetails.status}</p>
                        <p><strong>Last Audit:</strong> {selectedDetails.lastAudit}</p>
                        <p><strong>Next Audit:</strong> {selectedDetails.nextAudit}</p>
                        <p><strong>Details:</strong> {selectedDetails.details || 'No details available'}</p>
                      </>
                    )}
                    {selectedDetails.type === 'failed_login' && (
                      <>
                        <p><strong>Timestamp:</strong> {selectedDetails.timestamp}</p>
                        <p><strong>IP Address:</strong> {selectedDetails.ip_address}</p>
                        <p><strong>Username:</strong> {selectedDetails.username}</p>
                        <p><strong>Attempts:</strong> {selectedDetails.attempts}</p>
                        <p><strong>Status:</strong> {selectedDetails.status}</p>
                      </>
                    )}
                    {selectedDetails.type === 'blocked_ip' && (
                      <>
                        <p><strong>IP Address:</strong> {selectedDetails.ip_address}</p>
                        <p><strong>Reason:</strong> {selectedDetails.reason}</p>
                        <p><strong>Blocked At:</strong> {selectedDetails.timestamp}</p>
                        <p><strong>Action:</strong> {selectedDetails.action}</p>
                      </>
                    )}
                  </div>
                  <button className="scd-btn scd-btn-close" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default SecurityComplianceDashboard;