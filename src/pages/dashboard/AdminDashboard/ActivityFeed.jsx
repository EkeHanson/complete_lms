// ActivityFeed.js
import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, Grid, useTheme
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ActivityFeed = () => {
  const theme = useTheme();
  const [filterDate, setFilterDate] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [searchUser, setSearchUser] = useState('');

  // Sample data (replace with actual API data)
  const activities = [
    { id: 1, user: 'John Doe', activity: 'Login', time: '2025-04-10 09:15', status: 'Success' },
    { id: 2, user: 'Jane Smith', activity: 'Assignment Submitted', time: '2025-04-10 10:30', status: 'Completed' },
    { id: 3, user: 'Bob Johnson', activity: 'Login', time: '2025-04-10 11:00', status: 'Failed' },
    { id: 4, user: 'Alice Brown', activity: 'Course Completed', time: '2025-04-09 15:45', status: '100%' },
    { id: 5, user: 'Mike Wilson', activity: 'Exam Submitted', time: '2025-04-09 14:20', status: 'Completed' },
  ];

  const activityTypes = [
    'All Activities', 'Login', 'Assignment Submitted', 'Exam Submitted', 
    'Course Completed', 'Course In Progress', 'Failed Login'
  ];

  const filteredActivities = activities.filter(activity => {
    return (
      (!filterDate || activity.time.includes(filterDate)) &&
      (!filterActivity || filterActivity === 'All Activities' || activity.activity === filterActivity) &&
      (!searchUser || activity.user.toLowerCase().includes(searchUser.toLowerCase()))
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Activity Feed
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            label="Filter by Date"
            InputLabelProps={{ shrink: true }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Activity</InputLabel>
            <Select
              value={filterActivity}
              label="Filter by Activity"
              onChange={(e) => setFilterActivity(e.target.value)}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search by User"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon />
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Table sx={{ minWidth: 650 }} aria-label="activity feed table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell>User</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow key={activity.id} hover>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{activity.activity}</TableCell>
                <TableCell>{activity.time}</TableCell>
                <TableCell>{activity.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityFeed;