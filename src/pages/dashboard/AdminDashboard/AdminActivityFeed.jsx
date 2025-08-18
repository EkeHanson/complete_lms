import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, InputAdornment, TablePagination,
  Paper, IconButton, CircularProgress, Alert, Stack
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { userAPI } from '../../../config';
import { useTheme, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ActivityFeed = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allActivities, setAllActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserActivities();
        setAllActivities(response.data.results);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch activities');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Apply search filter and pagination
  useEffect(() => {
    if (allActivities.length === 0) return;

    let filtered = [...allActivities];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.user.toLowerCase().includes(term) ||
        activity.activity_type.toLowerCase().includes(term)
      );
    }

    // Apply pagination
    const startIndex = page * rowsPerPage;
    const paginatedActivities = filtered.slice(startIndex, startIndex + rowsPerPage);

    setDisplayedActivities(paginatedActivities);
  }, [allActivities, searchTerm, page, rowsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const formatActivityType = (type) => {
    const verbMap = {
      login: 'logged in',
      logout: 'logged out',
      password_change: 'changed their password',
      profile_update: 'updated their profile',
      system: 'triggered a system event'
    };
    return verbMap[type] || type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').toLowerCase();
  };

  const formatTimestamp = (timestamp) => {
    const activityDate = dayjs(timestamp);
    const now = dayjs();
    const hoursDiff = now.diff(activityDate, 'hour');

    if (hoursDiff < 24) {
      return activityDate.fromNow();
    } else {
      return activityDate.format('MMM D, YYYY - h:mm A');
    }
  };

  const getTotalFilteredCount = () => {
    let filtered = [...allActivities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.user.toLowerCase().includes(term) ||
        activity.activity_type.toLowerCase().includes(term)
      );
    }

    return filtered.length;
  };

  return (
    <Box
      sx={{
        p: { xs: 0.5, sm: 2, md: 2, pr: 0 },
        marginLeft: 'auto',
        width: { xs: '100vw', sm: '100%', md: 'auto' },
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        gutterBottom
        sx={{ mb: 2, fontWeight: 'medium', px: { xs: 1, sm: 0 } }}
      >
        Activity Feed
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={2}
        sx={{ px: { xs: 1, sm: 0 } }}
      >
        <TextField
          variant="outlined"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 220, md: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              maxHeight: { xs: '50vh', sm: 'calc(100vh - 250px)' },
              overflowY: 'auto',
              backgroundColor: theme.palette.background.paper,
              mb: 1,
              mx: { xs: 1, sm: 0 }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {displayedActivities.length > 0 ? (
                displayedActivities.map((activity) => (
                  <Typography
                    key={activity.id}
                    variant={isMobile ? 'caption' : 'body2'}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <Typography
                      component="span"
                      sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
                    >
                      <Link
                        to={`/activity/${activity.id}`}
                        style={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none'
                        }}
                      >
                        {activity.user}
                      </Link>
                    </Typography>{' '}
                    {formatActivityType(activity.activity_type)} {formatTimestamp(activity.timestamp)}.{' '}
                    <Link
                      to={`/activity/${activity.id}`}
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontSize: 'inherit'
                      }}
                    >
                      [View]
                    </Link>
                  </Typography>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No activities found matching your criteria
                </Typography>
              )}
            </Box>
          </Paper>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={getTotalFilteredCount()}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderBottom: 'none',
              px: { xs: 1, sm: 0 },
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 0,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                minHeight: 40
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ActivityFeed;