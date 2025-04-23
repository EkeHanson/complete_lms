import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Divider, LinearProgress,
  Chip, List, ListItem, ListItemText, ListItemIcon, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, useTheme, useMediaQuery, Avatar, Badge, CircularProgress,
  Tabs, Tab, Button, Stack, Skeleton
} from '@mui/material';
import {
  Refresh as RefreshIcon, People as UsersIcon, School as CoursesIcon,
  CreditCard as PaymentsIcon, Assessment as AnalyticsIcon,
  EventNote as ScheduleIcon, Email as MessagesIcon,
  Notifications as AlertsIcon, Storage as DatabaseIcon,
  BarChart as StatsIcon, LibraryBooks as ContentIcon,
  GroupWork as GroupsIcon, VerifiedUser as CertificatesIcon,
  Timeline as ActivityIcon, Settings as SettingsIcon,
  CheckCircle as SuccessIcon, Warning as WarningIcon,
  Error as ErrorIcon, Info as InfoIcon, Campaign as AdvertsIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { userAPI, coursesAPI, paymentAPI, messagingAPI, scheduleAPI, groupsAPI, advertAPI } from '../../../config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [certificateStats, setCertificateStats] = useState(null);
  const [advertStats, setAdvertStats] = useState(null);
  const [error, setError] = useState(null);

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
        advertsRes
      ] = await Promise.all([
        userAPI.getUserStats(),
        coursesAPI.getEnrollments(),
        userAPI.getUsers({ limit: 5, ordering: '-date_joined' }),
        coursesAPI.getCourses({ ordering: '-enrollment_count', limit: 5 }),
        userAPI.getUserActivities({ limit: 10 }),
        messagingAPI.getUnreadCount(),
        scheduleAPI.getUpcomingSchedules(),
        paymentAPI.getPaymentConfig(),
        groupsAPI.getGroups({ limit: 10 }),
        coursesAPI.getCertificates(),
        advertAPI.getAdverts()
      ]);

      setStats({
        users: userStats.data,
        courses: courseStats.data
      });
      setRecentUsers(recentUsersRes.data.results);
      setPopularCourses(popularCoursesRes.data.results);
      setRecentActivities(activitiesRes.data.results);
      setUnreadMessages(messagesRes.data.count);
      setUpcomingSchedules(schedulesRes.data);
      setPaymentData(paymentsRes.data);
      setGroupStats(groupsRes.data);
      setCertificateStats(certificatesRes.data);
      setAdvertStats(advertsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <SuccessIcon color="success" fontSize="small" />;
      case 'warning': return <WarningIcon color="warning" fontSize="small" />;
      case 'error': return <ErrorIcon color="error" fontSize="small" />;
      default: return <InfoIcon color="info" fontSize="small" />;
    }
  };

  const renderUserStatsChart = () => {
    if (!stats?.users?.role_distribution) return null;

    const data = Object.entries(stats.users.role_distribution).map(([role, count]) => ({
      name: role,
      value: count
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderEnrollmentTrends = () => {
    if (!stats?.courses?.monthly_trends) return null;

    const data = Object.entries(stats.courses.monthly_trends).map(([month, count]) => ({
      name: month,
      enrollments: count
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip />
          <Area type="monotone" dataKey="enrollments" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderRevenueChart = () => {
    if (!paymentData?.monthly_revenue) return null;

    const data = Object.entries(paymentData.monthly_revenue).map(([month, amount]) => ({
      name: month,
      revenue: amount
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
          <Legend />
          <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading && !stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={400} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={4} md={2} key={item}>
              <Skeleton variant="rectangular" width="100%" height={100} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={fetchDashboardData} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          LMS Admin Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchDashboardData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards - Smaller and More Compact */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Users Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 24, height: 24 }}>
                <UsersIcon sx={{ fontSize: 16, color: theme.palette.primary.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stats?.users?.total_users || 0}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {stats?.users?.active_users || 0} active
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {stats?.users?.new_users_today || 0} new today
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Courses Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Courses</Typography>
              <Avatar sx={{ bgcolor: theme.palette.secondary.light, width: 24, height: 24 }}>
                <CoursesIcon sx={{ fontSize: 16, color: theme.palette.secondary.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stats?.courses?.total_courses || 0}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {stats?.courses?.active_courses || 0} active
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {stats?.courses?.total_enrollments || 0} enrollments
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
              <Avatar sx={{ bgcolor: theme.palette.success.light, width: 24, height: 24 }}>
                <PaymentsIcon sx={{ fontSize: 16, color: theme.palette.success.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              ${paymentData?.total_revenue?.toLocaleString() || '0'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                ${paymentData?.monthly_revenue ? Object.values(paymentData.monthly_revenue).reduce((a, b) => a + b, 0).toLocaleString() : '0'} this month
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {paymentData?.active_payment_methods?.length || 0} methods
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Groups Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Groups</Typography>
              <Avatar sx={{ bgcolor: theme.palette.info.light, width: 24, height: 24 }}>
                <GroupsIcon sx={{ fontSize: 16, color: theme.palette.info.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {groupStats?.count || 0}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {groupStats?.results?.reduce((acc, group) => acc + (group.member_count || 0), 0) || 0} members
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {groupStats?.results?.filter(g => g.is_active).length || 0} active
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Certificates Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Certificates</Typography>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 24, height: 24 }}>
                <CertificatesIcon sx={{ fontSize: 16, color: theme.palette.warning.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {certificateStats?.count || 0}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {certificateStats?.results?.filter(c => dayjs(c.issued_at).isAfter(dayjs().subtract(30, 'day'))).length || 0} last 30d
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {certificateStats?.results?.length || 0} issued
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Adverts Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Adverts</Typography>
              <Avatar sx={{ bgcolor: theme.palette.error.light, width: 24, height: 24 }}>
                <AdvertsIcon sx={{ fontSize: 16, color: theme.palette.error.contrastText }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {advertStats?.total_adverts || 0}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {advertStats?.total_clicks || 0} clicks
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="caption" color="text.secondary">
                {(advertStats?.average_ctr || 0).toFixed(2)}% CTR
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Activity Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Recent Activity</Typography>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 24, height: 24 }}>
                <ActivityIcon sx={{ fontSize: 16, color: theme.palette.warning.contrastText }} />
              </Avatar>
            </Box>
            <Box sx={{ mb: 0.5 }}>
              <Badge badgeContent={unreadMessages} color="error" sx={{ mr: 1 }}>
                <MessagesIcon sx={{ fontSize: 16 }} color="action" />
              </Badge>
              <Typography variant="caption" color="text.secondary">
                {recentActivities.length > 0 ? dayjs(recentActivities[0].timestamp).fromNow() : 'No activity'}
              </Typography>
            </Box>
            <Box>
              <Badge badgeContent={upcomingSchedules.length} color="info" sx={{ mr: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16 }} color="action" />
              </Badge>
              <Typography variant="caption" color="text.secondary">
                {upcomingSchedules.length > 0 ? `${upcomingSchedules.length} events` : 'No events'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" icon={<AnalyticsIcon fontSize="small" />} />
          <Tab label="Users" icon={<UsersIcon fontSize="small" />} />
          <Tab label="Courses" icon={<CoursesIcon fontSize="small" />} />
          <Tab label="Payments" icon={<PaymentsIcon fontSize="small" />} />
          <Tab label="Activity" icon={<ActivityIcon fontSize="small" />} />
        </Tabs>
        <Divider />

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>User Distribution</Typography>
                {renderUserStatsChart()}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Enrollment Trends</Typography>
                {renderEnrollmentTrends()}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
                {renderRevenueChart()}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Users Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Recent Users</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Joined</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={user.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
                              {user.full_name || user.email}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            {dayjs(user.date_joined).fromNow()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>User Activity</Typography>
                <List dense>
                  {recentActivities.slice(0, 8).map((activity) => (
                    <ListItem key={activity.id} sx={{ py: 1 }}>
                      <ListItemIcon>
                        {getStatusIcon(activity.action_type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={`${activity.user?.full_name || 'System'} • ${dayjs(activity.timestamp).fromNow()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Courses Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Popular Courses</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell align="right">Enrollments</TableCell>
                        <TableCell align="right">Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {popularCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={course.thumbnail}
                                variant="square"
                                sx={{ width: 32, height: 32, mr: 2 }}
                              >
                                <ContentIcon />
                              </Avatar>
                              {course.title}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {course.enrollment_count || 0}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {course.average_rating?.toFixed(1) || 'N/A'}
                              </Typography>
                              <CircularProgress
                                variant="determinate"
                                value={(course.average_rating || 0) * 20}
                                size={20}
                                thickness={6}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Course Categories</Typography>
                {stats?.courses?.category_distribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(stats.courses.category_distribution).map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip />
                      <Bar dataKey="value" fill="#8884d8" name="Courses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Payments Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                {paymentData?.active_payment_methods?.length > 0 ? (
                  <List dense>
                    {paymentData.active_payment_methods.map((method) => (
                      <ListItem key={method.name} sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: theme.palette.grey[200] }}>
                            {method.name[0]}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={method.name}
                          secondary={`${method.transaction_count} transactions • $${method.total_amount?.toLocaleString()}`}
                        />
                        <Chip
                          label={method.is_live ? 'Live' : 'Test'}
                          size="small"
                          color={method.is_live ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No payment methods configured
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                {paymentData?.recent_transactions?.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentData.recent_transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{dayjs(tx.created_at).format('MMM D, YYYY')}</TableCell>
                            <TableCell>{tx.user_email}</TableCell>
                            <TableCell align="right">${tx.amount.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={tx.status}
                                size="small"
                                color={
                                  tx.status === 'completed' ? 'success' :
                                  tx.status === 'failed' ? 'error' : 'default'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent transactions
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Activity Tab */}
        {activeTab === 4 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ py: 1 }}>
                      <ListItemIcon>
                        {getStatusIcon(activity.action_type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'inline' }}
                            >
                              {activity.user?.full_name || 'System'}
                            </Typography>
                            {` • ${dayjs(activity.timestamp).fromNow()}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
                {upcomingSchedules.length > 0 ? (
                  <List>
                    {upcomingSchedules.map((event) => (
                      <ListItem key={event.id} sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            <ScheduleIcon sx={{ color: theme.palette.primary.contrastText }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'inline' }}
                              >
                                {dayjs(event.start_time).format('MMM D, YYYY h:mm A')}
                              </Typography>
                              {` • ${event.description.substring(0, 50)}...`}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming events
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;