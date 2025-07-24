import React, { useState, useEffect } from 'react';
import {
  Publish as UploadIcon, Description as FileIcon, CheckCircle as SuccessIcon,
  Error as ErrorIcon, CloudDownload as DownloadIcon, Search as SearchIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { userAPI, messagingAPI } from '../../../config';
import { Snackbar, Alert } from '@mui/material'; // Added for notifications
import './BulkUserUpload.css';

const BulkUserUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [existingEmails, setExistingEmails] = useState([]);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Added for Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Added for Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Added for Snackbar

  // 1. Update templateData to use backend field names
  const templateData = [
    ['email', 'first_name', 'last_name', 'password', 'role', 'job_role', 'status', 'modules'],
    ['john@example.com', 'John', 'Doe', 'SecurePass123!', 'learner', 'staff', 'active', ''],
    ['jane@example.com', 'Jane', 'Smith', 'SecurePass456!', 'admin', 'manager', 'active', '']
  ];

  // 2. Update validation to use backend field names
  const requiredFields = ['email', 'first_name', 'last_name', 'password', 'role'];
  const validRoles = ['learner', 'admin', 'hr', 'carer', 'client', 'family', 'auditor', 'tutor', 'assessor', 'iqa', 'eqa'];
  const validStatuses = ['active', 'pending', 'suspended'];

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
        validateAllUsers(jsonData);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userAPI.getUsers({ page_size: 1000 });
        setExistingEmails(usersResponse.data.results.map(user => user.email.toLowerCase()));
      } catch (err) {
        setUploadResult({
          success: false,
          message: 'Failed to fetch existing users',
          details: [err.message]
        });
        setSnackbarOpen(true);
        setSnackbarMessage('Failed to fetch existing users');
        setSnackbarSeverity('error');
      }
    };
    fetchData();
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "user_upload_template.xlsx");
  };

  const validateUserData = (userData, index, allUsers) => {
    const errors = [];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    if (userData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push(`Invalid email format`);
      }
      const emailCount = allUsers.filter(u => u.email?.toLowerCase() === userData.email.toLowerCase()).length;
      if (emailCount > 1) {
        errors.push(`Duplicate email in upload batch`);
      }
      if (existingEmails.includes(userData.email.toLowerCase())) {
        errors.push(`Email already exists in the system`);
      }
    }
    if (userData.password && userData.password.length < 8) {
      errors.push(`Password must be at least 8 characters`);
    }
    if (userData.role && !validRoles.includes(userData.role.toLowerCase())) {
      errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    if (userData.status && !validStatuses.includes(userData.status.toLowerCase())) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    // modules should be an array of IDs or empty
    if (userData.modules && typeof userData.modules !== 'string' && !Array.isArray(userData.modules)) {
      errors.push(`Modules must be a comma-separated string or array of IDs`);
    }
    return errors.length ? errors : null;
  };

  const validateAllUsers = (users) => {
    const newErrors = {};
    users.forEach((user, index) => {
      const errors = validateUserData(user, index, users);
      if (errors) newErrors[index] = errors;
    });
    setValidationErrors(newErrors);
  };

  const handleEditUser = (index, field, value) => {
    setPreviewData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
    validateAllUsers(previewData);
  };

  const handleRemoveUser = (index) => {
    setPreviewData(prev => {
      const newData = prev.filter((_, i) => i !== index);
      validateAllUsers(newData);
      return newData;
    });
    if (previewData.length === 1) {
      setOpenPreviewModal(false);
      setFile(null);
      setSearchQuery('');
    }
  };

  // 3. Format upload payload for backend
  const processFile = async () => {
    if (!file || previewData.length === 0 || Object.keys(validationErrors).length > 0) return;
    setIsProcessing(true);
    setUploadResult(null);
    try {
      // Format users for backend
      const unsavedUsers = previewData.filter(user => !user.id).map(user => ({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        role: user.role,
        job_role: user.job_role || 'staff',
        status: user.status || 'active',
        modules: user.modules
          ? Array.isArray(user.modules)
            ? user.modules
            : typeof user.modules === 'string' && user.modules.length > 0
              ? user.modules.split(',').map(m => m.trim()).filter(Boolean)
              : []
          : []
      }));

      if (unsavedUsers.length === 0) {
        setUploadResult({
          success: true,
          message: 'All users already saved',
          details: []
        });
        setSnackbarOpen(true);
        setSnackbarMessage('All users already saved');
        setSnackbarSeverity('success');
        setIsProcessing(false);
        setOpenPreviewModal(false);
        setFile(null);
        setPreviewData([]);
        setSearchQuery('');
        if (onUpload) onUpload();
        return;
      }

      // Send as JSON array to backend
      const response = await userAPI.bulkUpload(unsavedUsers); // <-- Make sure your API expects JSON array

      if (response.status === 201 && response.data.error_count === 0 && response.data.created_count > 0) {
        for (const createdUser of response.data.created_users) {
          const userData = unsavedUsers.find(u => u.email === createdUser.email);
          if (sendWelcomeEmail) {
            await messagingAPI.createMessage({
              recipient_id: createdUser.id,
              subject: 'Welcome to Our Platform!',
              content: `Hello ${userData.firstName},\n\nWelcome to our platform! Your account has been created successfully.\n\nUsername: ${createdUser.email}\n\nPlease login to get started.`,
              type: 'welcome'
            });
          }
        }
        setUploadResult({
          success: true,
          message: `Successfully processed ${response.data.created_count} users`,
          details: response.data.errors || []
        });
        setSnackbarOpen(true);
        setSnackbarMessage(`Successfully created ${response.data.created_count} users`);
        setSnackbarSeverity('success');
        setOpenPreviewModal(false);
        setFile(null);
        setPreviewData([]);
        setSearchQuery('');
        if (onUpload && response.data.created_count > 0) {
          onUpload();
        }
      } else {
        setUploadResult({
          success: false,
          message: response.data.detail || 'Upload failed',
          details: (response.data.errors || []).map(err =>
            err.row ? `Row ${err.row}: ${err.error}` : err.error || JSON.stringify(err)
          )
        });
        setSnackbarOpen(true);
        setSnackbarMessage(response.data.detail || 'Upload failed');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      let errorDetails = [];
      if (error.response?.data?.errors) {
        errorDetails = error.response.data.errors.map(err =>
          err.row ? `Row ${err.row}: ${err.error}` : err.error || JSON.stringify(err)
        );
      } else if (error.response?.data?.detail) {
        errorDetails = [error.response.data.detail];
      } else {
        errorDetails = [error.message || 'Network error'];
      }
      setUploadResult({
        success: false,
        message: 'Error processing file',
        details: errorDetails
      });
      setSnackbarOpen(true);
      setSnackbarMessage('Error processing file');
      setSnackbarSeverity('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
    <div className="buu-container">
      {isProcessing && (
        <div className="buu-backdrop">
          <div className="buu-spinner"></div>
          <span>Processing...</span>
        </div>
      )}

      <div className="buu-paper">
        <h2>Bulk User Upload</h2>
        <div className="buu-template-section">
          <button className="buu-btn buu-btn-download" onClick={downloadTemplate}>
            <DownloadIcon /> Download Template
          </button>
          <span className="buu-caption">Excel (.xlsx) or CSV format</span>
        </div>

        <div {...getRootProps()} className={`buu-dropzone ${isDragActive ? 'buu-dropzone-active' : ''}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="buu-file-info">
              <FileIcon />
              <span>{file.name}</span>
              <span className="buu-caption">{Math.round(file.size / 1024)} KB</span>
            </div>
          ) : (
            <div className="buu-file-info">
              <UploadIcon />
              <span>{isDragActive ? 'Drop file' : 'Drop or click to upload'}</span>
              <span className="buu-caption">Excel (.xlsx, .xls) or CSV</span>
            </div>
          )}
        </div>

        <label className="buu-checkbox">
          <input
            type="checkbox"
            checked={sendWelcomeEmail}
            onChange={(e) => setSendWelcomeEmail(e.target.checked)}
          />
          <span>Send welcome email</span>
        </label>

        {uploadResult && (
          <div className={`buu-alert ${uploadResult.success ? 'buu-alert-success' : 'buu-alert-error'}`}>
            <div className="buu-alert-icon">
              {uploadResult.success ? <SuccessIcon /> : <ErrorIcon />}
            </div>
            <div>
              <span>{uploadResult.message}</span>
              {uploadResult.details.length > 0 && (
                <ul>
                  {uploadResult.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="buu-dialog" style={{ display: openPreviewModal ? 'block' : 'none' }}>
        <div className="buu-dialog-backdrop" onClick={() => setOpenPreviewModal(false)}></div>
        <div className="buu-dialog-content">
          <div className="buu-dialog-header">
            <h3>Preview Users ({filteredUsers.length})</h3>
            <div className="buu-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="buu-dialog-body">
            <table className="buu-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Errors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="buu-no-data">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const originalIndex = previewData.indexOf(user);
                    return (
                      <tr key={originalIndex} className={originalIndex % 2 === 0 ? 'buu-row-even' : 'buu-row-odd'}>
                        <td>
                          <input
                            type="text"
                            value={user.firstName || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'firstName', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={user.lastName || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'lastName', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            value={user.email || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'email', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={user.password || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'password', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            value={user.role || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'role', e.target.value)}
                          >
                            <option value="">Select Role</option>
                            {validRoles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={user.status || ''}
                            onChange={(e) => handleEditUser(originalIndex, 'status', e.target.value)}
                          >
                            <option value="">Select Status</option>
                            {validStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {validationErrors[originalIndex] ? (
                            <ul className="buu-error-list">
                              {validationErrors[originalIndex].map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          ) : (
                            <SuccessIcon className="buu-success-icon" />
                          )}
                        </td>
                        <td>
                          <button
                            className="buu-btn buu-btn-icon"
                            onClick={() => handleRemoveUser(originalIndex)}
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="buu-dialog-actions">
            <button className="buu-btn buu-btn-cancel" onClick={() => setOpenPreviewModal(false)}>
              Cancel
            </button>
            <button
              className="buu-btn buu-btn-confirm"
              onClick={processFile}
              disabled={isProcessing || previewData.length === 0 || Object.keys(validationErrors).length > 0}
            >
              {isProcessing ? <div className="buu-spinner-small"></div> : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BulkUserUpload;
