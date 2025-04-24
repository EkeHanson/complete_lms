import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, Divider, Alert, CircularProgress, useTheme,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, InputAdornment, Backdrop
} from '@mui/material';
import {
  Publish as UploadIcon, Description as FileIcon, CheckCircle as SuccessIcon,
  Error as ErrorIcon, CloudDownload as DownloadIcon, Search as SearchIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { userAPI } from '../../../config';

const BulkUserUpload = ({ onUpload }) => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  // Template data for download
  const templateData = [
    ['firstName', 'lastName', 'email', 'password', 'role', 'birthDate', 'status', 'department'],
    ['John', 'Doe', 'john@example.com', 'SecurePass123!', 'learner', '1990-01-15', 'active', 'Engineering'],
    ['Jane', 'Smith', 'jane@example.com', 'SecurePass456!', 'instructor', '1985-05-22', 'active', 'Mathematics']
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        setFile(acceptedFiles[0]);
        setUploadResult(null);

        const data = await acceptedFiles[0].arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData);
        setOpenPreviewModal(true);
      }
    }
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "user_upload_template.xlsx");
  };

  const validateUserData = (userData, index) => {
    const errors = [];
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
    
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors.push(`Row ${index + 2}: Missing required field: ${field}`);
      }
    });

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push(`Row ${index + 2}: Invalid email format`);
    }

    if (userData.password && userData.password.length < 8) {
      errors.push(`Row ${index + 2}: Password must be at least 8 characters`);
    }

    const validRoles = ['admin', 'instructor', 'learner', 'owner'];
    if (userData.role && !validRoles.includes(userData.role.toLowerCase())) {
      errors.push(`Row ${index + 2}: Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    if (userData.birthDate && isNaN(new Date(userData.birthDate).getTime())) {
      errors.push(`Row ${index + 2}: Invalid birth date format (use YYYY-MM-DD)`);
    }

    const validStatuses = ['active', 'pending', 'suspended'];
    if (userData.status && !validStatuses.includes(userData.status.toLowerCase())) {
      errors.push(`Row ${index + 2}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return errors.length ? errors : null;
  };

  const handleSelectUser = (index) => {
    setSelectedUserIndex(index);
    setEditedUser({ ...previewData[index] });
    setValidationErrors(validateUserData(previewData[index], index) || []);
  };

  const handleEditUser = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
    setValidationErrors(validateUserData({ ...editedUser, [field]: value }, selectedUserIndex) || []);
  };

  const handleSaveUser = async () => {
    if (validationErrors.length) return;

    try {
      const userData = {
        first_name: editedUser.firstName || '',
        last_name: editedUser.lastName || '',
        email: editedUser.email || '',
        password: editedUser.password || '',
        role: editedUser.role || 'learner',
        birth_date: editedUser.birthDate || null,
        status: editedUser.status || 'active',
        department: editedUser.department || null,
      };

      const response = await userAPI.createUser(userData);

      if (response.status === 201 || response.status === 200) {
        setPreviewData((prev) => {
          const newData = [...prev];
          newData[selectedUserIndex] = {
            ...editedUser,
            id: response.data.id,
          };
          return newData;
        });

        setUploadResult({
          success: true,
          message: `User ${userData.email} saved successfully`,
          details: [],
        });

        setSelectedUserIndex(null);
        setEditedUser(null);
        setValidationErrors([]);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      let errorMessage = 'Failed to save user';
      let errorDetails = [];

      if (error.response?.data) {
        errorMessage = error.response.data.error || 'Error saving user';
        errorDetails = error.response.data.errors || [errorMessage];
      } else {
        errorDetails = [error.message || 'Network error'];
      }

      setUploadResult({
        success: false,
        message: errorMessage,
        details: errorDetails,
      });
    }
  };

  const handleRemoveUser = () => {
    setOpenRemoveConfirm(true);
  };

  const confirmRemoveUser = () => {
    if (selectedUserIndex !== null) {
      setPreviewData(prev => {
        const newData = prev.filter((_, index) => index !== selectedUserIndex);
        return newData;
      });
      setSelectedUserIndex(null);
      setEditedUser(null);
      setValidationErrors([]);
      if (previewData.length === 1) {
        setOpenPreviewModal(false);
        setFile(null);
        setSearchQuery('');
      }
    }
    setOpenRemoveConfirm(false);
  };

  const processFile = async () => {
    if (!file || previewData.length === 0) return;

    setIsProcessing(true);
    setUploadResult(null);

    try {
      const unsavedUsers = previewData.filter(user => !user.id);
      if (unsavedUsers.length === 0) {
        setUploadResult({
          success: true,
          message: 'All users already saved individually',
          details: [],
        });
        setIsProcessing(false);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(unsavedUsers);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv' });
      const csvFile = new File([blob], 'users.csv', { type: 'text/csv' });

      const response = await userAPI.bulkUpload(csvFile);

      if (response.data.success) {
        setUploadResult({
          success: true,
          message: `Successfully processed ${response.data.created_count} users`,
          details: response.data.errors || [],
        });

        if (onUpload && response.data.created_count > 0) {
          onUpload();
        }
      } else {
        setUploadResult({
          success: false,
          message: response.data.error || 'Upload failed',
          details: response.data.errors || [],
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorDetails = [];

      if (error.response?.data?.errors) {
        errorDetails = error.response.data.errors;
      } else if (error.response?.data?.error) {
        errorDetails = [error.response.data.error];
      } else {
        errorDetails = [error.message || 'Network error'];
      }

      setUploadResult({
        success: false,
        message: 'Error processing file',
        details: errorDetails,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitial = (user) => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  const filteredUsers = previewData.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.firstName?.toLowerCase() || '').includes(searchLower) ||
      (user.lastName?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isProcessing}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Processing your file...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please wait while we upload and validate your data
          </Typography>
        </Box>
      </Backdrop>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Bulk User Upload
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload an Excel or CSV file to register multiple users at once
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{ mr: 2 }}
          >
            Download Template
          </Button>
          <Typography variant="caption" color="text.secondary">
            Use our template to ensure proper formatting
          </Typography>
        </Box>

        <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Required Fields:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            - firstName, lastName, email, password, role
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Optional Fields:
          </Typography>
          <Typography variant="body2">
            - birthDate (YYYY-MM-DD), status (active/pending/suspended), department
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
            cursor: 'pointer',
            mb: 3
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">{file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(file.size / 1024)} KB
              </Typography>
            </>
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excel (.xlsx, .xls) or CSV files only
              </Typography>
            </>
          )}
        </Box>

        {uploadResult && (
          <Alert
            icon={uploadResult.success ? <SuccessIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />}
            severity={uploadResult.success ? 'success' : 'error'}
            sx={{ mt: 3 }}
          >
            <Typography fontWeight="bold">{uploadResult.message}</Typography>
            {uploadResult.details && (
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {uploadResult.details.map((detail, index) => (
                  <li key={index}>
                    <Typography variant="body2">
                      {typeof detail === 'string' ? detail : 
                      detail.error ? `Row ${detail.row}: ${detail.error}` : 
                      JSON.stringify(detail)}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </Paper>

      <Dialog
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh',
            width: '90%',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Preview and Edit Users</span>
          <Typography variant="body2" color="text.secondary">
            {previewData.length} users found
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Paper sx={{ height: '50vh', overflow: 'auto' }}>
                <List dense>
                  {filteredUsers.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <ListItem
                        key={index}
                        button
                        dense
                        selected={selectedUserIndex === previewData.indexOf(user)}
                        onClick={() => handleSelectUser(previewData.indexOf(user))}
                        sx={{
                          borderLeft: selectedUserIndex === previewData.indexOf(user) ? `3px solid ${theme.palette.primary.main}` : 'none',
                          bgcolor: selectedUserIndex === previewData.indexOf(user) ? theme.palette.action.selected : 'inherit',
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.main,
                              fontSize: '0.875rem',
                            }}
                          >
                            {getInitial(user)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}
                          secondary={user.email || 'No email'}
                          primaryTypographyProps={{ 
                            fontWeight: 500,
                            variant: 'body2',
                            noWrap: true
                          }}
                          secondaryTypographyProps={{ 
                            color: 'text.secondary',
                            variant: 'caption',
                            noWrap: true
                          }}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              {selectedUserIndex !== null && editedUser ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Edit User (Row {selectedUserIndex + 2})
                  </Typography>
                  <Paper sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          value={editedUser.firstName || ''}
                          onChange={(e) => handleEditUser('firstName', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          value={editedUser.lastName || ''}
                          onChange={(e) => handleEditUser('lastName', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          value={editedUser.email || ''}
                          onChange={(e) => handleEditUser('email', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Password"
                          value={editedUser.password || ''}
                          onChange={(e) => handleEditUser('password', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Role"
                          value={editedUser.role || ''}
                          onChange={(e) => handleEditUser('role', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        >
                          {['admin', 'instructor', 'learner', 'owner'].map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Birth Date (YYYY-MM-DD)"
                          value={editedUser.birthDate || ''}
                          onChange={(e) => handleEditUser('birthDate', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Status"
                          value={editedUser.status || ''}
                          onChange={(e) => handleEditUser('status', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        >
                          {['active', 'pending', 'suspended'].map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Department"
                          value={editedUser.department || ''}
                          onChange={(e) => handleEditUser('department', e.target.value)}
                          fullWidth
                          size="small"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                    
                    {validationErrors.length > 0 && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                          {validationErrors.map((error, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{error}</Typography>
                            </li>
                          ))}
                        </Box>
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSaveUser}
                        disabled={validationErrors.length > 0}
                        size="small"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveUser}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ 
                  height: '50vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography color="text.secondary">
                    Select a user to edit details
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={processFile}
            disabled={isProcessing || previewData.length === 0}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Processing...' : 'Submit All Users'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Remove this user from the upload list?
          </Typography>
          {editedUser && (
            <Typography fontWeight="bold" sx={{ mt: 1 }}>
              {editedUser.email || 'Unnamed User'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveConfirm(false)}>Cancel</Button>
          <Button
            onClick={confirmRemoveUser}
            variant="contained"
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BulkUserUpload;