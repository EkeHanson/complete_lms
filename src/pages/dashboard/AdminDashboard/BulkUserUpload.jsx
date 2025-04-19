import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, Divider, Alert, LinearProgress, useTheme,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, InputAdornment
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

        // Parse file and show preview modal
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
    if (validationErrors.length) {
      return; // Don't proceed if there are validation errors
    }
    try {
      // Prepare user data for the API
      const userData = {
        first_name: editedUser.firstName || '',
        last_name: editedUser.lastName || '',
        email: editedUser.email || '',
        password: editedUser.password || '',
        role: editedUser.role || 'learner', // Default role if not specified
        birth_date: editedUser.birthDate || null,
        status: editedUser.status || 'active', // Default status if not specified
        department: editedUser.department || null,
      };
  
      // Call the createUser API to save the user
      const response = await userAPI.createUser(userData);
  
      if (response.status === 201 || response.status === 200) {
        // Update previewData with the saved user
        setPreviewData((prev) => {
          const newData = [...prev];
          newData[selectedUserIndex] = {
            ...editedUser,
            id: response.data.id, // Optionally store the user ID if returned
          };
          return newData;
        });
  
        // Show success message
        setUploadResult({
          success: true,
          message: `User ${userData.email} saved successfully`,
          details: [],
        });
  
        // Reset form
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

  // const processFile = async () => {
  //   if (!file) return;
    
  //   setIsProcessing(true);
  //   setUploadResult(null);
    
  //   try {
  //     const response = await userAPI.bulkUpload(file);
      
  //     if (response.data.success) {
  //       setUploadResult({
  //         success: true,
  //         message: `Successfully processed ${response.data.created_count} users`,
  //         details: response.data.errors || []
  //       });
        
  //       if (onUpload && response.data.created_count > 0) {
  //         onUpload();
  //       }
  //     } else {
  //       setUploadResult({
  //         success: false,
  //         message: response.data.error || 'Upload failed',
  //         details: response.data.errors || []
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     let errorDetails = [];
      
  //     if (error.response?.data?.errors) {
  //       errorDetails = error.response.data.errors;
  //     } else if (error.response?.data?.error) {
  //       errorDetails = [error.response.data.error];
  //     } else {
  //       errorDetails = [error.message || 'Network error'];
  //     }
      
  //     setUploadResult({
  //       success: false,
  //       message: 'Error processing file',
  //       details: errorDetails
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const processFile = async () => {
    if (!file || previewData.length === 0) return;
  
    setIsProcessing(true);
    setUploadResult(null);
  
    try {
      // Filter out users that were already saved (have an ID)
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
  
      // Convert unsaved users to CSV or FormData for bulk upload
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

  // Filter users based on search query
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

        {isProcessing && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Processing your file...
            </Typography>
          </Box>
        )}

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
                      {/* Handle both string and object error details */}
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

      {/* Preview Modal */}
      <Dialog
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Preview and Edit Users</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* User List */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Users ({filteredUsers.length}/{previewData.length})
              </Typography>
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
              <Paper sx={{ maxHeight: '55vh', overflow: 'auto' }}>
                <List>
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
                        selected={selectedUserIndex === previewData.indexOf(user)}
                        onClick={() => handleSelectUser(previewData.indexOf(user))}
                        sx={{
                          borderLeft: selectedUserIndex === previewData.indexOf(user) ? `4px solid ${theme.palette.primary.main}` : 'none',
                          bgcolor: selectedUserIndex === previewData.indexOf(user) ? theme.palette.action.selected : 'inherit',
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {getInitial(user)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}
                          secondary={user.email || 'No email'}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ color: 'text.secondary' }}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            {/* User Edit Form */}
            <Grid item xs={12} md={8}>
              {selectedUserIndex !== null && editedUser ? (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Edit User (Row {selectedUserIndex + 2})
                  </Typography>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="First Name"
                        value={editedUser.firstName || ''}
                        onChange={(e) => handleEditUser('firstName', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Last Name"
                        value={editedUser.lastName || ''}
                        onChange={(e) => handleEditUser('lastName', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleEditUser('email', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Password"
                        value={editedUser.password || ''}
                        onChange={(e) => handleEditUser('password', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        select
                        label="Role"
                        value={editedUser.role || ''}
                        onChange={(e) => handleEditUser('role', e.target.value)}
                        fullWidth
                        size="small"
                      >
                        {['admin', 'instructor', 'learner', 'owner'].map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Birth Date (YYYY-MM-DD)"
                        value={editedUser.birthDate || ''}
                        onChange={(e) => handleEditUser('birthDate', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        select
                        label="Status"
                        value={editedUser.status || ''}
                        onChange={(e) => handleEditUser('status', e.target.value)}
                        fullWidth
                        size="small"
                      >
                        {['active', 'pending', 'suspended'].map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Department"
                        value={editedUser.department || ''}
                        onChange={(e) => handleEditUser('department', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      {validationErrors.length > 0 && (
                        <Alert severity="error">
                          <Typography variant="body2">Validation Errors:</Typography>
                          <ul>
                            {validationErrors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </Alert>
                      )}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleSaveUser}
                          disabled={validationErrors.length > 0}
                        >
                          Save User
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleRemoveUser}
                        >
                          Remove User
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">
                    Select a user to edit or remove their details
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPreviewModal(false);
              setFile(null);
              setPreviewData([]);
              setSearchQuery('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={processFile}
            disabled={isProcessing || previewData.length === 0}
          >
            {isProcessing ? 'Processing...' : 'Submit All Users'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove User Confirmation Dialog */}
      <Dialog
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this user from the upload list?
            {editedUser && (
              <strong> {editedUser.email || 'Unnamed User'}</strong>
            )}
            This action cannot be undone.
          </Typography>
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