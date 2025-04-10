import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Box, 
  useTheme, Typography, Menu, MenuItem, TablePagination,
  TextField, Button, Grid, Tabs, Tab, Divider
} from '@mui/material';
import { 
  Edit, Visibility, MoreVert, 
  Search, FilterList, Refresh 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Dummy data for courses
const dummyCourses = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Course ${i + 1}`,
  code: `CODE-${i + 100}`,
  category: ['Web Development', 'Backend Development', 'Design', 'Data Science'][i % 4],
  level: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
  price: 100 + (i * 10),
  discountPrice: i % 2 === 0 ? 80 + (i * 8) : null,
  currency: 'NGN',
  status: ['Published', 'Draft', 'Archived'][i % 3],
  learningOutcomes: [
    'Master key concepts',
    'Build practical applications',
    'Implement advanced techniques',
    'Develop professional skills'
  ].slice(0, (i % 4) + 1),
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString()
}));

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

  // Filter courses based on active tab, search term and other filters
  const filteredCourses = dummyCourses.filter(course => {
    const matchesStatus = activeStatusTab === 'all' || course.status === activeStatusTab;
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || course.category === filters.category;
    const matchesLevel = filters.level === 'all' || course.level === filters.level;
    
    return matchesStatus && matchesSearch && matchesCategory && matchesLevel;
  });

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

  const handleDelete = (courseId) => {
    console.log('Delete course', courseId);
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusTabChange = (event, newValue) => {
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

      {/* Filter Dialog - Would implement as a separate modal component in a real app */}
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
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Backend Development">Backend Development</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
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
            {filteredCourses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.category} • {course.level}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>
                    {course.discountPrice ? (
                      <>
                        <Typography sx={{ textDecoration: 'line-through' }}>
                          {formatPrice(course.price, course.currency)}
                        </Typography>
                        <Typography color="error" sx={{ fontWeight: 600 }}>
                          {formatPrice(course.discountPrice, course.currency)}
                        </Typography>
                      </>
                    ) : (
                      <Typography>{formatPrice(course.price, course.currency)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                        <>
                          {course.learningOutcomes.slice(0, 2).map((outcome, i) => (
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
                          {course.learningOutcomes.length > 2 && (
                            <Typography variant="caption">
                              +{course.learningOutcomes.length - 2} more
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
              ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCourses.length}
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