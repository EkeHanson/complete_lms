import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar,
  Menu, MenuItem, Box, Grid, Card, CardContent, Button,
  Paper, Divider, Tooltip, LinearProgress, useTheme, styled
} from '@mui/material';
import {
  Assignment, People, Checklist, Comment, Upload,
  Assessment, Notifications, ArrowBack, Home,
  Menu as MenuIcon, AccountCircle, Logout, Settings
} from '@mui/icons-material';

// Import child components
import LearnerPortfolioBrowser from './LearnerPortfolioBrowser';
import AssessmentSamplingInterface from './AssessmentSamplingInterface';
import IQAFeedbackForm from './IQAFeedbackForm';
import SamplingPlanUploader from './SamplingPlanUploader';
import VerificationRecordsTable from './VerificationRecordsTable';
import ReportsGenerator from './ReportsGenerator';

// Styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  borderRadius: '12px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const StatusIndicator = styled('div')(({ status, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '&:before': {
    content: '""',
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
    backgroundColor:
      status === 'completed' 
        ? theme.palette.success.main 
        : status === 'in-progress' 
        ? theme.palette.warning.main 
        : theme.palette.error.main
  }
}));

const IQADashboard = () => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState([]);
  
  // Navbar state
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Dummy data for dashboard
  const stats = {
    learnersToReview: 12,
    assessmentsPending: 8,
    samplingPlansDue: 3,
    overdueTasks: 2
  };

  const recentActivities = [
    { id: 1, action: 'Reviewed portfolio', date: '2 hours ago', user: 'John Doe', status: 'completed' },
    { id: 2, action: 'Uploaded sampling plan', date: '1 day ago', user: 'Q2 Plan', status: 'completed' },
    { id: 3, action: 'Feedback to assessor', date: '2 days ago', user: 'Sarah Smith', status: 'completed' },
    { id: 4, action: 'Verification needed', date: 'Due tomorrow', user: 'Emily Wilson', status: 'pending' }
  ];

  const priorityTasks = [
    { id: 1, title: 'Complete Q2 sampling plan', due: 'Due in 2 days', priority: 'high', progress: 60 },
    { id: 2, title: 'Review assessor feedback', due: 'Due in 3 days', priority: 'medium', progress: 30 },
    { id: 3, title: 'Prepare EQA documentation', due: 'Due in 5 days', priority: 'low', progress: 10 }
  ];

  // Navbar handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Navigation handlers
  const navigateTo = (view) => {
    setViewHistory([...viewHistory, activeView]);
    setActiveView(view);
  };

  const navigateBack = () => {
    if (viewHistory.length > 0) {
      setActiveView(viewHistory[viewHistory.length - 1]);
      setViewHistory(viewHistory.slice(0, -1));
    } else {
      setActiveView('dashboard');
    }
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Avatar sx={{ mr: 2 }}>IQA</Avatar>
        My Profile
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <Settings sx={{ mr: 2 }} />
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleMenuClose}>
        <Logout sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const renderView = () => {
    switch(activeView) {
      case 'portfolio': return <LearnerPortfolioBrowser onBack={navigateBack} />;
      case 'sampling': return <AssessmentSamplingInterface onBack={navigateBack} />;
      case 'feedback': return <IQAFeedbackForm onBack={navigateBack} />;
      case 'plans': return <SamplingPlanUploader onBack={navigateBack} />;
      case 'records': return <VerificationRecordsTable onBack={navigateBack} />;
      case 'reports': return <ReportsGenerator onBack={navigateBack} />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="600">
          Quality Assurance Dashboard
        </Typography>
        <Badge badgeContent={stats.overdueTasks} color="error" overlap="circular">
          <IconButton>
            <Notifications />
          </IconButton>
        </Badge>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard onClick={() => navigateTo('portfolio')}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Learners to Review</Typography>
                <People sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
              <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                {stats.learnersToReview}
              </Typography>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                View Portfolios
              </Button>
            </CardContent>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard 
            sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)` }}
            onClick={() => navigateTo('sampling')}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Assessments Pending</Typography>
                <Assignment sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
              <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                {stats.assessmentsPending}
              </Typography>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Start Review
              </Button>
            </CardContent>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard 
            sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)` }}
            onClick={() => navigateTo('plans')}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Sampling Plans Due</Typography>
                <Checklist sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
              <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                {stats.samplingPlansDue}
              </Typography>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Manage Plans
              </Button>
            </CardContent>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard 
            sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)` }}
            onClick={() => navigateTo('records')}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Overdue Tasks</Typography>
                <Notifications sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
              <Typography variant="h3" sx={{ mt: 1, mb: 2 }}>
                {stats.overdueTasks}
              </Typography>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                View Tasks
              </Button>
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Quick Actions and Priority Tasks */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: '12px', p: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {[
                { icon: <Checklist />, label: 'Sample Work', view: 'sampling' },
                { icon: <Upload />, label: 'Upload Plan', view: 'plans' },
                { icon: <Comment />, label: 'Provide Feedback', view: 'feedback' },
                { icon: <Assessment />, label: 'Generate Report', view: 'reports' }
              ].map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={action.icon}
                    onClick={() => navigateTo(action.view)}
                    sx={{
                      p: 2,
                      justifyContent: 'flex-start',
                      borderRadius: '8px',
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 4 }}>
              Priority Tasks
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              {priorityTasks.map((task) => (
                <Box 
                  key={task.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    borderLeft: `4px solid ${
                      task.priority === 'high' 
                        ? theme.palette.error.main 
                        : task.priority === 'medium' 
                        ? theme.palette.warning.main 
                        : theme.palette.success.main
                    }`
                  }}
                >
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {task.due}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{
                      mt: 2,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: 
                          task.priority === 'high' 
                            ? theme.palette.error.main 
                            : task.priority === 'medium' 
                            ? theme.palette.warning.main 
                            : theme.palette.success.main
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity and Progress */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: '12px', p: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 4 }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e5e7eb'
                    }
                  }}
                  onClick={() => {
                    if (activity.action.includes('portfolio')) navigateTo('portfolio');
                    if (activity.action.includes('plan')) navigateTo('plans');
                    if (activity.action.includes('feedback')) navigateTo('feedback');
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StatusIndicator status={activity.status}>
                      {activity.status === 'completed' ? 'Completed' : 'Pending'}
                    </StatusIndicator>
                  </Box>
                  <Typography variant="body1">{activity.action}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.date} • {activity.user}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography variant="h6" fontWeight="600" gutterBottom>
              Verification Progress
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {[
                { label: 'Initial Verification', value: 24, total: 32, color: 'success' },
                { label: 'Interim Sampling', value: 15, total: 20, color: 'warning' },
                { label: 'Summative Sampling', value: 8, total: 15, color: 'error' },
                { label: 'EQA Preparation', value: 4, total: 10, color: 'info' }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper sx={{ p: 2, borderRadius: '8px' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1 }}>
                      {item.value}/{item.total}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(item.value / item.total) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: theme.palette[item.color].main
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => setActiveView('dashboard')}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
            onClick={() => setActiveView('dashboard')}
          >
            IQA Dashboard
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={stats.overdueTasks} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMenu}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {activeView !== 'dashboard' && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: '#f5f5f5'
          }}>
            <IconButton onClick={navigateBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Button 
              startIcon={<Home />} 
              onClick={() => setActiveView('dashboard')}
              sx={{ mr: 2 }}
            >
              Dashboard
            </Button>
          </Box>
        )}
        {renderView()}
      </Box>
    </Box>
  );
};

export default IQADashboard;