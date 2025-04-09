import React, { useState, useEffect } from 'react';
import {
  Box,  Typography,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,
  TableRow,  Paper,  Snackbar,  Alert,
  TextField,  Button,  Select,  MenuItem,  FormControl,  InputLabel,  Chip,
  Avatar,  IconButton,  Tooltip,  useTheme,  Divider,  Pagination,  Grid,
  Dialog,  DialogTitle,  DialogContent,  DialogActions,  FormGroup,  FormControlLabel,  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,  FilterList as FilterIcon,
  Check as CheckIcon,  Close as CloseIcon,
  Edit as EditIcon,  Delete as DeleteIcon,  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,  Person as PersonIcon,  Download as DownloadIcon,
  Feedback as FeedbackIcon,  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import FeedbackForm from './FeedbackForm';

const FeedbackManagement = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [feedbackData, setFeedbackData] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const rowsPerPage = 5;

  // Sample data for trainers and courses
  const trainers = [
    { id: '1', name: 'John Smith', avatar: '' },
    { id: '2', name: 'Sarah Johnson', avatar: '' },
    { id: '3', name: 'Michael Brown', avatar: '' },
    { id: '4', name: 'Emily Davis', avatar: '' },
    { id: '5', name: 'Robert Wilson', avatar: '' },
    { id: '6', name: 'Lisa Thompson', avatar: '' }
  ];

  const courses = [
    { id: '1', name: 'Advanced React' },
    { id: '2', name: 'Node.js Fundamentals' },
    { id: '3', name: 'Database Design' },
    { id: '4', name: 'UI/UX Principles' },
    { id: '5', name: 'JavaScript Advanced' },
    { id: '6', name: 'Python Basics' }
  ];

  // Feedback types for advanced filtering
  const feedbackTypes = ['Assessment', 'Observation', 'Learner Feedback', 'Trainer Self-Review'];

  // Initialize with sample data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    // Simulate API call
    setSnackbarMessage('Data refreshed successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Sample data
    const sampleData = [
      {
        id: 1,
        trainer: 'John Smith',
        course: 'Advanced React',
        date: '2023-05-15',
        type: 'Assessment',
        status: 'Pending',
        comments: 'Assessment criteria needs clarification',
        iqaAction: 'Review required'
      },
      {
        id: 2,
        trainer: 'Sarah Johnson',
        course: 'Node.js Fundamentals',
        date: '2023-05-10',
        type: 'Observation',
        status: 'Resolved',
        comments: 'Excellent session delivery observed',
        iqaAction: 'No action needed'
      },
      {
        id: 3,
        trainer: 'Michael Brown',
        course: 'Database Design',
        date: '2023-05-08',
        type: 'Learner Feedback',
        status: 'In Progress',
        comments: 'Learners requested more practical examples',
        iqaAction: 'Content update scheduled'
      },
      {
        id: 4,
        trainer: 'Emily Davis',
        course: 'UI/UX Principles',
        date: '2023-05-05',
        type: 'Assessment',
        status: 'Pending',
        comments: 'Inconsistent grading across assessments',
        iqaAction: 'Standardization needed'
      },
      {
        id: 5,
        trainer: 'Robert Wilson',
        course: 'JavaScript Advanced',
        date: '2023-05-01',
        type: 'Observation',
        status: 'Resolved',
        comments: 'Technical issues during demo',
        iqaAction: 'Tech check completed'
      },
      {
        id: 6,
        trainer: 'Lisa Thompson',
        course: 'Python Basics',
        date: '2023-04-28',
        type: 'Learner Feedback',
        status: 'In Progress',
        comments: 'Pace too fast for beginners',
        iqaAction: 'Pacing adjustment in progress'
      }
    ];
    
    setFeedbackData(sampleData);
  };

  const handleFeedbackSubmit = (newFeedback) => {
    // Format the new feedback
    const newFeedbackWithId = {
      ...newFeedback,
      id: Math.max(...feedbackData.map(f => f.id)) + 1,
      trainer: trainers.find(t => t.id === newFeedback.trainerId)?.name || 'N/A',
      course: courses.find(c => c.id === newFeedback.courseId)?.name || 'N/A',
      type: newFeedback.type.charAt(0).toUpperCase() + newFeedback.type.slice(1) + ' Feedback',
      status: 'Pending',
      iqaAction: 'Review required',
      date: new Date().toISOString().split('T')[0]
    };

    setFeedbackData(prev => [newFeedbackWithId, ...prev]);
    setShowFeedbackForm(false);
    setSnackbarMessage('Feedback submitted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const generateReport = () => {
    setSnackbarMessage('Feedback report generated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Create a CSV file
    const headers = ['Trainer', 'Course', 'Date', 'Type', 'Status', 'Comments', 'IQA Action'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.trainer}"`,
        `"${item.course}"`,
        `"${item.date}"`,
        `"${item.type}"`,
        `"${item.status}"`,
        `"${item.comments}"`,
        `"${item.iqaAction}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback-report-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = (id, newStatus) => {
    setFeedbackData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    setSnackbarMessage(`Feedback status updated to ${newStatus}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDelete = (id) => {
    setFeedbackData(prevData => prevData.filter(item => item.id !== id));
    setSnackbarMessage('Feedback deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleTypeFilterChange = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const applyAdvancedFilters = () => {
    setFilterDialogOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setStatusFilter('all');
    setSearchTerm('');
  };

  const filteredData = feedbackData.filter(item => {
    const matchesSearch = 
      item.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comments.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesTypes = 
      selectedTypes.length === 0 || selectedTypes.includes(item.type);
    
    return matchesSearch && matchesStatus && matchesTypes;
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in progress':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  if (showFeedbackForm) {
    return (
      <FeedbackForm 
        trainers={trainers}
        courses={courses}
        onSubmit={handleFeedbackSubmit}
        onCancel={() => setShowFeedbackForm(false)}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Feedback Management
      </Typography>
      
      {/* Filters and Search */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ height: '56px' }}
            onClick={() => setFilterDialogOpen(true)}
          >
            Advanced Filters
          </Button>
        </Grid>
      </Grid>

      {/* Feedback Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Trainer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>IQA Action</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    {row.trainer}
                  </Box>
                </TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.comments}
                </TableCell>
                <TableCell>{row.iqaAction}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Mark as Resolved">
                      <IconButton size="small" onClick={() => handleStatusChange(row.id, 'Resolved')}>
                        <CheckIcon color="success" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small">
                        <EditIcon color="info" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(row.id)}>
                        <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedData.length} of {filteredData.length} feedback items
        </Typography>
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Quick Actions */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={generateReport}
        >
          Generate Feedback Report
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={refreshData}
        >
          Refresh Data
        </Button>
        <Button 
          variant="contained" 
          startIcon={<FeedbackIcon />}
          onClick={() => setShowFeedbackForm(true)}
          sx={{ ml: 'auto' }}
        >
          Give New Feedback
        </Button>
      </Box>

      {/* Advanced Filters Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Feedback Types
          </Typography>
          <FormGroup>
            {feedbackTypes.map(type => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeFilterChange(type)}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset All</Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={applyAdvancedFilters}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackManagement;