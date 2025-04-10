import React, { useState, useEffect } from 'react';
import {
  Box,  Typography,  Paper,  Button,  Chip,
  Divider,  Grid,  List,  ListItem,
  ListItemText,  Avatar,ListItemIcon,  Tabs,
  Tab,  useTheme,  IconButton,  CircularProgress
} from '@mui/material';
import {
  ArrowBack,  Edit,  People,  Schedule,
  MonetizationOn,  Assessment,  InsertDriveFile,
  VideoLibrary,  Quiz,  Assignment
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Dummy data - replace with API calls
const dummyCourseData = {
  id: 1,
  title: 'Advanced React Development',
  code: 'REACT-401',
  description: 'Master advanced React concepts including hooks, context, and performance optimization. This course will take you from intermediate to advanced React developer.',
  category: 'Web Development',
  level: 'Advanced',
  price: 200.47,
  discountPrice: 149,
  currency: 'NGN',
  status: 'Published',
  thumbnail: 'https://source.unsplash.com/random/800x400/?react',
  duration: '8 weeks',
  totalStudents: 42,
  createdAt: '2023-05-15',
  lastUpdated: '2023-06-20',
  learningOutcomes: [
    'Master React hooks and context API',
    'Build performant React applications',
    'Implement advanced state management',
    'Optimize React application performance',
    'Create reusable component libraries'
  ],
  modules: [
    {
      id: 1,
      title: 'React Hooks Deep Dive',
      description: 'Learn all about useState, useEffect, and custom hooks',
      lessons: [
        { id: 1, title: 'Introduction to Hooks', duration: '30 min', type: 'video' },
        { id: 2, title: 'useState in Depth', duration: '45 min', type: 'video' },
        { id: 3, title: 'useEffect Patterns', duration: '60 min', type: 'video' }
      ]
    },
    {
      id: 2,
      title: 'Context API & State Management',
      description: 'Learn to manage global state with Context API',
      lessons: [
        { id: 4, title: 'Context API Fundamentals', duration: '40 min', type: 'video' },
        { id: 5, title: 'Combining Context with Hooks', duration: '50 min', type: 'video' }
      ]
    }
  ],
  resources: [
    { id: 1, title: 'React Official Documentation', type: 'link', url: 'https://reactjs.org/docs' },
    { id: 2, title: 'Performance Cheat Sheet', type: 'pdf' },
    { id: 3, title: 'Component Design Patterns', type: 'pdf' }
  ]
};

const CourseView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCourse(dummyCourseData);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleBack = () => {
    navigate('/admin/courses');
  };

  const handleEdit = () => {
    navigate(`/admin/courses/edit/${id}`);
  };

  const formatPrice = (price, currency) => {
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
    
    if (priceNumber === undefined || priceNumber === null || isNaN(priceNumber)) {
      return 'Price not set';
    }
    
    const currencyToUse = currency || 'NGN';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyToUse
      }).format(priceNumber);
    } catch (e) {
      return `${currencyToUse} ${priceNumber.toFixed(2)}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'default';
      default: return 'info';
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary color="primary" />;
      case 'quiz': return <Quiz color="secondary" />;
      case 'assignment': return <Assignment color="info" />;
      default: return <InsertDriveFile color="action" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Course not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {course.title}
        </Typography>
        <Chip 
          label={course.status} 
          size="small" 
          color={getStatusColor(course.status)}
          sx={{ ml: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={handleEdit}
          sx={{ ml: 'auto' }}
        >
          Edit Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Course Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Course Description
            </Typography>
            <Typography paragraph>
              {course.description}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              Learning Outcomes
            </Typography>
            <List dense>
              {course.learningOutcomes.map((outcome, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText primary={`• ${outcome}`} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Course Content Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                  height: 3
                }
              }}
            >
              <Tab label="Modules" />
              <Tab label="Resources" />
            </Tabs>
            <Divider />

            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                {course.modules.map((module) => (
                  <Box key={module.id} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {module.description}
                    </Typography>
                    <List>
                      {module.lessons.map((lesson) => (
                        <ListItem 
                          key={lesson.id} 
                          sx={{ 
                            py: 1,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {getLessonIcon(lesson.type)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={lesson.title} 
                            secondary={lesson.duration} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <List>
                  {course.resources.map((resource) => (
                    <ListItem 
                      key={resource.id}
                      sx={{ 
                        py: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {resource.type === 'link' ? (
                          <InsertDriveFile color="primary" />
                        ) : (
                          <InsertDriveFile color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={resource.title} 
                        secondary={resource.type === 'link' ? resource.url : 'PDF Document'} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Course Meta */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ 
              width: '100%', 
              height: 200, 
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: theme.palette.grey[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography color="text.secondary">No thumbnail</Typography>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <People fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Students
                </Typography>
                <Typography variant="h6">
                  {course.totalStudents}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <Schedule fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Duration
                </Typography>
                <Typography variant="h6">
                  {course.duration}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <MonetizationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Price
                </Typography>
                <Typography variant="h6">
                  {course.discountPrice ? (
                    <>
                      <Typography component="span" sx={{ textDecoration: 'line-through', mr: 1 }}>
                        {formatPrice(course.price, course.currency)}
                      </Typography>
                      <Typography component="span" color="error">
                        {formatPrice(course.discountPrice, course.currency)}
                      </Typography>
                    </>
                  ) : (
                    formatPrice(course.price, course.currency)
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <Assessment fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Status
                </Typography>
                <Typography variant="h6">
                  <Chip 
                    label={course.status} 
                    size="small" 
                    color={getStatusColor(course.status)}
                  />
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Course Code
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {course.code}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {course.category}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Level
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {course.level}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {course.createdAt}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">
              {course.lastUpdated}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseView;