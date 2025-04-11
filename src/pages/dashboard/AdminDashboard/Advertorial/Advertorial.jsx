import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
  Tooltip, Link, Chip, Checkbox, FormControlLabel, 
  FormGroup, Divider, useMediaQuery, IconButton, Stack, 
  Collapse, Card, CardContent, CardActions, Grid,
  TablePagination, Switch, FormControl, InputLabel, Select,
  Avatar, List, ListItem, ListItemAvatar, ListItemText,
  LinearProgress
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, Search as SearchIcon, 
  FilterList as FilterIcon, Refresh as RefreshIcon,
  Image as ImageIcon, Link as LinkIcon, Schedule as ScheduleIcon,
  Close as CloseIcon, CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios'; // You'll need to install axios

// Mock API service for file uploads
const uploadFile = async (file) => {
  // In a real implementation, this would upload to your backend
  // For demo purposes, we'll simulate an upload with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      resolve({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        url: url,
        type: file.type,
        size: file.size
      });
    }, 1500);
  });
};

// Mock data for adverts with images
const mockAdverts = [
  { 
    id: 1, 
    title: 'Summer Course Discount', 
    content: 'Get 20% off on all summer courses. Limited time offer!',
    images: [
      {
        id: 'img1',
        name: 'summer-sale.jpg',
        url: '/images/summer-sale.jpg',
        type: 'image/jpeg',
        size: 102400
      }
    ],
    link: '/summer-offer',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-06-30'),
    status: 'active',
    priority: 1,
    target: 'all'
  },
  { 
    id: 2, 
    title: 'New Course Announcement', 
    content: 'Check out our new Advanced Data Science course starting next month.',
    images: [
      {
        id: 'img2',
        name: 'data-science.jpg',
        url: '/images/data-science.jpg',
        type: 'image/jpeg',
        size: 153600
      },
      {
        id: 'img3',
        name: 'course-banner.png',
        url: '/images/course-banner.png',
        type: 'image/png',
        size: 204800
      }
    ],
    link: '/courses/data-science',
    startDate: new Date('2023-06-15'),
    endDate: new Date('2023-07-15'),
    status: 'active',
    priority: 2,
    target: 'learners'
  }
];

const targetOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'learners', label: 'Learners Only' },
  { value: 'instructors', label: 'Instructors Only' },
  { value: 'admins', label: 'Admins Only' },
];

const Advertorial = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [adverts, setAdverts] = useState(mockAdverts);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAdvert, setCurrentAdvert] = useState(null);
  const [expandedAdvert, setExpandedAdvert] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    target: 'all',
    dateFrom: null,
    dateTo: null
  });

  // Handle file uploads
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newUploadingFiles = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      progress: 0,
      file: file
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (const uploadFileObj of newUploadingFiles) {
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [uploadFileObj.id]: Math.min(prev[uploadFileObj.id] + 10, 90)
          }));
        }, 300);

        // Upload the file
        const uploadedFile = await uploadFile(uploadFileObj.file);

        // Clear interval and set progress to 100%
        clearInterval(progressInterval);
        setUploadProgress(prev => ({
          ...prev,
          [uploadFileObj.id]: 100
        }));

        // Add the uploaded file to the current advert
        setCurrentAdvert(prev => ({
          ...prev,
          images: [...(prev.images || []), uploadedFile]
        }));

        // Remove from uploading files after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadFileObj.id));
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[uploadFileObj.id];
            return newProgress;
          });
        }, 500);
      } catch (error) {
        console.error('Upload failed:', error);
        setSnackbar({
          open: true,
          message: `Failed to upload ${uploadFileObj.name}`,
          severity: 'error'
        });
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadFileObj.id));
      }
    }

    // Clear the file input
    event.target.value = '';
  };

  // Handle file deletion
  const handleDeleteImage = (imageId) => {
    setCurrentAdvert(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filters change
  };

  // Filter adverts based on current filters
  const filteredAdverts = adverts.filter(advert => {
    const matchesSearch = filters.search === '' || 
      advert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      advert.content.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || advert.status === filters.status;
    const matchesTarget = filters.target === 'all' || advert.target === filters.target;
    
    const matchesDateFrom = !filters.dateFrom || new Date(advert.startDate) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(advert.endDate) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesTarget && matchesDateFrom && matchesDateTo;
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenDialog = (advert = null) => {
    const defaultAdvert = { 
      title: '', 
      content: '',
      images: [],
      link: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      status: 'active',
      priority: 1,
      target: 'all'
    };

    if (advert) {
      setCurrentAdvert(advert);
    } else {
      setCurrentAdvert(defaultAdvert);
    }
    
    setOpenDialog(true);
    setUploadingFiles([]);
    setUploadProgress({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveAdvert = () => {
    const updatedAdvert = {
      ...currentAdvert,
      startDate: new Date(currentAdvert.startDate),
      endDate: new Date(currentAdvert.endDate)
    };

    if (updatedAdvert.id) {
      setAdverts(adverts.map(a => a.id === updatedAdvert.id ? updatedAdvert : a));
    } else {
      setAdverts([...adverts, { ...updatedAdvert, id: adverts.length + 1 }]);
    }
    
    setSnackbar({
      open: true,
      message: 'Advert saved successfully!',
      severity: 'success'
    });
    
    handleCloseDialog();
  };

  const handleDeleteAdvert = (id) => {
    setAdverts(adverts.filter(a => a.id !== id));
    setSnackbar({
      open: true,
      message: 'Advert deleted successfully!',
      severity: 'success'
    });
  };

  const toggleAdvertStatus = (id) => {
    setAdverts(adverts.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'retired' : 'active' } : a
    ));
  };

  const toggleExpandAdvert = (advertId) => {
    setExpandedAdvert(expandedAdvert === advertId ? null : advertId);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      target: 'all',
      dateFrom: null,
      dateTo: null
    });
  };

  // Mobile view for adverts
  const renderMobileAdvertCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {filteredAdverts
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((advert) => (
          <Card key={advert.id} elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    {advert.title}
                  </Typography>
                  <Chip 
                    label={advert.status === 'active' ? 'Active' : 'Retired'} 
                    size="small"
                    color={advert.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
                <IconButton onClick={() => toggleExpandAdvert(advert.id)}>
                  {expandedAdvert === advert.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Typography color="text.secondary" gutterBottom>
                {formatDate(advert.startDate)} - {formatDate(advert.endDate)}
              </Typography>
              
              <Collapse in={expandedAdvert === advert.id}>
                <Box sx={{ mt: 2 }}>
                  {advert.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Images:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {advert.images.map((image) => (
                          <Box key={image.id} sx={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                            <img 
                              src={image.url} 
                              alt={image.name} 
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {advert.content}
                  </Typography>
                  
                  <Typography variant="subtitle2">Target:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {targetOptions.find(t => t.value === advert.target)?.label || advert.target}
                  </Typography>
                  
                  <Typography variant="subtitle2">Priority:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {advert.priority}
                  </Typography>
                  
                  {advert.link && (
                    <>
                      <Typography variant="subtitle2">Link:</Typography>
                      <Link href={advert.link} target="_blank" rel="noopener noreferrer">
                        {advert.link}
                      </Link>
                    </>
                  )}
                </Box>
              </Collapse>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advert.status === 'active'}
                    onChange={() => toggleAdvertStatus(advert.id)}
                    color="primary"
                  />
                }
                label={advert.status === 'active' ? 'Active' : 'Retired'}
              />
              <Box>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(advert)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteAdvert(advert.id)}
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </CardActions>
          </Card>
        ))}
    </Box>
  );

  // Desktop view for adverts
  const renderDesktopAdvertTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Images</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Date Range</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAdverts
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((advert) => (
              <TableRow 
                key={advert.id} 
                hover 
                sx={{ 
                  '&:hover': { cursor: 'pointer' },
                  backgroundColor: expandedAdvert === advert.id ? 'action.hover' : 'inherit'
                }}
                onClick={() => toggleExpandAdvert(advert.id)}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {advert.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={advert.status === 'active' ? 'Active' : 'Retired'} 
                    color={advert.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    {advert.images.slice(0, 2).map((image) => (
                      <Avatar 
                        key={image.id}
                        src={image.url}
                        variant="rounded"
                        sx={{ width: 40, height: 40, mr: 1 }}
                      >
                        <ImageIcon />
                      </Avatar>
                    ))}
                    {advert.images.length > 2 && (
                      <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                        +{advert.images.length - 2}
                      </Avatar>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {targetOptions.find(t => t.value === advert.target)?.label || advert.target}
                </TableCell>
                <TableCell>
                  {formatDate(advert.startDate)} - {formatDate(advert.endDate)}
                </TableCell>
                <TableCell>
                  {advert.priority}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={advert.status === 'active' ? 'Retire Advert' : 'Activate Advert'}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAdvertStatus(advert.id);
                        }}
                        color={advert.status === 'active' ? 'success' : 'default'}
                      >
                        {advert.status === 'active' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(advert);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAdvert(advert.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Advert Management
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Manage advertisements that appear on the homepage. Active ads will be displayed, retired ads will be archived.
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
          fullWidth={isMobile}
        >
          Create New Advert
        </Button>
        
        {/* Filters Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search adverts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Target Audience"
                value={filters.target}
                onChange={(e) => handleFilterChange('target', e.target.value)}
              >
                <MenuItem value="all">All Users</MenuItem>
                {targetOptions.filter(t => t.value !== 'all').map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <DatePicker
                label="From Date"
                value={filters.dateFrom}
                onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <DatePicker
                label="To Date"
                value={filters.dateTo}
                onChange={(newValue) => handleFilterChange('dateTo', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1} sx={{ textAlign: 'right' }}>
              <IconButton onClick={resetFilters}>
                <RefreshIcon />
              </IconButton>
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>

        {isMobile ? renderMobileAdvertCards() : renderDesktopAdvertTable()}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAdverts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {currentAdvert?.id ? 'Edit Advert' : 'Create New Advert'}
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Advert Title"
              fullWidth
              value={currentAdvert?.title || ''}
              onChange={(e) => setCurrentAdvert({...currentAdvert, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Advert Content"
              fullWidth
              multiline
              rows={4}
              value={currentAdvert?.content || ''}
              onChange={(e) => setCurrentAdvert({...currentAdvert, content: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={currentAdvert?.startDate || new Date()}
                  onChange={(newValue) => setCurrentAdvert({...currentAdvert, startDate: newValue})}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={currentAdvert?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  onChange={(newValue) => setCurrentAdvert({...currentAdvert, endDate: newValue})}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      margin="dense"
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={currentAdvert?.target || 'all'}
                    label="Target Audience"
                    onChange={(e) => setCurrentAdvert({...currentAdvert, target: e.target.value})}
                  >
                    {targetOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  margin="dense"
                  label="Priority"
                  fullWidth
                  value={currentAdvert?.priority || 1}
                  onChange={(e) => setCurrentAdvert({...currentAdvert, priority: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            {/* Image Upload Section */}
            <Typography variant="subtitle1" gutterBottom>
              Images
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Current Images */}
            {currentAdvert?.images?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <List dense>
                  {currentAdvert.images.map((image) => (
                    <ListItem 
                      key={image.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={image.url} 
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={image.name}
                        secondary={formatFileSize(image.size)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Uploading Files
                </Typography>
                <List dense>
                  {uploadingFiles.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[file.id] || 0}
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* File Upload Button */}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-images"
              type="file"
              multiple
              onChange={handleFileUpload}
            />
            <label htmlFor="upload-images">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Images
              </Button>
            </label>
            
            <Typography variant="caption" display="block" gutterBottom>
              Upload one or multiple images (JPG, PNG, GIF)
            </Typography>
            
            <TextField
              margin="dense"
              label="Link URL"
              fullWidth
              value={currentAdvert?.link || ''}
              onChange={(e) => setCurrentAdvert({...currentAdvert, link: e.target.value})}
              InputProps={{
                startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={currentAdvert?.status === 'active'}
                  onChange={(e) => setCurrentAdvert({
                    ...currentAdvert, 
                    status: e.target.checked ? 'active' : 'retired'
                  })}
                  color="primary"
                />
              }
              label={currentAdvert?.status === 'active' ? 'Active' : 'Retired'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveAdvert} 
              variant="contained" 
              disabled={uploadingFiles.length > 0}
            >
              Save Advert
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Advertorial;