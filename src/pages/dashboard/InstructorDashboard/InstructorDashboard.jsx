import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Box, Avatar, Badge, Menu, MenuItem as MenuItemMUI, Chip, Divider, Fab, Snackbar, Alert, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, School, People, Assignment, Message, Schedule, Settings, Logout,
  Notifications, Feedback, Quiz, Forum, BarChart, 
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
// import dummyData from './dummyData'; // REMOVE this line
import InstructorOverview from './InstructorOverview';
import InstructorCourseList from './InstructorCourseList';
import InstructorStudentProgress from './InstructorStudentProgress';
import InstructorAssignmentList from './InstructorAssignmentList';
import InstructorMessages from './InstructorMessages';
import InstructorSchedule from './InstructorSchedule';
import InstructorFeedback from './InstructorFeedback';
import InstructorQuizzes from './InstructorQuizzes';
import InstructorForums from './InstructorForums';
import InstructorAnalytics from './InstructorAnalytics';
import InstructorSettings from './InstructorSettings';
import ProfileModal from './ProfileModal';

// Import AuthContext
import { useAuth } from '../../../contexts/AuthContext';
// Import your API for instructor dashboard data
import { instructorAPI } from '../../../config';

const InstructorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading: authLoading } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('lms');
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch instructor dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const response = await instructorAPI.getDashboardData();
        // Example: mapping API response to dashboardData
        const data = response.data;
        const mappedData = {
          instructor: {
            id: data.id,
            name: `${data.user.first_name} ${data.user.last_name}`,
            email: data.user.email,
            avatar: data.user.avatar,
            phone: data.user.phone,
            bio: data.bio,
            department: data.department,
            isActive: data.is_active,
          },
          courses: data.courses,
          students: data.students,
          assignments: data.assignments,
          quizzes: data.quizzes,
          messages: data.messages,
          schedule: data.schedule,
          analytics: data.analytics,
          feedbackHistory: data.feedbackHistory,
          compliance: data.compliance,
        };
        setDashboardData(mappedData);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error loading dashboard data', severity: 'error' });
      }
    };
    fetchData();
  }, [user]);

  // Unread messages count
  const unreadCount = dashboardData?.messages?.filter(msg => !msg.read).length || 0;

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <Dashboard /> },
    { id: 'courses', label: 'Courses', icon: <School /> },
    { id: 'students', label: 'Students', icon: <People /> },
    { id: 'assignments', label: 'Assignments', icon: <Assignment /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Quiz /> },
    { id: 'messages', label: 'Messages', icon: <Message /> },
    { id: 'schedule', label: 'Schedule', icon: <Schedule /> },
    { id: 'forums', label: 'Forums', icon: <Forum /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart /> },
    { id: 'feedback', label: 'Feedback', icon: <Feedback /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> }
  ];

  const handleAddCourse = () => console.log('Adding new course');
  const handleEditCourse = (course) => console.log('Editing course:', course);
  const handleDeleteCourse = (courseId) => console.log('Deleting course:', courseId);

  const handleFeedbackClick = (target, type) => {
    setFeedbackTarget(target || { title: 'Learning Management System' });
    setFeedbackType(type || 'lms');
    setFeedbackOpen(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const renderContent = () => {
    if (authLoading || !dashboardData) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <Typography sx={{ mt: 2 }} color="text.secondary">Loading your dashboard...</Typography>
        </Box>
      );
    }
    switch (activeSection) {
      case 'overview':
        return (
          <InstructorOverview
            instructor={dashboardData.instructor}
            metrics={dashboardData.metrics || {
              courses: 0,
              students: 0,
              pendingTasks: 0,
              completionRate: 0,
              upcomingEvents: 0
            }}
            activities={dashboardData.activities || []}
          />
        );
      case 'courses':
        return (
          <InstructorCourseList
            courses={dashboardData.courses}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onFeedback={handleFeedbackClick}
          />
        );
      case 'students':
        return <InstructorStudentProgress students={dashboardData.students} />;
      case 'assignments':
        return <InstructorAssignmentList assignments={dashboardData.assignments} />;
      case 'quizzes':
        return <InstructorQuizzes quizzes={dashboardData.quizzes} />;
      case 'messages':
        return <InstructorMessages messages={dashboardData.messages} />;
      case 'schedule':
        return <InstructorSchedule schedules={dashboardData.schedules} attendance={dashboardData.attendance} />;
      case 'forums':
        return <InstructorForums forums={dashboardData.forums} />;
      case 'analytics':
        return <InstructorAnalytics analytics={dashboardData.analytics} certifications={dashboardData.certifications} />;
      case 'feedback':
        return (
          <InstructorFeedback
            feedback={dashboardData.feedbackHistory}
            onFeedback={handleFeedbackClick}
          />
        );
      case 'settings':
        return <InstructorSettings compliance={dashboardData.compliance} />;
      default:
        return null;
    }
  };

  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: isMobile ? '100%' : 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 240,
            boxSizing: 'border-box',
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            borderRight: 'none'
          }
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <School sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" noWrap component="div">
            EduConnect
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List>
          {navigationItems.map(item => (
            <ListItem
              button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                bgcolor: activeSection === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                mb: 0.5
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: '40px' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.id === 'messages' && unreadCount > 0 && (
                <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1 }} />
              )}
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Logout />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)' } }}
            onClick={() => {
              // Clear all user-related state and local/session storage
              setDashboardData(null);
              setProfileOpen(false);
              setActiveSection('overview');
              setFeedbackOpen(false);
              setFeedbackTarget(null);
              setSnackbar({ open: false, message: '', severity: 'info' });
              localStorage.clear();
              sessionStorage.clear();
              showSnackbar('Logged out successfully', 'success');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box flexGrow={1}>
        {/* Top Navigation Bar */}
        <AppBar position="fixed" sx={{ bgcolor: '#fff', color: '#000', boxShadow: 1, zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Instructor Dashboard
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                edge="end"
                onClick={() => setProfileOpen(true)}
              >
                <Avatar src={dashboardData?.instructor?.avatar} sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItemMUI dense disabled>
            <Typography variant="subtitle1">Notifications</Typography>
          </MenuItemMUI>
          {(dashboardData?.messages || []).slice(0, 3).map(msg => (
            <MenuItemMUI
              key={msg.id}
              onClick={() => {
                setActiveSection('messages');
                handleMenuClose();
              }}
              sx={{
                borderLeft: msg.urgent ? '3px solid' + theme.palette.error.main : 'none',
                bgcolor: !msg.read ? theme.palette.action.selected : 'inherit'
              }}
            >
              <ListItemIcon>
                <Message color={!msg.read ? 'primary' : 'action'} />
              </ListItemIcon>
              <ListItemText
                primary={msg.sender}
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '300px'
                    }}
                  >
                    {msg.content}
                  </Typography>
                }
              />
            </MenuItemMUI>
          ))}
          <MenuItemMUI
            onClick={() => {
              setActiveSection('messages');
              handleMenuClose();
            }}
            sx={{ justifyContent: 'center' }}
          >
            <Typography color="primary">View All Notifications</Typography>
          </MenuItemMUI>
        </Menu>

        {/* Content Area */}
        <Box sx={{
          p: isMobile ? 2 : 4,
          maxWidth: '1400px',
          mx: 'auto',
          mt: '64px'
        }}>
          {renderContent()}
        </Box>

        {/* Profile Modal */}
        <ProfileModal
          instructor={dashboardData?.instructor}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />

        {/* Feedback Modal */}
        <InstructorFeedback
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          type={feedbackType}
          target={feedbackTarget}
          onSubmit={() => showSnackbar('Feedback submitted successfully', 'success')}
          feedback={dashboardData?.feedbackHistory || []}
        />

        {/* Floating Feedback Button */}
        <Fab
          color="primary"
          aria-label="feedback"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            display: { xs: 'none', md: 'flex' }
          }}
          onClick={() => handleFeedbackClick(null, 'lms')}
        >
          <Feedback />
        </Fab>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default InstructorDashboard;
