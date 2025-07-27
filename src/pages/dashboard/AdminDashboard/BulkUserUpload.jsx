import React, { useState, useEffect } from 'react';
import {
  Publish as UploadIcon, Description as FileIcon, CheckCircle as SuccessIcon,
  Error as ErrorIcon, CloudDownload as DownloadIcon, Search as SearchIcon,
  Delete as DeleteIcon, Close as CloseIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { userAPI, messagingAPI } from '../../../config';
import { Snackbar, Alert } from '@mui/material';
import { Faker, en } from '@faker-js/faker';
import './BulkUserUpload.css';

// Initialize Faker with English locale
const faker = new Faker({ locale: [en] });

// Utility to generate random string
const randomString = (length = 8, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return res;
};

// Utility to generate random user data
const generateRandomUsers = ({
  count = 10,
  emailDomain = 'example.com',
  passwordFormat = 'random',
  passwordLength = 10,
  fixedPassword = 'Password123!',
  role = 'learner',
  jobRole = 'staff',
  status = 'active',
  modules = ''
}) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    // Sanitize names for email (remove spaces, special characters)
    const email = `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@${emailDomain}`;
    let password;
    if (passwordFormat === 'random') {
      password = randomString(passwordLength);
    } else if (passwordFormat === 'fixed') {
      password = fixedPassword;
    }
    users.push({
      firstName,
      lastName,
      email,
      password,
      role,
      job_role: jobRole,
      status,
      modules
    });
  }
  return users;
};

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Random data generation options
  const [randomOptions, setRandomOptions] = useState({
    count: 10,
    emailDomain: 'example.com',
    passwordFormat: 'random',
    passwordLength: 10,
    fixedPassword: 'Password123!',
    role: 'learner',
    jobRole: 'staff',
    status: 'active',
    modules: ''
  });

  // Template data aligned with backend expected columns
  const templateData = [
    ['firstName', 'lastName', 'email', 'password', 'role', 'job_role', 'status', 'modules'],
    ['John', 'Doe', 'john@example.com', 'SecurePass123!', 'learner', 'staff', 'active', ''],
    ['Jane', 'Smith', 'jane@example.com', 'SecurePass456!', 'admin', 'manager', 'active', '']
  ];

  // Validation rules aligned with backend
  const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
  const validRoles = ['learner', 'admin', 'hr', 'carer', 'client', 'family', 'auditor', 'tutor', 'assessor', 'iqa', 'eqa'];
  const validStatuses = ['active', 'pending', 'suspended'];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setUploadResult(null);
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Map frontend field names to backend expected names
        const mappedData = jsonData.map(row => ({
          firstName: row.firstName || row.first_name || '',
          lastName: row.lastName || row.last_name || '',
          email: row.email || '',
          password: row.password || '',
          role: row.role || '',
          job_role: row.job_role || row.jobRole || '',
          status: row.status || '',
          modules: row.modules || ''
        }));
        setPreviewData(mappedData);
        setOpenPreviewModal(true);
        validateAllUsers(mappedData);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userAPI.getUsers({ page_size: 1000 });
        setExistingEmails(usersResponse.data.results.map(user => user.email.toLowerCase()));
      } catch (err) {
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
    XLSX.utils.book_append_sheet(wb, ws, 'Users Template');
    XLSX.writeFile(wb, 'user_upload_template.csv');
  };

  const validateUserData = (userData, index, allUsers) => {
    const errors = [];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors.push(`Missing ${field}`);
      }
    });
    if (userData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Invalid email format');
      }
      const emailCount = allUsers.filter(u => u.email?.toLowerCase() === userData.email.toLowerCase()).length;
      if (emailCount > 1) {
        errors.push('Duplicate email in batch');
      }
      if (existingEmails.includes(userData.email.toLowerCase())) {
        errors.push('Email already exists');
      }
    }
    if (userData.password && userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (userData.role && !validRoles.includes(userData.role.toLowerCase())) {
      errors.push(`Invalid role: ${userData.role}`);
    }
    if (userData.status && !validStatuses.includes(userData.status.toLowerCase())) {
      errors.push(`Invalid status: ${userData.status}`);
    }
    if (userData.modules && typeof userData.modules !== 'string') {
      errors.push('Modules must be a comma-separated string');
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

  const handleGenerateRandomUsers = () => {
    // Validate fixed password if selected
    if (randomOptions.passwordFormat === 'fixed' && randomOptions.fixedPassword.length < 8) {
      setSnackbarOpen(true);
      setSnackbarMessage('Fixed password must be at least 8 characters long');
      setSnackbarSeverity('error');
      return;
    }
    const users = generateRandomUsers(randomOptions);
    setPreviewData(users);
    setOpenPreviewModal(true);
    setFile(null);
    setUploadResult(null);
    validateAllUsers(users);
  };

  const processFile = async () => {
    if (!file && previewData.length === 0) {
      setSnackbarOpen(true);
      setSnackbarMessage('No file or data to upload');
      setSnackbarSeverity('error');
      return;
    }
    setIsProcessing(true);
    setUploadResult(null);
    try {
      let uploadFile = file;
      if (!uploadFile && previewData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(previewData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        const wbout = XLSX.write(wb, { bookType: 'csv', type: 'array' });
        uploadFile = new File([wbout], 'bulk_users.csv', { type: 'text/csv' });
      }
      const formData = new FormData();
      formData.append('file', uploadFile);
      const response = await userAPI.bulkUpload(formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 201 && response.data.error_count === 0 && response.data.created_count > 0) {
        if (sendWelcomeEmail) {
          for (const createdUser of response.data.created_users) {
            const userData = previewData.find(u => u.email === createdUser.email);
            await messagingAPI.createMessage({
              recipient_id: createdUser.id,
              subject: 'Welcome to NotchHR!',
              content: `Hello ${userData.firstName},\n\nYour account has been created successfully.\nUsername: ${createdUser.email}\n\nPlease login to get started.`,
              type: 'welcome'
            });
          }
        }
        setUploadResult({
          success: true,
          message: `Created ${response.data.created_count} users`,
          details: []
        });
        setSnackbarOpen(true);
        setSnackbarMessage(`Created ${response.data.created_count} users`);
        setSnackbarSeverity('success');
        setOpenPreviewModal(false);
        setFile(null);
        setPreviewData([]);
        setSearchQuery('');
        if (onUpload) onUpload();
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
      const errorDetails = error.response?.data?.errors
        ? error.response.data.errors.map(err =>
            err.row ? `Row ${err.row}: ${err.error}` : err.error || JSON.stringify(err)
          )
        : [error.response?.data?.detail || error.message || 'Network error'];
      setUploadResult({
        success: false,
        message: 'Upload failed',
        details: errorDetails
      });
      setSnackbarOpen(true);
      setSnackbarMessage('Upload failed');
      setSnackbarSeverity('error');
    } finally {
      setIsProcessing(false);
    }
  };


//   const processFile = async () => {
//   if (!file && previewData.length === 0) {
//     setSnackbarOpen(true);
//     setSnackbarMessage('No file or data to upload');
//     setSnackbarSeverity('error');
//     return;
//   }
//   setIsProcessing(true);
//   setUploadResult(null);
//   try {
//     let uploadFile = file;
//     if (!uploadFile && previewData.length > 0) {
//       // Map previewData to match backend expected column names
//       const mappedData = previewData.map(user => ({
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         password: user.password,
//         role: user.role,
//         job_role: user.job_role || '',
//         status: user.status || 'pending',
//         modules: user.modules || ''
//       }));
//       // Create CSV using XLSX
//       const ws = XLSX.utils.json_to_sheet(mappedData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Users');
//       const csvContent = XLSX.write(wb, { bookType: 'csv', type: 'string' });
//       // Convert string to Blob and create File
//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
//       uploadFile = new File([blob], 'bulk_users.csv', { type: 'text/csv' });
//       // Debug: Log file content
//       console.log('Generated CSV content:', csvContent);
//       console.log('File size:', uploadFile.size, 'bytes');
//     }
//     const formData = new FormData();
//     formData.append('file', uploadFile);
//     // Debug: Log FormData entries
//     for (let [key, value] of formData.entries()) {
//       console.log(`FormData entry: ${key}=${value.name || value}`);
//     }
//     const response = await userAPI.bulkUpload(formData);
//     // Handle response
//     if (response.status === 201 && response.data.error_count === 0 && response.data.created_count > 0) {
//       if (sendWelcomeEmail) {
//         for (const createdUser of response.data.created_users) {
//           const userData = previewData.find(u => u.email === createdUser.email);
//           await messagingAPI.createMessage({
//             recipient_id: createdUser.id,
//             subject: 'Welcome to NotchHR!',
//             content: `Hello ${userData.firstName},\n\nYour account has been created successfully.\nUsername: ${createdUser.email}\n\nPlease login to get started.`,
//             type: 'welcome'
//           });
//         }
//       }
//       setUploadResult({
//         success: true,
//         message: `Created ${response.data.created_count} users`,
//         details: []
//       });
//       setSnackbarOpen(true);
//       setSnackbarMessage(`Created ${response.data.created_count} users`);
//       setSnackbarSeverity('success');
//       setOpenPreviewModal(false);
//       setFile(null);
//       setPreviewData([]);
//       setSearchQuery('');
//       if (onUpload) onUpload();
//     } else {
//       setUploadResult({
//         success: false,
//         message: response.data.detail || 'Upload failed',
//         details: (response.data.errors || []).map(err =>
//           err.row ? `Row ${err.row}: ${err.error}` : err.error || JSON.stringify(err)
//         )
//       });
//       setSnackbarOpen(true);
//       setSnackbarMessage(response.data.detail || 'Upload failed');
//       setSnackbarSeverity('error');
//     }
//   } catch (error) {
//     console.error('Upload error:', error);
//     const errorDetails = error.response?.data?.errors
//       ? error.response.data.errors.map(err =>
//           err.row ? `Row ${err.row}: ${err.error}` : err.error || JSON.stringify(err)
//         )
//       : [error.response?.data?.detail || error.message || 'Network error'];
//     setUploadResult({
//       success: false,
//       message: 'Upload failed',
//       details: errorDetails
//     });
//     setSnackbarOpen(true);
//     setSnackbarMessage('Upload failed: ' + (error.response?.data?.detail || error.message));
//     setSnackbarSeverity('error');
//   } finally {
//     setIsProcessing(false);
//   }
// };
  


const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredUsers = previewData.filter(user =>
    Object.values(user).some(val =>
      val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
        <div className="buu-upload-section">
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
                <span className="buu-caption">CSV, XLS, XLSX</span>
              </div>
            )}
          </div>
          <div className="buu-options">
            <label className="buu-checkbox">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
              />
              Send welcome emails
            </label>
            <button className="buu-btn buu-btn-download" onClick={downloadTemplate}>
              <DownloadIcon /> Template
            </button>
          </div>
        </div>
        <button className="buu-btn buu-btn-random" onClick={() => setOpenPreviewModal(true)}>
          Generate Random Users
        </button>
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
            <button className="buu-btn buu-btn-icon" onClick={() => setOpenPreviewModal(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="buu-search-input">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!file && (
            <div className="buu-random-section">
              <h4>Generate Random Users</h4>
              <div className="buu-random-fields">
                <label>
                  Count
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={randomOptions.count}
                    onChange={e => setRandomOptions({ ...randomOptions, count: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Email Domain
                  <input
                    type="text"
                    value={randomOptions.emailDomain}
                    onChange={e => setRandomOptions({ ...randomOptions, emailDomain: e.target.value })}
                  />
                </label>
                <label>
                  Password
                  <select
                    value={randomOptions.passwordFormat}
                    onChange={e => setRandomOptions({ ...randomOptions, passwordFormat: e.target.value })}
                  >
                    <option value="random">Random</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
                {randomOptions.passwordFormat === 'random' && (
                  <label>
                    Length
                    <input
                      type="number"
                      min={8}
                      max={32}
                      value={randomOptions.passwordLength}
                      onChange={e => setRandomOptions({ ...randomOptions, passwordLength: Number(e.target.value) })}
                    />
                  </label>
                )}
                {randomOptions.passwordFormat === 'fixed' && (
                  <label>
                    Password
                    <input
                      type="text"
                      value={randomOptions.fixedPassword}
                      onChange={e => setRandomOptions({ ...randomOptions, fixedPassword: e.target.value })}
                      placeholder="Enter fixed password"
                    />
                  </label>
                )}
                <label>
                  Role
                  <select
                    value={randomOptions.role}
                    onChange={e => setRandomOptions({ ...randomOptions, role: e.target.value })}
                  >
                    {validRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={randomOptions.status}
                    onChange={e => setRandomOptions({ ...randomOptions, status: e.target.value })}
                  >
                    {validStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <button className="buu-btn buu-btn-random" onClick={handleGenerateRandomUsers}>
                  Generate
                </button>
              </div>
            </div>
          )}
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
                  <th></th>
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
          <div className="buu-dialog-actions">
            <button className="buu-btn buu-btn-cancel" onClick={() => setOpenPreviewModal(false)}>
              Cancel
            </button>
            <button
              className="buu-btn buu-btn-confirm"
              onClick={processFile}
              disabled={isProcessing || previewData.length === 0 || Object.keys(validationErrors).length > 0}
            >
              {isProcessing ? <div className="buu-spinner-small"></div> : 'Upload'}
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
