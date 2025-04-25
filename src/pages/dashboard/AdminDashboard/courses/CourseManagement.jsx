import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, TextField, Divider, Tabs, Tab, useTheme, Card,
  CardContent, LinearProgress, Chip, Avatar, List, ListItem,CircularProgress ,
  ListItemAvatar, ListItemText, IconButton, Stack, useMediaQuery, ListItemSecondaryAction
} from '@mui/material';
import {
  Add, Search, FilterList, People,
  School, CheckCircle, TrendingUp, Warning,
  Star, Category, AccessTime, Menu as MenuIcon, Assignment as AssignmentIcon
} from '@mui/icons-material';
import CourseList from './CourseList';
import CourseContentManagement from './CourseContentManagement';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../../config'; // Adjust the import path as needed

const CourseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [courseStats, setCourseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // In your CourseManagement component
useEffect(() => {
  const fetchCourseStats = async () => {
      try {
          setLoading(true);
          
          // Fetch all necessary data in parallel
          const [coursesRes, enrollmentsRes, mostPopularRes, leastPopularRes, categoriesRes] = await Promise.all([
              coursesAPI.getCourses(),
              coursesAPI.getAllEnrollments(),
              coursesAPI.getMostPopularCourse(),
              coursesAPI.getLeastPopularCourse(),
              coursesAPI.getCategories()
          ]);

          const totalCourses = coursesRes.data.count;
          const totalEnrollments = enrollmentsRes.data.count;
      

          const mostPopularCourse = mostPopularRes.data ? {
            
              id: mostPopularRes.data.id,
              title: mostPopularRes.data.title,
              enrollments: mostPopularRes.data.enrollment_count || 0,
              instructor: mostPopularRes.data.instructor || "No instructor assigned"
          } : {
              title: "No courses available",
              enrollments: 0,
              instructor: "No instructor assigned"
          };

          // Process least popular course
          const leastPopularCourse = leastPopularRes.data ? {
              id: leastPopularRes.data.id,
              title: leastPopularRes.data.title,
              enrollments: leastPopularRes.data.enrollment_count || 0,
              instructor: leastPopularRes.data.instructor || "No instructor assigned"
          } : {
              title: "No courses available",
              enrollments: 0,
              instructor: "No instructor assigned"
          };

          // Calculate completion rate
          const completedCourses = enrollmentsRes.data.results.filter(e => e.completed).length;
          const averageCompletionRate = totalEnrollments > 0 
              ? Math.round((completedCourses / totalEnrollments) * 100) 
              : 0;

          // Transform categories data
          const categories = categoriesRes.data.results.map(cat => ({
              name: cat.name,
              count: cat.course_count || 0
          }));

          setCourseStats({
              totalCourses,
              totalEnrollments,
              mostPopularCourse,
              leastPopularCourse,
              completedCourses,
              ongoingCourses: totalEnrollments - completedCourses,
              averageCompletionRate,
              categories,
              noEnrollmentCourses: 0,
              recentCourses: [],
              averageRating: 0,
              attentionNeeded: []
          });
          
      } catch (err) {
          setError(err.message || 'Failed to fetch course statistics');
          console.error('Error fetching course stats:', err);
      } finally {
          setLoading(false);
      }
  };

  fetchCourseStats();
}, []);

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
            <Typography variant={isMobile ? "h6" : "h5"}>
              {loading ? 'Loading...' : value}
            </Typography>
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

  const renderOverview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      );
    }

    if (!courseStats) {
      return null;
    }

    return (
      <>
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
          {courseStats.mostPopularCourse && (
            <Grid item xs={12} md={6}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '70%' }} onClick={() => navigate(`/admin/course-details/${courseStats.mostPopularCourse.id}`, {
                  state: { enrollments: courseStats.mostPopularCourse.enrollments }
                })}>
                <CardContent>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star color="warning" sx={{ mr: 1 }} /> Most Popular
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h5"}>
                    {courseStats.mostPopularCourse?.title || 'No popular course'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Instructor: {courseStats.mostPopularCourse?.instructor || 'Unknown'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {courseStats.mostPopularCourse?.enrollments ?? 0} enrollments
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            </Grid>
          )}

          {/* Least Popular Course */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }} onClick={() => navigate(`/admin/course-details/${courseStats.leastPopularCourse.id}`, {
                state: { enrollments: courseStats.mostPopularCourse.enrollments }
              })}>
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
        </Grid>

        {/* Courses List Section */}
        <Paper sx={{ mb: 3 }}>
          <Divider />
          <CourseList isMobile={isMobile} />
        </Paper>
      </>
    );
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

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<School />} iconPosition="start" />
          <Tab label="Content Management" icon={<AssignmentIcon />} iconPosition="start" />
        </Tabs>
        <Divider />
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && <CourseContentManagement />}
        </Box>
      </Paper>
    </Box>
  );
};

export default CourseManagement;