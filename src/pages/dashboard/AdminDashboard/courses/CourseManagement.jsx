import React, { useState } from 'react';
import { 
  Box,   Typography,   Button,   Grid,   Paper,   TextField,  Divider,  Tabs,  Tab,  useTheme,  Card,
  CardContent,  LinearProgress,  Chip,  Avatar,  List,  ListItem,
  ListItemAvatar,  ListItemText,  IconButton,  Stack,  useMediaQuery, ListItemSecondaryAction 
} from '@mui/material';
import { 
  Add,   Search,   FilterList,  People,
  School,  CheckCircle,  TrendingUp,  Warning,
  Star,  Category,  AccessTime,  Menu as MenuIcon
} from '@mui/icons-material';
import CourseList from './CourseList';
import { useNavigate } from 'react-router-dom';

const CourseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Dummy data
  const courseStats = {
    totalCourses: 42,
    totalEnrollments: 1256,
    mostPopularCourse: {
      title: "React Development",
      enrollments: 342,
      instructor: "Jane Smith"
    },
    leastPopularCourse: {
      title: "Introduction to Python",
      enrollments: 3,
      instructor: "John Doe"
    },
    noEnrollmentCourses: 5,
    completedCourses: 689,
    ongoingCourses: 567,
    averageCompletionRate: 68,
    recentCourses: [
      { title: "AI Fundamentals", date: "2023-05-15", instructor: "Dr. Chen" },
      { title: "DevOps Crash Course", date: "2023-05-10", instructor: "Alex Johnson" },
      { title: "UX Design Principles", date: "2023-05-05", instructor: "Sarah Williams" }
    ],
    categories: [
      { name: "Programming", count: 18 },
      { name: "Design", count: 8 },
      { name: "Business", count: 7 },
      { name: "Data Science", count: 9 }
    ],
    averageRating: 4.3,
    attentionNeeded: [
      { title: "Outdated: AngularJS Basics", issue: "content outdated" },
      { title: "Unpublished: Advanced Docker", issue: "needs review" }
    ]
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction={isMobile ? "column" : "row"} alignItems="center" spacing={2}>
          <Avatar sx={{ 
            bgcolor: `${color}.light`, 
            color: `${color}.dark`,
            ...(isMobile && { mb: 1 })
          }}>
            {icon}
          </Avatar>
          <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant={isMobile ? "h6" : "h5"}>{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const handleAddCourse = () => {
    navigate('/admin/courses/new');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 600 }}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddCourse}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {isMobile ? 'New Course' : 'Add New Course'}
        </Button>
      </Box>

      {/* Quick Stats Section */}
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={6} lg={3}>
          <StatCard 
            icon={<School />} 
            title="Total Courses" 
            value={courseStats.totalCourses} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={3}>
          <StatCard 
            icon={<People />} 
            title="Enrollments" 
            value={courseStats.totalEnrollments} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={3}>
          <StatCard 
            icon={<CheckCircle />} 
            title="Completed" 
            value={courseStats.completedCourses} 
            color="success" 
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={3}>
          <StatCard 
            icon={<TrendingUp />} 
            title="Completion %" 
            value={`${courseStats.averageCompletionRate}%`} 
            color="info" 
          />
        </Grid>
      </Grid>

      {/* Detailed Stats Section */}
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
        {/* Most Popular Course */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Star color="warning" sx={{ mr: 1 }} /> Most Popular
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"}>{courseStats.mostPopularCourse.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Instructor: {courseStats.mostPopularCourse.instructor}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">{courseStats.mostPopularCourse.enrollments} enrollments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Least Popular Course */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="error" sx={{ mr: 1 }} /> Least Popular
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"}>{courseStats.leastPopularCourse.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Instructor: {courseStats.leastPopularCourse.instructor}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">{courseStats.leastPopularCourse.enrollments} enrollments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Category sx={{ mr: 1, color: 'purple' }} /> Categories
              </Typography>
              <Box sx={{ mt: 2 }}>
                {courseStats.categories.map((category) => (
                  <Box key={category.name} sx={{ mb: 1 }}>
                    <Typography variant="body2">{category.name} ({category.count})</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(category.count / courseStats.totalCourses) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Courses */}
        {/* <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1, color: 'orange' }} /> Recent Courses
              </Typography>
              <List dense={isMobile}>
                {courseStats.recentCourses.map((course, index) => (
                  <ListItem key={index} secondaryAction={
                    !isMobile && <Chip label="New" color="info" size="small" />
                  }>
                    <ListItemText
                      primary={course.title}
                      secondary={`Added: ${course.date} • ${course.instructor}`}
                      primaryTypographyProps={{ variant: isMobile ? "body2" : "body1" }}
                      secondaryTypographyProps={{ variant: isMobile ? "caption" : "body2" }}
                    />
                    {isMobile && (
                      <ListItemSecondaryAction>
                        <Chip label="New" color="info" size="small" />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
      
      {/* Courses List Section */}
      <Paper sx={{ mb: 3 }}>
        <Divider />
        <CourseList isMobile={isMobile} />
      </Paper>
    </Box>
  );
};

export default CourseManagement;