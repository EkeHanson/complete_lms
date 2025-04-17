import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar,
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, CssBaseline,
  Typography, IconButton, Avatar, Divider, Badge, useTheme,
  useMediaQuery, Menu, MenuItem, Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as UsersIcon,
  Security as SecurityIcon, AttachMoney as FinanceIcon,
  Menu as MenuIcon, CalendarToday as ScheduleIcon,Campaign as AdvertIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon, Settings as SettingsIcon,
  Logout as LogoutIcon, Analytics as AnalyticsIcon, NotificationsActive as AlertsIcon, Chat as ChatIcon,
  Assessment as ReportsIcon, Computer as SystemSettingsIcon, Web as WebsiteIcon,
  Payment as PaymentIcon, Checklist as ChecklistIcon, School as SchoolIcon, Mail as MessagesIcon
} from '@mui/icons-material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


import AdminDashboard from './AdminDashboard';
import AdminFinancialDashboard from './AdminFinancialDashboard';
import AdminUserManagement from './AdminUserManagement';
import SecurityComplianceDashboard from './SecurityComplianceDashboard';
import ContentUsageDashboard from './ContentUsageDashboard';
import NotificationsDashboard from './NotificationsDashboard';
import CommunicationSupportDashboard from './CommunicationSupportDashboard';
import ReportsDashboard from './ReportsDashboard';
import AdminProfileSettings from './AdminProfileSettings';
import PaymentSettings from './PaymentSettings';
import WebsiteNotificationSettings from './WebsiteNotificationSettings';
import WebsiteSettings from './WebsiteSettings';
import QualityDashbaord from './QaulityAssuranceDashboard/QualityDashbaord';
import CourseManagement from './courses/CourseManagement';
import CourseForm from './courses/CourseForm';
import CourseView  from './courses/CourseView ';
import ScheduleManagement from './ScheduleManagement';
import ActivityFeed from './ActivityFeed'; // Add this import
import Messaging from './Messaging';
import LearnerProfile from './LearnerProfile';
import Advertorial from './Advertorial/Advertorial';
import CertificateBuilderMain from './certificateBuilder/CertificateBuilderMain';

import UserRegistration from './UserRegistration';
import BulkUserUpload from './BulkUserUpload';
import UserGroupsManagement from './UserGroupsManagement';

const drawerWidth = 240;

function Admin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const settingsOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [

    { path: '/admin/courses', name: 'Course Management', icon: <SchoolIcon /> },
    { path: '/admin', name: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/users', name: 'User Management', icon: <UsersIcon /> },
    { path: '/admin/security-info', name: 'Security & Compliance', icon: <SecurityIcon /> },
    { path: '/admin/finance', name: 'Financial Dashboard', icon: <FinanceIcon /> },
    { path: '/admin/quality-assurance', name: 'Quality Assurance', icon: <ChecklistIcon /> },
    { path: '/admin/analytics', name: 'Content & Analytics', icon: <AnalyticsIcon /> },
    { path: '/admin/alerts', name: 'Notifications & Alerts', icon: <AlertsIcon /> },
    { path: '/admin/communication', name: 'Communication & Support', icon: <ChatIcon /> },
    { path: '/admin/reports', name: 'Custom Reports', icon: <ReportsIcon /> },
    // { path: '/admin/profile', name: 'Profile Settings', icon: <SettingsIcon /> }
  ];

  const settingsMenuItems = [
    { 
      name: 'System Settings', 
      icon: <SystemSettingsIcon sx={{ mr: 2 }} />, 
      onClick: () => console.log('System Settings clicked')
    },
    { 
      name: 'Website Settings', 
      icon: <WebsiteIcon sx={{ mr: 2 }} />, 
      onClick: () => {
        window.location.href = '/admin/website-Settings';
        handleSettingsClose();
      }
    },
    { 
      name: 'Website Notification', 
      icon: <NotificationsIcon sx={{ mr: 2 }} />, 
      onClick: () => {
        window.location.href = '/admin/website-notifications';
        handleSettingsClose();
      }
    },
    { 
      name: 'Setup Payment Information', 
      icon: <PaymentIcon sx={{ mr: 2 }} />, 
      onClick: () => navigate('/admin/payment-settings')
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      > 
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Portal
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Schedule Icon with Tooltip */}
            <Tooltip title="Certificate Builder">
              <IconButton 
                component={Link}
                to="/admin/builder"
                size="large" 
                color="inherit"
                aria-label="certificate-builder"
                sx={{
                  color: location.pathname === '/admin/builder' ? 
                    theme.palette.primary.main : 'inherit'
                }}
              >
                <EmojiEventsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Advert Management">
              <IconButton 
                component={Link}
                to="/admin/advertorial"
                size="large" 
                color="inherit"
                aria-label="advert-management"
                sx={{
                  color: location.pathname === '/admin/advertorial' ? 
                    theme.palette.primary.main : 'inherit'
                }}
              >
                <AdvertIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Schedule Management">
              <IconButton 
                component={Link}
                to="/admin/schedule"
                size="large" 
                color="inherit"
                aria-label="schedule"
                sx={{
                  color: location.pathname === '/admin/schedule' ? 
                    theme.palette.primary.main : 'inherit'
                }}
              >
                <ScheduleIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Messages">
              <IconButton 
                component={Link}
                to="/admin/messaging"
                size="large" 
                color="inherit"
                aria-label="schedule"
                sx={{
                  color: location.pathname === '/admin/messaging' ? 
                    theme.palette.primary.main : 'inherit'
                }}
              >
                {/* <MessagesIcon /> */}
                <ChatIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Activity Feed">
              <IconButton
                component={Link}
                to="/admin/activity-feed"
                size="large"
                color="inherit"
                sx={{
                  color: location.pathname === '/admin/activity-feed' ? 
                    theme.palette.primary.main : 'inherit'
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* <IconButton size="large" color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
            
            <IconButton 
              size="large" 
              color="inherit"
              onClick={handleSettingsClick}
              aria-controls={settingsOpen ? 'settings-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={settingsOpen ? 'true' : undefined}
            >
              <SettingsIcon />
            </IconButton>

            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={settingsOpen}
              onClose={handleSettingsClose}
              MenuListProps={{
                'aria-labelledby': 'settings-button',
              }}
              PaperProps={{
                elevation: 2,
                sx: {
                  mt: 1.5,
                  minWidth: 250,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& .MuiMenuItem-root': {
                    py: 1.5,
                    px: 2,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {settingsMenuItems.map((item) => (
                <MenuItem 
                  key={item.name}
                  onClick={() => {
                    item.onClick();
                    handleSettingsClose();
                  }}
                >
                  {item.icon}
                  {item.name}
                </MenuItem>
              ))}
            </Menu>

            <IconButton 
              component={Link} 
              to="/admin/profile" 
              size="large" 
              color="inherit"
            >
              <Avatar 
                alt="Admin User" 
                src="/path-to-avatar.jpg" 
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: theme.spacing(2, 3),
          height: '64px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Admin Console
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
        
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.path} 
              disablePadding
              sx={{
                backgroundColor: location.pathname === item.path ? 
                  theme.palette.action.selected : 'transparent'
              }}
            >
              <ListItemButton 
                component={Link} 
                to={item.path}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: '40px', color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px', color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden'
        }}
      >
        <Toolbar />
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            p: 3,
            minHeight: 'calc(100vh - 96px)'
          }}
        >
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/finance" element={<AdminFinancialDashboard />} />
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/security-info" element={<SecurityComplianceDashboard />} />
            <Route path="/analytics" element={<ContentUsageDashboard />} />
            <Route path="/alerts" element={<NotificationsDashboard />} />
            <Route path="/communication" element={<CommunicationSupportDashboard />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/profile" element={<AdminProfileSettings />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
            <Route path="/website-notifications" element={<WebsiteNotificationSettings />} />
            <Route path="/website-settings" element={<WebsiteSettings />} />
            <Route path="/quality-assurance" element={<QualityDashbaord />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/courses/new" element={<CourseForm />} />
            <Route path="/courses/edit/:id" element={<CourseForm />} />
            <Route path="/courses/view/:id" element={<CourseView />} />
            <Route path="/schedule" element={<ScheduleManagement />} />
            <Route path="/activity-feed" element={<ActivityFeed />} />
            <Route path="/messaging" element={<Messaging />} /> 
            <Route path="/advertorial" element={<Advertorial />} />

            <Route path="/learner-profile/:id" element={<LearnerProfile />} />
            <Route path="/builder" element={<CertificateBuilderMain />} />

          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default Admin;