import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Box, 
  useTheme, Typography, Menu, MenuItem, TablePagination,
  TextField, Button, Grid, Tabs, Tab, Divider, CircularProgress, Alert
} from '@mui/material';
import { 
  Edit, Visibility, MoreVert, 
  Search, FilterList, Refresh 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../../config';

const CourseList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all'
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]); // Store all courses
  const [filteredCourses, setFilteredCourses] = useState([]); // Store filtered courses
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses once on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: 1,
          page_size: 1000, // Fetch all courses (adjust if needed)
          search: searchTerm || undefined,
          category: filters.category === 'all' ? undefined : filters.category,
          level: filters.level === 'all' ? undefined : filters.level
        };
        
        // Remove undefined/null parameters
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === null) {
            delete params[key];
          }
        });

        //console.log('API Request Params:', params); // Debug: Log params
        const response = await coursesAPI.getCourses(params);
       // console.log('API Response:', response.data); // Debug: Log response

        setAllCourses(response.data.results || []);
        setTotalCourses(response.data.count || 0);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch courses';
        setError(errorMsg);
        console.error('Error fetching courses:', err, 'Response:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, []); // Empty dependency array: fetch once on mount

  // Filter courses client-side whenever status, search, or filters change
  useEffect(() => {
    let filtered = [...allCourses];

    // Apply status filter
    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(course => course.status === activeStatusTab);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.category.name === filters.category);
    }

    // Apply level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    // Update filtered courses and total count
    setFilteredCourses(filtered);
    setTotalCourses(filtered.length);

    // Reset page if filtered results are fewer than current page
    if (page * rowsPerPage >= filtered.length) {
      setPage(0);
    }

    //console.log('Filtered Courses:', filtered); // Debug: Log filtered results
  }, [activeStatusTab, searchTerm, filters, allCourses, page, rowsPerPage]);

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/courses/edit/${courseId}`);
    handleMenuClose();
  };

  const handleView = (courseId) => {
    navigate(`/admin/courses/view/${courseId}`);
    handleMenuClose();
  };

  const handleDelete = async (courseId) => {
    try {
      await coursesAPI.deleteCourse(courseId);
      setAllCourses(prev => prev.filter(course => course.id !== courseId));
      setTotalCourses(prev => prev - 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete course');
    } finally {
      handleMenuClose();
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusTabChange = (event, newValue) => {
    // console.log('Status Tab Changed:', newValue); // Debug: Log tab change
    setActiveStatusTab(newValue);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      level: 'all'
    });
    setSearchTerm('');
    setActiveStatusTab('all');
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'default';
      default: return 'info';
    }
  };

  const formatPrice = (price, currency) => {
    if (price === undefined || price === null) return 'Free';
    
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
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

  // Paginate filtered courses
  const paginatedCourses = filteredCourses.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Box>
      {/* Filter and Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ height: '56px' }}
              onClick={() => setFilterDialogOpen(true)}
            >
              Filters
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ height: '56px' }}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Status Tabs */}
        <Tabs 
          value={activeStatusTab} 
          onChange={handleStatusTabChange}
          sx={{
            mt: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3
            }
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Published" value="Published" />
          <Tab label="Draft" value="Draft" />
          <Tab label="Archived" value="Archived" />
        </Tabs>
        <Divider />
      </Paper>

      {/* Filter Dialog */}
      {filterDialogOpen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Array.from(new Set(allCourses.map(c => c.category.name))).map(categoryName => (
                  <MenuItem key={categoryName} value={categoryName}>
                    {categoryName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Level"
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => setFilterDialogOpen(false)}
              sx={{ ml: 2 }}
            >
              Apply Filters
            </Button>
          </Box>
        </Paper>
      )}

      {/* Error Alert */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Courses Table */}
      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200 }}>Title</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Code</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Price</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Outcomes</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No courses found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.category.name} • {course.level}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>
                    {course.discount_price ? (
                      <>
                        <Typography sx={{ textDecoration: 'line-through' }}>
                          {formatPrice(course.price, course.currency)}
                        </Typography>
                        <Typography color="error" sx={{ fontWeight: 600 }}>
                          {formatPrice(course.discount_price, course.currency)}
                        </Typography>
                      </>
                    ) : (
                      <Typography>{formatPrice(course.price, course.currency)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {course.learning_outcomes?.length > 0 ? (
                        <>
                          {course.learning_outcomes.slice(0, 2).map((outcome, i) => (
                            <Typography 
                              key={i} 
                              variant="body2" 
                              sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              • {outcome}
                            </Typography>
                          ))}
                          {course.learning_outcomes.length > 2 && (
                            <Typography variant="caption">
                              +{course.learning_outcomes.length - 2} more
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No outcomes specified
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={course.status} 
                      size="small" 
                      color={getStatusColor(course.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(course.id)}
                      aria-label="edit"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleView(course.id)}
                      aria-label="view"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, course)}
                      aria-label="more options"
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCourses}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* More options menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleEdit(selectedCourse?.id)}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleView(selectedCourse?.id)}>
            <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedCourse?.id)} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>
      </TableContainer>
    </Box>
  );
};

export default CourseList;