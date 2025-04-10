import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  TextField,
  Divider,
  Tabs,
  Tab,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Search, FilterList, Edit, Archive, Visibility, Delete, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Generate dummy course data
const generateDummyCourses = () => {
  const statuses = ['Published', 'Draft', 'Archived'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const categories = ['Programming', 'Design', 'Business', 'Science', 'Mathematics'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `CRS${1000 + i}`,
    title: `Course Title ${i + 1}`,
    code: `CS-${4000 + i}`,
    shortDescription: `Short description for course ${i + 1}`,
    fullDescription: `This is a comprehensive course about... ${i + 1}`,
    thumbnail: `https://picsum.photos/200/150?random=${i}`,
    status: statuses[i % 3],
    visibility: i % 2 === 0 ? 'Public' : 'Private',
    enrollmentStatus: i % 3 === 0 ? 'Open' : 'Closed',
    category: categories[i % 5],
    tags: ['Tag1', 'Tag2', 'Tag3'].slice(0, (i % 3) + 1),
    difficulty: difficulties[i % 3],
    duration: `${(i % 6) + 1} weeks`,
    credits: (i % 4) + 1,
    enrollments: Math.floor(Math.random() * 500),
    activeStudents: Math.floor(Math.random() * 300),
    completionRate: `${Math.floor(Math.random() * 30) + 50}%`,
    instructor: `Instructor ${i % 5 + 1}`,
    coInstructors: Array.from({ length: i % 3 }, (_, j) => `Co-Instructor ${j + 1}`),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString().split('T')[0],
    startDate: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
    endDate: new Date(Date.now() + Math.floor(Math.random() * 20000000000)).toISOString().split('T')[0],
    modules: (i % 5) + 3,
    lessons: (i % 10) + 5,
    totalHours: (i % 20) + 5
  }));
};

const CourseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  useEffect(() => {
    // Simulate API call to fetch courses
    const dummyCourses = generateDummyCourses();
    setCourses(dummyCourses);
    setFilteredCourses(dummyCourses);
  }, []);

  useEffect(() => {
    // Filter courses based on search term and active tab
    let filtered = courses;
    
    // Filter by tab
    if (activeTab === 1) filtered = filtered.filter(c => c.status === 'Published');
    else if (activeTab === 2) filtered = filtered.filter(c => c.status === 'Draft');
    else if (activeTab === 3) filtered = filtered.filter(c => c.status === 'Archived');
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, activeTab, courses]);

  const handleAddCourse = () => {
    navigate('/admin/courses/new');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Published': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddCourse}
        >
          Add New Course
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses by title, code, instructor or category..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ height: '56px' }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
          <Tab label="All Courses" />
          <Tab label="Published" />
          <Tab label="Drafts" />
          <Tab label="Archived" />
        </Tabs>
        <Divider />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Enrollments</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={course.thumbnail} 
                        variant="square"
                        sx={{ width: 40, height: 30, mr: 2, borderRadius: 1 }}
                      />
                      <Box>
                        <Typography variant="body1">{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.difficulty} • {course.duration} • {course.credits} credits
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={course.status} 
                      color={getStatusColor(course.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{course.enrollments} enrolled</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.completionRate} completion
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{course.updatedAt}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={course.status === 'Archived' ? 'Restore' : 'Archive'}>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <Archive fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More options">
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CourseManagement;