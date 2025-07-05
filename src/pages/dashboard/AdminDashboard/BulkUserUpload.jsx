import React, { useState, useEffect } from 'react';
import {
  Publish as UploadIcon, Description as FileIcon, CheckCircle as SuccessIcon,
  Error as ErrorIcon, CloudDownload as DownloadIcon, Search as SearchIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { userAPI, coursesAPI, messagingAPI } from '../../../config';
import './BulkUserUpload.css';

const BulkUserUpload = ({ onUpload }) => {
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
  const [courses, setCourses] = useState([]);
  const [existingEmails, setExistingEmails] = useState([]);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const templateData = [
    ['firstName', 'lastName', 'email', 'password', 'role', 'birthDate', 'status', 'department', 'courseIds'],
    ['John', 'Doe', 'john@example.com', 'SecurePass123!', 'learner', '1990-01-15', 'active', 'Engineering', 'course1,course2'],
    ['Jane', 'Smith', 'jane@example.com', 'SecurePass456!', 'instructor', '1985-05-22', 'active', 'Mathematics', '']
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          coursesAPI.getCourses(),
          userAPI.getUsers({ page_size: 1000 })
        ]);
        setCourses(coursesResponse.data.results || []);
        setExistingEmails(usersResponse.data.results.map(user => user.email.toLowerCase()));
      } catch (err) {
        setUploadResult({
          success: false,
          message: 'Failed to fetch initial data',
          details: [err.message]
        });
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
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors.push(`Row ${index + 2}: Missing required field: ${field}`);
      }
    });
    if (userData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push(`Row ${index + 2}: Invalid email format`);
      }
      const emailCount = allUsers.filter(u => u.email?.toLowerCase() === userData.email.toLowerCase()).length;
      if (emailCount > 1) {
        errors.push(`Row ${index + 2}: Duplicate email in upload batch`);
      }
      if (existingEmails.includes(userData.email.toLowerCase())) {
        errors.push(`Row ${index + 2}: Email already exists in the system`);
      }
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
    if (userData.courseIds) {
      const courseIds = userData.courseIds.split(',').map(id => id.trim()).filter(id => id);
      courseIds.forEach(id => {
        if (!courses.some(course => course.id === id)) {
          errors.push(`Row ${index + 2}: Invalid course ID: ${id}`);
        }
      });
    }
    return errors.length ? errors : null;
  };

  const handleSelectUser = (index) => {
    setSelectedUserIndex(index);
    setEditedUser({ ...previewData[index] });
    setValidationErrors(validateUserData(previewData[index], index, previewData) || []);
  };

  const handleEditUser = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
    setValidationErrors(validateUserData({ ...editedUser, [field]: value }, selectedUserIndex, previewData) || []);
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
        const courseIds = editedUser.courseIds?.split(',').map(id => id.trim()).filter(id => id) || [];
        for (const courseId of courseIds) {
          await coursesAPI.adminSingleEnroll(courseId, { user_id: response.data.id });
        }
        if (sendWelcomeEmail) {
          await messagingAPI.createMessage({
            recipient_id: response.data.id,
            subject: 'Welcome to Our Platform!',
            content: `Hello ${editedUser.firstName},\n\nWelcome to our platform! Your account has been created successfully.\n\nUsername: ${editedUser.email}\n\nPlease login to get started.`,
            type: 'welcome'
          });
        }
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
          details: courseIds.length ? [`Enrolled in courses: ${courseIds.join(', ')}`] : [],
        });
        setSelectedUserIndex(null);
        setEditedUser(null);
        setValidationErrors([]);
      }
    } catch (error) {
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
        for (const createdUser of response.data.created_users) {
          const userData = unsavedUsers.find(u => u.email === createdUser.email);
          if (userData?.courseIds) {
            const courseIds = userData.courseIds.split(',').map(id => id.trim()).filter(id => id);
            for (const courseId of courseIds) {
              await coursesAPI.adminSingleEnroll(courseId, { user_id: createdUser.id });
            }
          }
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
    <div className="buu-container">
      <div className="buu-backdrop" style={{ display: isProcessing ? 'flex' : 'none' }}>
        <div className="buu-spinner"></div>
        <span>Processing...</span>
      </div>

      <div className="buu-paper">
        <h1>Bulk User Upload</h1>
        <p className="buu-caption">Upload an Excel or CSV file to register users</p>

        <div className="buu-template-section">
          <button className="buu-btn buu-btn-download" onClick={downloadTemplate}>
            <DownloadIcon />
            Template
          </button>
          <span className="buu-caption">Use our template for formatting</span>
        </div>

        <div className="buu-info">
          <p><strong>Required:</strong> firstName, lastName, email, password, role</p>
          <p><strong>Optional:</strong> birthDate (YYYY-MM-DD), status, department, courseIds</p>
        </div>

        <div className="buu-divider"></div>

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
              <span>{isDragActive ? 'Drop file' : 'Drag & drop or click to select'}</span>
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
              {uploadResult.details && (
                <ul>
                  {uploadResult.details.map((detail, index) => (
                    <li key={index}>
                      {typeof detail === 'string' ? detail : 
                      detail.error ? `Row ${detail.row}: ${detail.error}` : 
                      JSON.stringify(detail)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="buu-dialog" style={{ display: openPreviewModal ? 'block' : 'none' }}>
        <div className="buu-dialog-backdrop" onClick={() => setOpenPreviewModal(false)}></div>
        <div className="buu-dialog-content buu-dialog-wide">
          <div className="buu-dialog-header">
            <h3>Preview Users</h3>
            <span className="buu-caption">{previewData.length} users</span>
          </div>
          <div className="buu-dialog-body">
            <div className="buu-user-list">
              <div className="buu-search-input">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="buu-list">
                {filteredUsers.length === 0 ? (
                  <div className="buu-no-data">No users</div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`buu-list-item ${selectedUserIndex === previewData.indexOf(user) ? 'selected' : ''}`}
                      onClick={() => handleSelectUser(previewData.indexOf(user))}
                    >
                      <div className="buu-avatar">{getInitial(user)}</div>
                      <div>
                        <span>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed'}</span>
                        <span className="buu-caption">{user.email || 'No email'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="buu-user-edit">
              {selectedUserIndex !== null && editedUser ? (
                <div>
                  <h4>Edit (Row {selectedUserIndex + 2})</h4>
                  <div className="buu-form-grid">
                    <div className="buu-form-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={editedUser.firstName || ''}
                        onChange={(e) => handleEditUser('firstName', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={editedUser.lastName || ''}
                        onChange={(e) => handleEditUser('lastName', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field buu-form-field-full">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleEditUser('email', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field">
                      <label>Password</label>
                      <input
                        type="text"
                        value={editedUser.password || ''}
                        onChange={(e) => handleEditUser('password', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field">
                      <label>Role</label>
                      <select
                        value={editedUser.role || ''}
                        onChange={(e) => handleEditUser('role', e.target.value)}
                      >
                        <option value="">Select Role</option>
                        {['admin', 'instructor', 'learner', 'owner'].map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div className="buu-form-field">
                      <label>Birth Date</label>
                      <input
                        type="text"
                        value={editedUser.birthDate || ''}
                        onChange={(e) => handleEditUser('birthDate', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field">
                      <label>Status</label>
                      <select
                        value={editedUser.status || ''}
                        onChange={(e) => handleEditUser('status', e.target.value)}
                      >
                        <option value="">Select Status</option>
                        {['active', 'pending', 'suspended'].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="buu-form-field buu-form-field-full">
                      <label>Department</label>
                      <input
                        type="text"
                        value={editedUser.department || ''}
                        onChange={(e) => handleEditUser('department', e.target.value)}
                      />
                    </div>
                    <div className="buu-form-field buu-form-field-full">
                      <label>Courses</label>
                      <select
                        multiple
                        value={editedUser.courseIds?.split(',').map(id => id.trim()).filter(id => id) || []}
                        onChange={(e) => handleEditUser('courseIds', Array.from(e.target.selectedOptions).map(opt => opt.value).join(','))}
                      >
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="buu-alert buu-alert-error">
                      <div className="buu-alert-icon">
                        <ErrorIcon />
                      </div>
                      <ul>
                        {validationErrors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="buu-edit-actions">
                    <button
                      className="buu-btn buu-btn-confirm"
                      onClick={handleSaveUser}
                      disabled={validationErrors.length > 0}
                    >
                      Save
                    </button>
                    <button
                      className="buu-btn buu-btn-delete"
                      onClick={handleRemoveUser}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="buu-no-data">Select a user</div>
              )}
            </div>
          </div>
          <div className="buu-dialog-actions">
            <button className="buu-btn buu-btn-cancel" onClick={() => setOpenPreviewModal(false)}>
              Cancel
            </button>
            <button
              className="buu-btn buu-btn-confirm"
              onClick={processFile}
              disabled={isProcessing || previewData.length === 0}
            >
              {isProcessing ? <div className="buu-spinner-small"></div> : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="buu-dialog" style={{ display: openRemoveConfirm ? 'block' : 'none' }}>
        <div className="buu-dialog-backdrop" onClick={() => setOpenRemoveConfirm(false)}></div>
        <div className="buu-dialog-content">
          <div className="buu-dialog-header">
            <h3>Confirm</h3>
          </div>
          <div className="buu-dialog-body">
            <p>Remove user?</p>
            {editedUser && (
              <p className="buu-bold">{editedUser.email || 'Unnamed'}</p>
            )}
          </div>
          <div className="buu-dialog-actions">
            <button className="buu-btn buu-btn-cancel" onClick={() => setOpenRemoveConfirm(false)}>
              Cancel
            </button>
            <button className="buu-btn buu-btn-delete" onClick={confirmRemoveUser}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUserUpload;