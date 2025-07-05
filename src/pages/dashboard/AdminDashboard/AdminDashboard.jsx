import React, { useState, useEffect } from 'react';
import {
  Refresh as RefreshIcon, People as UsersIcon, School as CoursesIcon,
  CreditCard as PaymentsIcon, Assessment as AnalyticsIcon,
  EventNote as ScheduleIcon, Email as MessagesIcon, Feedback as FeedbackIcon,
  FactCheck as IQAIcon, Notifications as AlertsIcon, Storage as DatabaseIcon,
  BarChart as StatsIcon, LibraryBooks as ContentIcon,
  GroupWork as GroupsIcon, VerifiedUser as CertificatesIcon,
  Timeline as ActivityIcon, Settings as SettingsIcon,
  CheckCircle as SuccessIcon, Warning as WarningIcon,
  Error as ErrorIcon, Info as InfoIcon, Campaign as AdvertsIcon,
  MoreVert as MoreIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as VisibilityIcon, Search as SearchIcon, FilterList as FilterIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
  Tooltip, Link, Chip, Autocomplete, Checkbox, FormControlLabel, 
  FormGroup, Divider, useMediaQuery, IconButton, Stack, 
  Collapse, Card, CardContent, CardActions, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, TablePagination, Grid,
  LinearProgress, CircularProgress, Badge,
} from '@mui/material';
import { isSuperAdmin, userAPI, coursesAPI, paymentAPI, messagingAPI, scheduleAPI, groupsAPI, advertAPI } from '../../../config';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './AdminDashboard.css';

dayjs.extend(relativeTime);

// StatusChip component for user status
const StatusChip = ({ status }) => {
  const statusMap = {
    active: { color: 'success', icon: <SuccessIcon fontSize="small" /> },
    pending: { color: 'warning', icon: <WarningIcon fontSize="small" /> },
    suspended: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
  };

  return (
    <span className={`ad-chip ad-chip-${statusMap[status]?.color || 'default'}`}>
      {statusMap[status]?.icon}
      {status}
    </span>
  );
};

// RoleChip component for user roles
const RoleChip = ({ role }) => {
  const roleMap = {
    admin: { color: 'primary', label: 'Admin' },
    instructor: { color: 'secondary', label: 'Instructor' },
    learner: { color: 'default', label: 'Learner' },
    owner: { color: 'info', label: 'Owner' }
  };

  alert("Already Here")

  return (
    <span className={`ad-chip ad-chip-${roleMap[role]?.color || 'default'}`}>
      {roleMap[role]?.label || role}
    </span>
  );
};

// Helper function to get user initials for avatars
const getInitial = (user) => {
  if (!user) return '?';
  if (user.first_name) return user.first_name.charAt(0).toUpperCase();
  return user.email?.charAt(0).toUpperCase() || '?';
};

// Helper function to format course prices
const formatPrice = (price, currency) => {
  if (price === undefined || price === null) return 'Free';
  const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
  const currencyToUse = currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyToUse
    }).format(priceNumber);
  } catch (e) {
    return `${currencyToUse} ${priceNumber.toFixed(2)}`;
  }
};

// Helper function to get color for course status chips
const getStatusColor = (status) => {
  switch (status) {
    case 'Published': return 'success';
    case 'Draft': return 'warning';
    case 'Archived': return 'default';
    default: return 'info';
  }
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'success': return <SuccessIcon className="ad-icon-success" fontSize="small" />;
    case 'warning': return <WarningIcon className="ad-icon-warning" fontSize="small" />;
    case 'error': return <ErrorIcon className="ad-icon-error" fontSize="small" />;
    default: return <InfoIcon className="ad-icon-info" fontSize="small" />;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [faqStats, setFAQStats] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({
    count: 0,
    currentPage: 1
  });
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursePagination, setCoursePagination] = useState({
    count: 0,
    currentPage: 1
  });
  const [coursesPerPage, setCoursesPerPage] = useState(10);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [courseFilters, setCourseFilters] = useState({
    status: 'all',
    search: ''
  });
  const [courseAnchorEl, setCourseAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [certificateStats, setCertificateStats] = useState(null);
  const [advertStats, setAdvertStats] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        userStats,
        courseStats,
        recentUsersRes,
        popularCoursesRes,
        activitiesRes,
        messagesRes,
        schedulesRes,
        paymentsRes,
        groupsRes,
        certificatesRes,
        advertsRes,
        totalMessagesRes,
        totalSchedulesRes,
        faqStatsRes
      ] = await Promise.all([
        userAPI.getUserStats(),
        coursesAPI.getCourses(),
        fetchUsers(1, usersPerPage, userFilters),
        fetchCourses(1, coursesPerPage, courseFilters),
        userAPI.getUserActivities({ limit: 10 }),
        messagingAPI.getUnreadCount(),
        scheduleAPI.getUpcomingSchedules(),
        paymentAPI.getPaymentConfig(),
        groupsAPI.getGroups({ limit: 10 }),
        coursesAPI.getCertificates(),
        advertAPI.getAdverts(),
        messagingAPI.getTotalMessages(),
        scheduleAPI.getTotalSchedules(),
        coursesAPI.getFAQStats()
      ]);

      setStats({
        users: userStats.data,
        courses: courseStats.data
      });
      setRecentActivities(activitiesRes.data.results);
      setUnreadMessages(messagesRes.data.count);
      setTotalMessages(totalMessagesRes.data.total_messages);
      setUpcomingSchedules(schedulesRes.data);
      setTotalSchedules(totalSchedulesRes.data.total_schedule);
      setPaymentData(paymentsRes.data);
      setGroupStats(groupsRes.data);
      setCertificateStats(certificatesRes.data);
      setAdvertStats(advertsRes.data);
      setFAQStats(faqStatsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page, pageSize, filters) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };
      const response = await userAPI.getUsers(params);
      setUsers(response.data.results || []);
      setUserPagination({
        count: response.data.count || 0,
        currentPage: page
      });
      return response;
    } catch (err) {
      setUserError(err.message);
      setUsers([]);
      setUserPagination({
        count: 0,
        currentPage: 1
      });
      throw err;
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCourses = async (page, pageSize, filters) => {
    setCourseLoading(true);
    setCourseError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };
      const response = await coursesAPI.getCourses(params);
      setCourses(response.data.results || []);
      setCoursePagination({
        count: response.data.count || 0,
        currentPage: page
      });
      return response;
    } catch (err) {
      setCourseError(err.message);
      setCourses([]);
      setCoursePagination({
        count: 0,
        currentPage: 1
      });
      throw err;
    } finally {
      setCourseLoading(false);
    }
  };

  const handleUserPageChange = (event, newPage) => {
    fetchUsers(newPage + 1, usersPerPage, userFilters);
  };

  const handleUsersPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    setUsersPerPage(newPerPage);
    fetchUsers(1, newPerPage, userFilters);
  };

  const handleCoursePageChange = (event, newPage) => {
    fetchCourses(newPage + 1, coursesPerPage, courseFilters);
  };

  const handleCoursesPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    setCoursesPerPage(newPerPage);
    fetchCourses(1, newPerPage, courseFilters);
  };

  const handleUserFilterChange = (name, value) => {
    const newFilters = { ...userFilters, [name]: value };
    setUserFilters(newFilters);
    fetchUsers(1, usersPerPage, newFilters);
  };

  const handleCourseFilterChange = (name, value) => {
    const newFilters = { ...courseFilters, [name]: value };
    setCourseFilters(newFilters);
    fetchCourses(1, coursesPerPage, newFilters);
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

  const handleUserMenuOpen = (event, user) => {
    setUserAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleUserActionSelect = (action) => {
    setActionType(action);
    setOpenConfirmModal(true);
    handleUserMenuClose();
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
        setUserPagination(prev => ({ ...prev, count: prev.count - 1 }));
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
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

  const handleCourseMenuOpen = (event, course) => {
    setCourseAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleCourseMenuClose = () => {
    setCourseAnchorEl(null);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/courses/edit/${courseId}`);
    handleCourseMenuClose();
  };

  const handleViewCourse = (courseId) => {
    navigate(`/admin/courses/view/${courseId}`);
    handleCourseMenuClose();
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await coursesAPI.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setCoursePagination(prev => ({ ...prev, count: prev.count - 1 }));
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete course',
        severity: 'error'
      });
    } finally {
      handleCourseMenuClose();
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUsers(1, usersPerPage, userFilters);
    fetchCourses(1, coursesPerPage, courseFilters);
  }, []);

  if (loading && !stats) {
    return (
      <div className="ad-container ad-loading">
        <div className="ad-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-container ad-error">
        <ErrorIcon className="ad-error-icon" />
        <span>{error}</span>
        <button className="ad-btn ad-btn-primary" onClick={fetchDashboardData}>
          <RefreshIcon />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ad-container">
      {snackbar.open && (
        <div className={`ad-alert ad-alert-${snackbar.severity}`}>
          <span>{snackbar.message}</span>
          <button onClick={handleCloseSnackbar} className="ad-alert-close">
            <ErrorIcon />
          </button>
        </div>
      )}

      <div className="ad-header">
        <h1>LMS Admin Dashboard</h1>
        <div className="ad-header-info">
          <div className="ad-info-item">
            <MessagesIcon />
            <span>Messages: <strong>{totalMessages}</strong> ({unreadMessages} unread)</span>
          </div>
          <div className="ad-info-item">
            <ScheduleIcon />
            <span>Schedules: <strong>{totalSchedules}</strong> ({upcomingSchedules.length} upcoming)</span>
          </div>
          <button className="ad-btn ad-btn-icon" onClick={fetchDashboardData} disabled={loading}>
            <RefreshIcon />
          </button>
        </div>
      </div>

      {loading && <div className="ad-progress-bar"></div>}

      <div className="ad-grid">
        <div className="ad-card">
          <div className="ad-card-header">
            <span>Total Users</span>
            <div className="ad-avatar">
              <UsersIcon />
            </div>
          </div>
          <h3>{stats?.users?.total_users || 0}</h3>
          <div className="ad-card-footer">
            <span>{stats?.users?.active_users || 0} active</span>
            <span className="ad-divider"></span>
            <span>{stats?.users?.new_users_today || 0} new today</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Total Courses</span>
            <div className="ad-avatar">
              <CoursesIcon />
            </div>
          </div>
          <h3>{stats?.courses?.count || 0}</h3>
          <div className="ad-card-footer">
            <span>{stats?.courses?.active_courses || 0} active</span>
            <span className="ad-divider"></span>
            <span>{stats?.courses?.total_all_enrollments || 0} enrollments</span>
          </div>
        </div>

        {isSuperAdmin() && (
          <div className="ad-card">
            <div className="ad-card-header">
              <span>Total Revenue</span>
              <div className="ad-avatar">
                <PaymentsIcon />
              </div>
            </div>
            <h3>${paymentData?.total_revenue?.toLocaleString() || '0'}</h3>
            <div className="ad-card-footer">
              <span>${paymentData?.monthly_revenue ? Object.values(paymentData.monthly_revenue).reduce((a, b) => a + b, 0).toLocaleString() : '0'} this month</span>
              <span className="ad-divider"></span>
              <span>{paymentData?.active_payment_methods?.length || 0} methods</span>
            </div>
          </div>
        )}

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Total Groups</span>
            <div className="ad-avatar">
              <GroupsIcon />
            </div>
          </div>
          <h3>{groupStats?.count || 0}</h3>
          <div className="ad-card-footer">
            <span>{groupStats?.results?.reduce((acc, group) => acc + (group.member_count || 0), 0) || 0} members</span>
            <span className="ad-divider"></span>
            <span>{groupStats?.results?.filter(g => g.is_active).length || 0} active</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Certificates</span>
            <div className="ad-avatar">
              <CertificatesIcon />
            </div>
          </div>
          <h3>{certificateStats?.count || 0}</h3>
          <div className="ad-card-footer">
            <span>{certificateStats?.results?.filter(c => dayjs(c.issued_at).isAfter(dayjs().subtract(30, 'day'))).length || 0} last 30d</span>
            <span className="ad-divider"></span>
            <span>{certificateStats?.results?.length || 0} issued</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Adverts</span>
            <div className="ad-avatar">
              <AdvertsIcon />
            </div>
          </div>
          <h3>{advertStats?.count || 0}</h3>
          <div className="ad-card-footer">
            <span>{advertStats?.advertStats || 0} clicks</span>
            <span className="ad-divider"></span>
            <span>{(advertStats?.average_ctr || 0).toFixed(2)}% CTR</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Messages</span>
            <div className="ad-avatar">
              <MessagesIcon />
            </div>
          </div>
          <h3>{totalMessages}</h3>
          <div className="ad-card-footer">
            <span>{unreadMessages} unread</span>
            <span className="ad-divider"></span>
            <span>{recentActivities.filter(a => a.action_type === 'message').length} recent</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Schedules</span>
            <div className="ad-avatar">
              <ScheduleIcon />
            </div>
          </div>
          <h3>{totalSchedules}</h3>
          <div className="ad-card-footer">
            <span>{upcomingSchedules.length} upcoming</span>
            <span className="ad-divider"></span>
            <span>{recentActivities.filter(a => a.action_type === 'schedule').length} recent</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>FAQs</span>
            <div className="ad-avatar">
              <ContentIcon />
            </div>
          </div>
          <h3>{faqStats?.total_faqs || 0}</h3>
          <div className="ad-card-footer">
            <span>{faqStats?.active_faqs || 0} active</span>
            <span className="ad-divider"></span>
            <span>{faqStats?.inactive_faqs || 0} inactive</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>Feedback</span>
            <div className="ad-avatar">
              <FeedbackIcon />
            </div>
          </div>
          <h3>{faqStats?.total_faqs || 0}</h3>
          <div className="ad-card-footer">
            <span>{faqStats?.active_faqs || 0} active</span>
            <span className="ad-divider"></span>
            <span>{faqStats?.inactive_faqs || 0} inactive</span>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span>IQA</span>
            <div className="ad-avatar">
              <IQAIcon />
            </div>
          </div>
          <h3>{faqStats?.total_faqs || 0}</h3>
          <div className="ad-card-footer">
            <span>{faqStats?.active_faqs || 0} active</span>
            <span className="ad-divider"></span>
            <span>{faqStats?.inactive_faqs || 0} inactive</span>
          </div>
        </div>
      </div>

      <div className="ad-tabs-container">
        <div className="ad-tabs">
          <button className={`ad-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
            <UsersIcon />
            Users
          </button>
          <button className={`ad-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
            <CoursesIcon />
            Courses
          </button>
          {isSuperAdmin() && (
            <button className={`ad-tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <PaymentsIcon />
              Payments
            </button>
          )}
          <button className={`ad-tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
            <ActivityIcon />
            Activity
          </button>
          <button className={`ad-tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>
            <MessagesIcon />
            Messages
          </button>
          <button className={`ad-tab ${activeTab === 5 ? 'active' : ''}`} onClick={() => setActiveTab(5)}>
            <ScheduleIcon />
            Schedules
          </button>
        </div>

        {activeTab === 0 && (
          <div className="ad-tab-content">
            <div className="ad-filter-container">
              <div className="ad-filter-grid">
                <div className="ad-search-input">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userFilters.search}
                    onChange={(e) => handleUserFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="ad-form-field">
                  <select
                    value={userFilters.role}
                    onChange={(e) => handleUserFilterChange('role', e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="learner">Learner</option>
                  </select>
                </div>
                <div className="ad-form-field">
                  <select
                    value={userFilters.status}
                    onChange={(e) => handleUserFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <button
                  className="ad-btn ad-btn-secondary"
                  onClick={() => {
                    setUserFilters({
                      role: 'all',
                      status: 'all',
                      search: ''
                    });
                    fetchUsers(1, usersPerPage, {
                      role: 'all',
                      status: 'all',
                      search: ''
                    });
                  }}
                >
                  <RefreshIcon />
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="ad-table-container">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th><span>User</span></th>
                    <th><span>Role</span></th>
                    <th><span>Status</span></th>
                    <th><span>Signup Date</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {userLoading ? (
                    <tr>
                      <td colSpan="5" className="ad-no-data">
                        <div className="ad-spinner"></div>
                      </td>
                    </tr>
                  ) : userError ? (
                    <tr>
                      <td colSpan="5" className="ad-no-data ad-error">{userError}</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="ad-no-data">No users found</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="ad-user-cell" onClick={() => navigate(`/admin/learner-profile/${user.id}`)}>
                            <div className="ad-avatar">{getInitial(user)}</div>
                            <div>
                              <span>{user.first_name} {user.last_name}</span>
                              <span className="ad-text-secondary">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><RoleChip role={user.role} /></td>
                        <td><StatusChip status={user.status} /></td>
                        <td>{new Date(user.signup_date).toLocaleDateString()}</td>
                        <td>
                          <div className="ad-action-btns">
                            <button
                              className="ad-btn ad-btn-icon"
                              onClick={(event) => handleUserMenuOpen(event, user)}
                            >
                              <MoreIcon />
                            </button>
                            <div className="ad-menu" style={{ display: userAnchorEl && selectedUser?.id === user.id ? 'block' : 'none' }}>
                              <button
                                className="ad-menu-item"
                                onClick={() => handleUserActionSelect('activate')}
                                disabled={user.status === 'active'}
                              >
                                Activate
                              </button>
                              <button
                                className="ad-menu-item"
                                onClick={() => handleUserActionSelect('suspend')}
                                disabled={user.status === 'suspended'}
                              >
                                Suspend
                              </button>
                              <button
                                className="ad-menu-item ad-menu-item-error"
                                onClick={() => handleUserActionSelect('delete')}
                              >
                                Delete
                              </button>
                              <button
                                className="ad-menu-item"
                                onClick={() => {
                                  resetLoginAttempts(user.id);
                                  handleUserMenuClose();
                                }}
                                disabled={user.login_attempts === 0}
                              >
                                Reset Login Attempts
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={userPagination.count}
                rowsPerPage={usersPerPage}
                page={userPagination.currentPage - 1}
                onPageChange={handleUserPageChange}
                onRowsPerPageChange={handleUsersPerPageChange}
              />
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="ad-tab-content">
            <div className="ad-filter-container">
              <div className="ad-filter-grid">
                <div className="ad-search-input">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseFilters.search}
                    onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="ad-form-field">
                  <select
                    value={courseFilters.status}
                    onChange={(e) => handleCourseFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <button
                  className="ad-btn ad-btn-secondary"
                  onClick={() => {
                    setCourseFilters({
                      status: 'all',
                      search: ''
                    });
                    fetchCourses(1, coursesPerPage, {
                      status: 'all',
                      search: ''
                    });
                  }}
                >
                  <RefreshIcon />
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="ad-table-container">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th><span>Title</span></th>
                    <th><span>Price</span></th>
                    <th><span>Status</span></th>
                    <th><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {courseLoading ? (
                    <tr>
                      <td colSpan="4" className="ad-no-data">
                        <div className="ad-spinner"></div>
                      </td>
                    </tr>
                  ) : courseError ? (
                    <tr>
                      <td colSpan="4" className="ad-no-data ad-error">{courseError}</td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="ad-no-data">No courses found</td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div className="ad-course-cell">
                            <span>{course.title}</span>
                            <span className="ad-text-secondary">{course.category?.name || 'No category'} • {course.level}</span>
                          </div>
                        </td>
                        <td>
                          {course.discount_price ? (
                            <>
                              <span className="ad-price-discounted">{formatPrice(course.price, course.currency)}</span>
                              <span className="ad-price">{formatPrice(course.discount_price, course.currency)}</span>
                            </>
                          ) : (
                            <span>{formatPrice(course.price, course.currency)}</span>
                          )}
                        </td>
                        <td>
                          <span className={`ad-chip ad-chip-${getStatusColor(course.status)}`}>
                            {course.status}
                          </span>
                        </td>
                        <td>
                          <div className="ad-action-btns">
                            <button
                              className="ad-btn ad-btn-icon ad-btn-edit"
                              onClick={() => handleEditCourse(course.id)}
                            >
                              <EditIcon />
                            </button>
                            <button
                              className="ad-btn ad-btn-icon ad-btn-view"
                              onClick={() => handleViewCourse(course.id)}
                            >
                              <VisibilityIcon />
                            </button>
                            <button
                              className="ad-btn ad-btn-icon ad-btn-delete"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={coursePagination.count}
                rowsPerPage={coursesPerPage}
                page={coursePagination.currentPage - 1}
                onPageChange={handleCoursePageChange}
                onRowsPerPageChange={handleCoursesPerPageChange}
              />
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="ad-tab-content">
            <div className="ad-grid">
              <div className="ad-section">
                <h3>Payment Methods</h3>
                {paymentData?.active_payment_methods?.length > 0 ? (
                  <div className="ad-list">
                    {paymentData.active_payment_methods.map((method) => (
                      <div key={method.name} className="ad-list-item">
                        <div className="ad-avatar">{method.name[0]}</div>
                        <div className="ad-list-item-content">
                          <span>{method.name}</span>
                          <span className="ad-text-secondary">{method.transaction_count} transactions • ${method.total_amount?.toLocaleString()}</span>
                        </div>
                        <span className={`ad-chip ad-chip-${method.is_live ? 'success' : 'default'}`}>
                          {method.is_live ? 'Live' : 'Test'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="ad-no-data">No payment methods configured</span>
                )}
              </div>
              <div className="ad-section">
                <h3>Recent Transactions</h3>
                {paymentData?.recent_transactions?.length > 0 ? (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th><span>Date</span></th>
                        <th><span>User</span></th>
                        <th><span>Amount</span></th>
                        <th><span>Status</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.recent_transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td>{tx.user_email}</td>
                          <td>${tx.amount.toFixed(2)}</td>
                          <td>
                            <span className={`ad-chip ad-chip-${tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'error' : 'default'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span className="ad-no-data">No recent transactions</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="ad-tab-content">
            <div className="ad-grid">
              <div className="ad-section">
                <h3>Recent Activities</h3>
                <div className="ad-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="ad-list-item">
                      <div className="ad-list-item-icon">{getStatusIcon(activity.action_type)}</div>
                      <div className="ad-list-item-content">
                        <span>{activity.description}</span>
                        <span className="ad-text-secondary">
                          {activity.user?.full_name || 'System'} • {new Date(activity.timestamp).toLocaleString()}
                        </span>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ad-section">
                <h3>Upcoming Events</h3>
                {upcomingSchedules.length > 0 ? (
                  <div className="ad-list">
                    {upcomingSchedules.map((event) => (
                      <div key={event.id} className="ad-list-item">
                        <div className="ad-avatar">
                          <ScheduleIcon />
                        </div>
                        <div className="ad-list-item-content">
                          <span>{event.title}</span>
                          <span className="ad-text-secondary">
                            {new Date(event.start_time).toLocaleString()} • {event.description.substring(0, 50)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="ad-no-data">No upcoming events</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="ad-tab-content">
            <h2>Messages Overview</h2>
            <div className="ad-grid">
              <div className="ad-card">
                <h3>{totalMessages}</h3>
                <span>Total Messages</span>
              </div>
              <div className="ad-card">
                <h3>{unreadMessages}</h3>
                <span>Unread Messages</span>
              </div>
              <div className="ad-card">
                <h3>{totalMessages > 0 ? Math.round((unreadMessages / totalMessages) * 100) : 0}%</h3>
                <span>Unread Percentage</span>
              </div>
              <div className="ad-card">
                <h3>{recentActivities.filter(a => a.action_type === 'message').length}</h3>
                <span>Recent Message Activities</span>
              </div>
            </div>
            <h3>Recent Messages</h3>
            {recentActivities.filter(a => a.action_type === 'message').length > 0 ? (
              <div className="ad-list">
                {recentActivities
                  .filter(a => a.action_type === 'message')
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div key={index} className="ad-list-item">
                      <div className="ad-avatar">
                        <MessagesIcon />
                      </div>
                      <div className="ad-list-item-content">
                        <span>{activity.description}</span>
                        <span className="ad-text-secondary">
                          {activity.user?.full_name || 'System'} • {dayjs(activity.timestamp).fromNow()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <span className="ad-no-data">No recent message activities</span>
            )}
          </div>
        )}

        {activeTab === 5 && (
          <div className="ad-tab-content">
            <h2>Schedules Overview</h2>
            <div className="ad-grid">
              <div className="ad-card">
                <h3>{totalSchedules}</h3>
                <span>Total Schedules</span>
              </div>
              <div className="ad-card">
                <h3>{upcomingSchedules.length}</h3>
                <span>Upcoming Schedules</span>
              </div>
              <div className="ad-card">
                <h3>{recentActivities.filter(a => a.action_type === 'schedule').length}</h3>
                <span>Recent Schedule Activities</span>
              </div>
            </div>
            <h3>Upcoming Schedules</h3>
            {upcomingSchedules.length > 0 ? (
              <div className="ad-table-container">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th><span>Title</span></th>
                      <th><span>Start Time</span></th>
                      <th><span>End Time</span></th>
                      <th><span>Description</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{schedule.title}</td>
                        <td>{new Date(schedule.start_time).toLocaleString()}</td>
                        <td>{new Date(schedule.end_time).toLocaleString()}</td>
                        <td>{schedule.description.substring(0, 50)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="ad-no-data">No upcoming schedules</span>
            )}
          </div>
        )}
      </div>

      <div className="ad-dialog" style={{ display: openConfirmModal ? 'block' : 'none' }}>
        <div className="ad-dialog-backdrop" onClick={handleCancelAction}></div>
        <div className="ad-dialog-content">
          <div className="ad-dialog-header">
            <h3>
              {actionType === 'delete' ? 'Delete User' : 
               actionType === 'suspend' ? 'Suspend User' : 'Activate User'}
            </h3>
            <button className="ad-dialog-close" onClick={handleCancelAction}>
              <ErrorIcon />
            </button>
          </div>
          <div className="ad-dialog-body">
            {actionError && (
              <div className="ad-alert ad-alert-error">
                <span>{actionError}</span>
                <button onClick={() => setActionError(null)} className="ad-alert-close">
                  <ErrorIcon />
                </button>
              </div>
            )}
            {selectedUser ? (
              <span>
                Are you sure you want to {actionType} the user <strong>{selectedUser.email}</strong>?
                {actionType === 'delete' && ' This action cannot be undone.'}
              </span>
            ) : (
              <span className="ad-error">No user selected</span>
            )}
          </div>
          <div className="ad-dialog-actions">
            <button className="ad-btn ad-btn-cancel" onClick={handleCancelAction}>Cancel</button>
            <button
              className={`ad-btn ${actionType === 'delete' ? 'ad-btn-error' : 'ad-btn-confirm'}`}
              onClick={handleConfirmAction}
              disabled={!selectedUser}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;