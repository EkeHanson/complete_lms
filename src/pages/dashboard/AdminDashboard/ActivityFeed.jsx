import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, 
  FormControl, InputLabel, IconButton, Badge,
  useMediaQuery, useTheme, Chip, TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ActivityFeed = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    const sampleActivities = [
      {
        id: 1,
        user: 'John Doe',
        role: 'Learner',
        activity: 'Assignment Submission',
        details: 'Submitted assignment for Introduction to Programming',
        timestamp: new Date('2023-06-15T10:30:00'),
        status: 'completed'
      },
      {
        id: 2,
        user: 'Admin User',
        role: 'Admin',
        activity: 'Login',
        details: 'Successful login from IP 192.168.1.1',
        timestamp: new Date('2023-06-15T09:15:00'),
        status: 'success'
      },
      {
        id: 3,
        user: 'Jane Smith',
        role: 'Learner',
        activity: 'Course Progress',
        details: 'Completed 75% of Data Science course',
        timestamp: new Date('2023-06-14T14:45:00'),
        status: 'in-progress'
      },
      {
        id: 4,
        user: 'Unknown',
        role: 'Unknown',
        activity: 'Failed Login',
        details: 'Failed login attempt for user admin',
        timestamp: new Date('2023-06-14T08:20:00'),
        status: 'failed'
      },
      {
        id: 5,
        user: 'Super Admin',
        role: 'Super Admin',
        activity: 'System Update',
        details: 'Performed system maintenance',
        timestamp: new Date('2023-06-13T22:00:00'),
        status: 'system'
      },
      {
        id: 6,
        user: 'Michael Brown',
        role: 'Learner',
        activity: 'Exam Completion',
        details: 'Completed final exam for Mathematics with 85% score',
        timestamp: new Date('2023-06-12T16:30:00'),
        status: 'completed'
      },
      {
        id: 7,
        user: 'Admin User',
        role: 'Admin',
        activity: 'User Management',
        details: 'Created new user account for Sarah Johnson',
        timestamp: new Date('2023-06-12T11:15:00'),
        status: 'success'
      },
      {
        id: 8,
        user: 'Emma Wilson',
        role: 'Learner',
        activity: 'Course Enrollment',
        details: 'Enrolled in Web Development Fundamentals',
        timestamp: new Date('2023-06-11T14:20:00'),
        status: 'completed'
      },
      {
        id: 9,
        user: 'Unknown',
        role: 'Unknown',
        activity: 'Failed Login',
        details: 'Failed login attempt for user emma.wilson',
        timestamp: new Date('2023-06-10T19:45:00'),
        status: 'failed'
      },
      {
        id: 10,
        user: 'Super Admin',
        role: 'Super Admin',
        activity: 'System Update',
        details: 'Updated system security policies',
        timestamp: new Date('2023-06-09T23:10:00'),
        status: 'system'
      },
      {
        id: 11,
        user: 'David Lee',
        role: 'Learner',
        activity: 'Course Progress',
        details: 'Completed 50% of Artificial Intelligence course',
        timestamp: new Date('2023-06-09T15:30:00'),
        status: 'in-progress'
      },
      {
        id: 12,
        user: 'Admin User',
        role: 'Admin',
        activity: 'Content Update',
        details: 'Updated course materials for Physics 101',
        timestamp: new Date('2023-06-08T10:45:00'),
        status: 'success'
      }
    ];
    
    setActivities(sampleActivities);
    setFilteredActivities(sampleActivities);
  }, []);

  // Filter activities based on search and filters
  useEffect(() => {
    let results = activities;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(activity => 
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by activity type
    if (activityFilter !== 'all') {
      results = results.filter(activity => 
        activity.activity.toLowerCase().includes(activityFilter.toLowerCase())
      );
    }
    
    // Filter by date (simplified for demo)
    if (dateFilter !== 'all') {
      const today = new Date();
      if (dateFilter === 'today') {
        results = results.filter(activity => 
          activity.timestamp.toDateString() === today.toDateString()
        );
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        results = results.filter(activity => 
          activity.timestamp > weekAgo
        );
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        results = results.filter(activity => 
          activity.timestamp > monthAgo
        );
      }
    }
    
    setFilteredActivities(results);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, dateFilter, activityFilter, activities]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'failed':
        return 'error';
      case 'system':
        return 'info';
      default:
        return 'default';
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Activity Feed
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2, 
        mb: 3,
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <TextField
          fullWidth={isMobile}
          size="small"
          placeholder="Search by user or activity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: isMobile ? '100%' : 'auto'
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={dateFilter}
              label="Date"
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="all">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={activityFilter}
              label="Activity Type"
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <MenuItem value="all">All Activities</MenuItem>
              <MenuItem value="Submission">Submissions</MenuItem>
              <MenuItem value="Login">Logins</MenuItem>
              <MenuItem value="Course">Course Progress</MenuItem>
              <MenuItem value="System">System</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton 
            size="small" 
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              display: isMobile ? 'none' : 'flex'
            }}
          >
            <FilterIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <TableContainer component={Paper} elevation={0} sx={{ 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        maxHeight: 'calc(100vh - 250px)',
        overflow: 'auto'
      }}>
        <Table stickyHeader aria-label="activity feed table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.length > 0 ? (
              filteredActivities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.role}</TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{activity.details}</TableCell>
                    <TableCell>
                      {format(activity.timestamp, 'MMM d, yyyy - h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.status.replace('-', ' ')} 
                        size="small"
                        color={getStatusColor(activity.status)}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No activities found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredActivities.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderBottom: 'none',
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 0
          }
        }}
      />
    </Box>
  );
};

export default ActivityFeed;