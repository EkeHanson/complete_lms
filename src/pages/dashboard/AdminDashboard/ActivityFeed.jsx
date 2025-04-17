import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, 
  FormControl, InputLabel, IconButton, Badge,
  useMediaQuery, useTheme, Chip, TablePagination,
  CircularProgress, Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { userAPI } from '../../../config';

const ActivityFeed = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch activities from API
  useEffect(() => {
// In the fetchActivities function:
const fetchActivities = async () => {
  try {
    setLoading(true);
    const response = await userAPI.getUserActivities({
      page: page + 1,  // API pages are typically 1-based
      page_size: rowsPerPage
    });
    setActivities(response.data.results);
    setFilteredActivities(response.data.results);
    setTotalCount(response.data.count);
    setLoading(false);
  } catch (err) {
    setError(err.message || 'Failed to fetch activities');
    setLoading(false);
  }
};

    fetchActivities();
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
        activity.activity_type.toLowerCase().includes(activityFilter.toLowerCase())
      );
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (dateFilter === 'today') {
        cutoffDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (dateFilter === 'week') {
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
      } else if (dateFilter === 'month') {
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      results = results.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= cutoffDate;
      });
    }
    
    setFilteredActivities(results);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, dateFilter, activityFilter, activities]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle pagination
// Update your handleChangePage and handleChangeRowsPerPage:
const handleChangePage = async (event, newPage) => {
  setPage(newPage);
  await fetchActivities();
};

const handleChangeRowsPerPage = async (event) => {
  const newRowsPerPage = parseInt(event.target.value, 10);
  setRowsPerPage(newRowsPerPage);
  setPage(0);
  await fetchActivities();
};

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
              <MenuItem value="login">Logins</MenuItem>
              <MenuItem value="logout">Logouts</MenuItem>
              <MenuItem value="password">Password Changes</MenuItem>
              <MenuItem value="profile">Profile Updates</MenuItem>
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id} hover>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.activity_type}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>{activity.details}</TableCell>
                      <TableCell>
                        {format(parseISO(activity.timestamp), 'MMM d, yyyy - h:mm a')}
                      </TableCell>
                      <TableCell>{activity.ip_address}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {activity.device_info && activity.device_info.length > 30 
                          ? `${activity.device_info.substring(0, 30)}...` 
                          : activity.device_info}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={activity.status} 
                          size="small"
                          color={getStatusColor(activity.status)}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
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
        </>
      )}
    </Box>
  );
};

export default ActivityFeed;