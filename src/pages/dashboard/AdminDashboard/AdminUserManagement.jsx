import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon, PersonAdd as PersonAddIcon,
  CheckCircle as ActiveIcon, Warning as WarningIcon, 
  Lock as SuspendedIcon, Schedule as PendingIcon, 
  Search as SearchIcon, FilterList as FilterIcon, 
  Refresh as RefreshIcon, MoreVert as MoreIcon,
  Add as AddIcon, Upload as UploadIcon, Login as ImpersonateIcon,
  Password as PasswordIcon, LockOpen as UnlockIcon,
  School as CourseIcon, Message as MessageIcon, Close as CloseIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import API_BASE_URL, { userAPI, coursesAPI, messagingAPI } from '../../../config';


import UserRegistration from './UserRegistration';
import BulkUserUpload from './BulkUserUpload';
import UserGroupsManagement from './UserGroupsManagement';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCourseEnrollment, setShowCourseEnrollment] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    dateFrom: null,
    dateTo: null
  });
  const [tabValue, setTabValue] = useState(0);
  const [userActivities, setUserActivities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    type: 'general'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        page_size: rowsPerPage,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { date_from: filters.dateFrom?.toISOString().split('T')[0] }),
        ...(filters.dateTo && { date_to: filters.dateTo?.toISOString().split('T')[0] })
      };
      const response = await userAPI.getUsers(params);
      setUsers(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.links?.next || null,
        previous: response.data.links?.previous || null,
        currentPage: pagination.currentPage
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
      });
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId) => {
    try {
      const response = await userAPI.getUserActivities({ user_id: userId });
      setUserActivities(response.data.results || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch user activities',
        severity: 'error'
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      setCourses(response.data.results || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch courses',
        severity: 'error'
      });
    }
  };

  const fetchUserEnrollments = async (userId) => {
    try {
      const response = await coursesAPI.getUserEnrollments(userId);
      setUserEnrollments(response.data.results || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch user enrollments',
        severity: 'error'
      });
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messagingAPI.getMessages({ recipient_id: userId });
      setMessages(response.data.results || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch messages',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [pagination.currentPage, rowsPerPage, filters]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivities(selectedUser.id);
      fetchUserEnrollments(selectedUser.id);
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleImpersonate = async (userId) => {
    setSnackbar({
      open: true,
      message: 'Impersonation not implemented yet',
      severity: 'warning'
    });
  };

  const handlePasswordReset = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      await authAPI.resetPassword({ email: user.email });
      setSnackbar({
        open: true,
        message: 'Password reset email sent successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to send password reset email',
        severity: 'error'
      });
    }
  };

  const handleAccountLock = async (userId, lock) => {
    try {
      await userAPI.updateUser(userId, { is_locked: lock });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_locked: lock } : user
      ));
      setSnackbar({
        open: true,
        message: `Account ${lock ? 'locked' : 'unlocked'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${lock ? 'lock' : 'unlock'} account`,
        severity: 'error'
      });
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      await coursesAPI.adminSingleEnroll(courseId, { user_id: selectedUser.id });
      await fetchUserEnrollments(selectedUser.id);
      setSnackbar({
        open: true,
        message: 'User enrolled in course successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to enroll user in course',
        severity: 'error'
      });
    }
  };

  const handleDisenrollCourse = async (enrollmentId) => {
    setSnackbar({
      open: true,
      message: 'Course disenrollment not implemented yet',
      severity: 'warning'
    });
  };

  const handleSendMessage = async () => {
    try {
      await messagingAPI.createMessage({
        recipient_id: selectedUser.id,
        subject: newMessage.subject,
        content: newMessage.content,
        type: newMessage.type
      });
      setNewMessage({ subject: '', content: '', type: 'general' });
      await fetchMessages(selectedUser.id);
      setSnackbar({
        open: true,
        message: 'Message sent successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to send message',
        severity: 'error'
      });
    }
  };

  const resetLoginAttempts = async (userId) => {
    try {
      await userAPI.updateUser(userId, { login_attempts: 0 });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, login_attempts: 0 } : user
      ));
      setSnackbar({
        open: true,
        message: 'Login attempts reset successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to reset login attempts',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action) => {
    setActionType(action);
    if (action === 'courses' || action === 'messages') {
      setShowCourseEnrollment(action === 'courses');
      setShowMessaging(action === 'messages');
    } else {
      setOpenConfirmModal(true);
    }
    handleMenuClose();
  };

  const handleConfirmAction = async () => {
    setActionError(null);
    if (!selectedUser) {
      setActionError('No user selected');
      return;
    }
    try {
      if (actionType === 'delete') {
        await userAPI.deleteUser(selectedUser.id);
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        setPagination(prev => ({ ...prev, count: prev.count - 1 }));
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
      } else if (actionType === 'impersonate') {
        await handleImpersonate(selectedUser.id);
      } else if (actionType === 'reset_password') {
        await handlePasswordReset(selectedUser.id);
      } else if (actionType === 'lock' || actionType === 'unlock') {
        await handleAccountLock(selectedUser.id, actionType === 'lock');
      } else {
        const newStatus = actionType === 'suspend' ? 'suspended' : 'active';
        await userAPI.updateUser(selectedUser.id, { status: newStatus });
        setUsers(prev => prev.map(user =>
          user.id === selectedUser.id ? { ...user, status: newStatus } : user
        ));
        setSnackbar({
          open: true,
          message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`,
          severity: 'success'
        });
      }
      setOpenConfirmModal(false);
      setSelectedUser(null);
    } catch (err) {
      setActionError(err.message || 'Failed to perform action');
    }
  };

  const handleCancelAction = () => {
    setOpenConfirmModal(false);
    setActionType(null);
    setActionError(null);
  };

  const StatusChip = ({ status }) => {
    const statusMap = {
      active: { className: 'aum-status active', icon: <ActiveIcon /> },
      pending: { className: 'aum-status warning', icon: <PendingIcon /> },
      suspended: { className: 'aum-status error', icon: <SuspendedIcon /> }
    };
    return (
      <span className={statusMap[status]?.className || 'aum-status'}>
        {statusMap[status]?.icon}
        {status}
      </span>
    );
  };

  const RoleChip = ({ role }) => {
    const roleMap = {
      admin: { className: 'aum-chip primary', label: 'Admin' },
      instructor: { className: 'aum-chip secondary', label: 'Instructor' },
      learner: { className: 'aum-chip default', label: 'Learner' },
      owner: { className: 'aum-chip info', label: 'Owner' }
    };
    return (
      <span className={roleMap[role]?.className || 'aum-chip'}>
        {roleMap[role]?.label || role}
      </span>
    );
  };

  const handleAddUser = async (newUser) => {
    try {
      const response = await userAPI.createUser(newUser);
      setUsers(prev => [...prev, {
        ...response.data,
        last_login: null,
        last_login_ip: null,
        last_login_device: null,
        signup_date: new Date().toISOString(),
        login_attempts: 0,
        status: 'active'
      }]);
      setPagination(prev => ({ ...prev, count: prev.count + 1 }));
      setShowRegistrationForm(false);
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || err.message || 'Failed to add user',
        severity: 'error'
      });
    }
  };

  const getInitial = (user) => {
    if (!user) return '?';
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  const handleBulkUpload = async () => {
    try {
      await fetchUsers();
      setShowBulkUpload(false);
      setSnackbar({
        open: true,
        message: 'Users uploaded successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to refresh user list after upload',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getActiveUsersCount = () => users.filter(u => u.status === 'active').length;
  const getNewSignupsCount = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return users.filter(u => u.signup_date && new Date(u.signup_date) > thirtyDaysAgo).length;
  };
  const getSuspiciousActivityCount = () => users.filter(u => u.login_attempts > 0).length;

  const stats = [
    { title: 'Total Users', value: pagination.count, icon: <PeopleIcon />, change: '+12% from last month' },
    { title: 'Active Users', value: getActiveUsersCount(), icon: <ActiveIcon />, change: 'Active in last 30 days' },
    { title: 'New Signups', value: getNewSignupsCount(), icon: <PersonAddIcon />, change: 'This month' },
    { title: 'Suspicious Activity', value: getSuspiciousActivityCount(), icon: <WarningIcon />, change: 'Failed login attempts' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="aum-container">
        {snackbar.open && (
          <div className={`aum-alert aum-alert-${snackbar.severity}`}>
            <span>{snackbar.message}</span>
            <button onClick={handleCloseSnackbar} className="aum-alert-close">
              <CloseIcon />
            </button>
          </div>
        )}

        <h1 className="aum-title">User Management</h1>

        <div className="aum-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="aum-stat-card">
              <div className="aum-stat-header">
                <span>{stat.title}</span>
                <div className="aum-stat-icon">{stat.icon}</div>
              </div>
              <h3>{stat.value}</h3>
              <span className="aum-stat-change">{stat.change}</span>
            </div>
          ))}
        </div>

        <div className="aum-actions">
          <button className="aum-btn aum-btn-primary" onClick={() => setShowRegistrationForm(true)}>
            <AddIcon /> Add User
          </button>
          <button className="aum-btn aum-btn-secondary" onClick={() => setShowBulkUpload(true)}>
            <UploadIcon /> Bulk Upload
          </button>
        </div>

        <div className="aum-filters">
          <div className="aum-filter-item">
            <div className="aum-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="aum-filter-item">
            <label>Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="learner">Learner</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div className="aum-filter-item">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="aum-filter-item">
            <label>From</label>
            <DatePicker
              value={filters.dateFrom}
              onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
              renderInput={({ inputRef, inputProps }) => (
                <input ref={inputRef} {...inputProps} className="aum-date-input" />
              )}
            />
          </div>
          <div className="aum-filter-item">
            <label>To</label>
            <DatePicker
              value={filters.dateTo}
              onChange={(newValue) => handleFilterChange('dateTo', newValue)}
              renderInput={({ inputRef, inputProps }) => (
                <input ref={inputRef} {...inputProps} className="aum-date-input" />
              )}
            />
          </div>
          <div className="aum-filter-buttons">
            <button
              className="aum-btn aum-btn-icon"
              onClick={() => {
                setFilters({
                  role: 'all',
                  status: 'all',
                  search: '',
                  dateFrom: null,
                  dateTo: null
                });
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <RefreshIcon />
            </button>
            <button className="aum-btn aum-btn-icon">
              <FilterIcon />
            </button>
          </div>
        </div>

        <div className="aum-table-container">
          <table className="aum-table">
            <thead>
              <tr>
                <th><span>User</span></th>
                <th><span>Role</span></th>
                <th><span>Status</span></th>
                <th><span>Signup Date</span></th>
                <th><span>Login Attempts</span></th>
                <th><span>Locked</span></th>
                <th><span>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="aum-loading">
                    <div className="aum-spinner"></div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="aum-error">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="aum-no-data">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="aum-user-cell">
                        <div
                          className="aum-avatar"
                          onClick={() => navigate(`/admin/learner-profile/${user.id}`)}
                        >
                          {getInitial(user)}
                        </div>
                        <div>
                          <span>{user.first_name} {user.last_name}</span>
                          <span className="aum-text-secondary">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><RoleChip role={user.role} /></td>
                    <td><StatusChip status={user.status} /></td>
                    <td>{new Date(user.signup_date).toLocaleDateString()}</td>
                    <td>
                      {user.login_attempts > 0 ? (
                        <span
                          className="aum-chip error clickable"
                          onClick={() => resetLoginAttempts(user.id)}
                          title="Click to reset"
                        >
                          {user.login_attempts}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`aum-chip ${user.is_locked ? 'error' : 'success'}`}>
                        {user.is_locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </td>
                    <td>
                      <div className="aum-action-btns">
                        <button
                          className="aum-btn aum-btn-icon"
                          onClick={(event) => handleMenuOpen(event, user)}
                        >
                          <MoreIcon />
                        </button>
                        <div
                          className="aum-menu"
                          style={{ display: anchorEl && selectedUser?.id === user.id ? 'block' : 'none' }}
                        >
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('activate')}
                            disabled={user.status === 'active'}
                          >
                            Activate
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('suspend')}
                            disabled={user.status === 'suspended'}
                          >
                            Suspend
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('delete')}
                          >
                            Delete
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('impersonate')}
                          >
                            Impersonate
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('reset_password')}
                          >
                            Reset Password
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect(user.is_locked ? 'unlock' : 'lock')}
                          >
                            {user.is_locked ? 'Unlock' : 'Lock'} Account
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => {
                              resetLoginAttempts(user.id);
                              handleMenuClose();
                            }}
                            disabled={user.login_attempts === 0}
                          >
                            Reset Login Attempts
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('courses')}
                          >
                            Manage Courses
                          </button>
                          <button
                            className="aum-menu-item"
                            onClick={() => handleActionSelect('messages')}
                          >
                            Messages
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="aum-pagination">
            <div className="aum-items-per-page">
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
            <div className="aum-page-navigation">
              <span>
                {((pagination.currentPage - 1) * rowsPerPage + 1)}-
                {Math.min(pagination.currentPage * rowsPerPage, pagination.count)} of {pagination.count}
              </span>
              <div className="aum-page-btns">
                <button
                  onClick={() => handleChangePage(null, pagination.currentPage - 2)}
                  disabled={pagination.currentPage === 1}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() => handleChangePage(null, pagination.currentPage)}
                  disabled={pagination.currentPage * rowsPerPage >= pagination.count}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="aum-details">
            <h2>User Details: {selectedUser.first_name} {selectedUser.last_name}</h2>
            <div className="aum-tabs">
              <button
                className={`aum-tab ${tabValue === 0 ? 'active' : ''}`}
                onClick={() => setTabValue(0)}
              >
                Activity Logs
              </button>
              <button
                className={`aum-tab ${tabValue === 1 ? 'active' : ''}`}
                onClick={() => setTabValue(1)}
              >
                Course Enrollments
              </button>
              <button
                className={`aum-tab ${tabValue === 2 ? 'active' : ''}`}
                onClick={() => setTabValue(2)}
              >
                Messages
              </button>
            </div>
            {tabValue === 0 && (
              <div className="aum-list">
                {userActivities.length > 0 ? (
                  userActivities.map((activity) => (
                    <div key={activity.id} className="aum-list-item">
                      <div className="aum-list-avatar">
                        {activity.activity_type === 'login' ? <LoginIcon /> : <PeopleIcon />}
                      </div>
                      <div className="aum-list-content">
                        <span>{activity.activity_type} - {activity.status}</span>
                        <span className="aum-text-secondary">
                          {activity.details} ({new Date(activity.timestamp).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="aum-no-data">No activity logs found</div>
                )}
              </div>
            )}
            {tabValue === 1 && (
              <div>
                <h3>Enrolled Courses</h3>
                <div className="aum-list">
                  {userEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="aum-list-item">
                      <div className="aum-list-avatar">
                        <CourseIcon />
                      </div>
                      <div className="aum-list-content">
                        <span>{enrollment.course.title}</span>
                        <span className="aum-text-secondary">
                          Enrolled on: {new Date(enrollment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        className="aum-btn aum-btn-icon"
                        onClick={() => handleDisenrollCourse(enrollment.id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tabValue === 2 && (
              <div>
                <h3>Message History</h3>
                <div className="aum-list">
                  {messages.map((message) => (
                    <div key={message.id} className="aum-list-item">
                      <div className="aum-list-avatar">
                        <MessageIcon />
                      </div>
                      <div className="aum-list-content">
                        <span>{message.subject}</span>
                        <span className="aum-text-secondary">
                          {message.content} ({new Date(message.created_at).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="aum-groups">
          <UserGroupsManagement users={users} />
        </div>

        <div className="aum-dialog" style={{ display: openConfirmModal ? 'block' : 'none' }}>
          <div className="aum-dialog-backdrop" onClick={handleCancelAction}></div>
          <div className="aum-dialog-content">
            <div className="aum-dialog-header">
              <h3>
                {actionType === 'delete' ? 'Delete User' : 
                 actionType === 'suspend' ? 'Suspend User' :
                 actionType === 'impersonate' ? 'Impersonate User' :
                 actionType === 'reset_password' ? 'Reset Password' :
                 actionType === 'lock' ? 'Lock Account' :
                 actionType === 'unlock' ? 'Unlock Account' : 'Activate User'}
              </h3>
              <button className="aum-dialog-close" onClick={handleCancelAction}>
                <CloseIcon />
              </button>
            </div>
            <div className="aum-dialog-body">
              {actionError && (
                <div className="aum-alert aum-alert-error">{actionError}</div>
              )}
              {selectedUser ? (
                <p>
                  Are you sure you want to {actionType} the user <strong>{selectedUser.email}</strong>?
                  {actionType === 'delete' && ' This action cannot be undone.'}
                  {actionType === 'impersonate' && ' You will be logged in as this user.'}
                </p>
              ) : (
                <p className="aum-error">No user selected</p>
              )}
            </div>
            <div className="aum-dialog-actions">
              <button className="aum-btn aum-btn-cancel" onClick={handleCancelAction}>
                Cancel
              </button>
              <button
                className={`aum-btn ${actionType === 'delete' ? 'aum-btn-error' : 'aum-btn-confirm'}`}
                onClick={handleConfirmAction}
                disabled={!selectedUser}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>

        <div className="aum-dialog" style={{ display: showCourseEnrollment ? 'block' : 'none' }}>
          <div className="aum-dialog-backdrop" onClick={() => setShowCourseEnrollment(false)}></div>
          <div className="aum-dialog-content aum-dialog-wide">
            <div className="aum-dialog-header">
              <h3>Manage Course Enrollments</h3>
              <button className="aum-dialog-close" onClick={() => setShowCourseEnrollment(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="aum-dialog-body">
              <label>Available Courses</label>
              <select
                onChange={(e) => handleEnrollCourse(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses
                  .filter(course => !userEnrollments.some(e => e.course.id === course.id))
                  .map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="aum-dialog" style={{ display: showMessaging ? 'block' : 'none' }}>
          <div className="aum-dialog-backdrop" onClick={() => setShowMessaging(false)}></div>
          <div className="aum-dialog-content aum-dialog-wide">
            <div className="aum-dialog-header">
              <h3>Send Message</h3>
              <button className="aum-dialog-close" onClick={() => setShowMessaging(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="aum-dialog-body">
              <div className="aum-form-field">
                <label>Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
              </div>
              <div className="aum-form-field">
                <label>Message</label>
                <textarea
                  rows="4"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                ></textarea>
              </div>
              <div className="aum-form-field">
                <label>Message Type</label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="alert">Alert</option>
                  <option value="notification">Notification</option>
                </select>
              </div>
              <button
                className="aum-btn aum-btn-confirm"
                onClick={handleSendMessage}
                disabled={!newMessage.subject || !newMessage.content}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="aum-roles-permissions">
          <h2>User Roles & Permissions Overview</h2>
          <div className="aum-roles-grid">
            <div className="aum-role-card">
              <h3>Administrators</h3>
              <p className="aum-text-secondary">
                {users.filter(u => u.role === 'admin').length} users • Full system access
              </p>
              <p>Can manage all users, courses, and system settings</p>
            </div>
            <div className="aum-role-card">
              <h3>Instructors</h3>
              <p className="aum-text-secondary">
                {users.filter(u => u.role === 'instructor').length} users • Can create and manage courses
              </p>
              <p>Can create course content, manage learners, and view analytics</p>
            </div>
            <div className="aum-role-card">
              <h3>Learners</h3>
              <p className="aum-text-secondary">
                {users.filter(u => u.role === 'learner').length} users • Can enroll in courses
              </p>
              <p>Can browse courses, enroll in programs, and track progress</p>
            </div>
          </div>
        </div>

        <div className="aum-dialog" style={{ display: showRegistrationForm ? 'block' : 'none' }}>
          <div className="aum-dialog-backdrop" onClick={() => setShowRegistrationForm(false)}></div>
          <div className="aum-dialog-content aum-dialog-wide">
            <div className="aum-dialog-header">
              <h3>Register New User</h3>
              <button className="aum-dialog-close" onClick={() => setShowRegistrationForm(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="aum-dialog-body">
              <UserRegistration onRegister={handleAddUser} />
            </div>
          </div>
        </div>

        <div className="aum-dialog" style={{ display: showBulkUpload ? 'block' : 'none' }}>
          <div className="aum-dialog-backdrop" onClick={() => setShowBulkUpload(false)}></div>
          <div className="aum-dialog-content aum-dialog-wide">
            <div className="aum-dialog-header">
              <h3>Bulk User Upload</h3>
              <button className="aum-dialog-close" onClick={() => setShowBulkUpload(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="aum-dialog-body">
              <BulkUserUpload onUpload={handleBulkUpload} />
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AdminUserManagement;