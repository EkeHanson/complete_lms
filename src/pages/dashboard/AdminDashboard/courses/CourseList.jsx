import React, { useState, useEffect } from 'react';
import './CourseList.css';
import {
  Edit, Visibility, MoreVert, Search, FilterList, Refresh,
  PersonAdd, GroupAdd, UploadFile, Person, Groups, Description,
  CheckBoxOutlineBlank, CheckBox, Warning
} from '@mui/icons-material';

import CheckCircle from '@mui/icons-material/CheckCircle';


import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { coursesAPI, userAPI } from '../../../../config';

const CourseList = () => {
  const navigate = useNavigate();
  
  // Course list state
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
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enrollment state
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [bulkEnrollDialogOpen, setBulkEnrollDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // File upload state
  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileError, setFileError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: acceptedFiles => {
      setFileError(null);
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (rejectedFiles) => {
      setFileError('File too large. Maximum size is 5MB');
    }
  });

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: 1,
          page_size: 1000,
          search: searchTerm || undefined,
          category: filters.category === 'all' ? undefined : filters.category,
          level: filters.level === 'all' ? undefined : filters.level
        };
        
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === null) {
            delete params[key];
          }
        });

        const response = await coursesAPI.getCourses(params);
        setAllCourses(response.data.results || []);
        setTotalCourses(response.data.count || 0);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch courses';
        setError(errorMsg);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, [searchTerm, filters.category, filters.level]);

  // Fetch users when enrollment dialogs open
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getUsers({ page_size: 1000 });
        setUsers(response.data.results || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    
    if (enrollDialogOpen || bulkEnrollDialogOpen) {
      fetchUsers();
    }
  }, [enrollDialogOpen, bulkEnrollDialogOpen]);

  // Filter courses
  useEffect(() => {
    let filtered = [...allCourses];

    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(course => course.status === activeStatusTab);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.category?.name === filters.category);
    }

    if (filters.level !== 'all') {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    setFilteredCourses(filtered);
    setTotalCourses(filtered.length);

    if (page * rowsPerPage >= filtered.length) {
      setPage(0);
    }
  }, [activeStatusTab, searchTerm, filters, allCourses, page, rowsPerPage]);

  // Parse uploaded file
  const parseFile = (file) => {
    setFile(file);
    
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data.length === 0) {
            setFileError('CSV file is empty or improperly formatted');
            return;
          }
          
          const firstRow = results.data[0];
          if (!('email' in firstRow || 'Email' in firstRow || 'EMAIL' in firstRow)) {
            setFileError('CSV must contain an "email" column');
            return;
          }
          
          setFileData(results.data);
        },
        error: (error) => {
          setFileError(error.message);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            setFileError('Excel file is empty or improperly formatted');
            return;
          }
          
          const firstRow = jsonData[0];
          if (!('email' in firstRow || 'Email' in firstRow || 'EMAIL' in firstRow)) {
            setFileError('Excel file must contain an "email" column');
            return;
          }
          
          setFileData(jsonData);
        } catch (error) {
          setFileError('Error parsing Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Enrollment functions
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setSelectedUser(null);
    setEnrollmentError(null);
    setEnrollDialogOpen(true);
  };

  const handleBulkEnrollClick = (course) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
    setActiveTab('manual');
    setFile(null);
    setFileData([]);
    setFileError(null);
    setEnrollmentError(null);
    setBulkEnrollDialogOpen(true);
  };

  const handleEnrollSubmit = async () => {
    if (!selectedUser || !selectedCourse) return;
    
    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      
      const response = await coursesAPI.adminSingleEnroll(selectedCourse.id, { 
        user_id: selectedUser.id 
      });
      
      setSuccessMessage(`Successfully enrolled ${selectedUser.first_name} ${selectedUser.last_name} in ${selectedCourse.title}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setEnrollDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      let errorMessage = 'Failed to enroll user';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data.error || errorMessage;
          if (err.response.data.details) {
            errorMessage += `: ${JSON.stringify(err.response.data.details)}`;
          }
        } else if (err.response.status === 500) {
          errorMessage = err.response.data.error || errorMessage;
          if (err.response.data.details) {
            console.error('Server error details:', err.response.data.details);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setEnrollmentError(errorMessage);
      console.error('Enrollment error:', err);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleBulkEnrollSubmit = async () => {
    if (activeTab === 'manual' && selectedUsers.length === 0) return;
    if (activeTab === 'file' && fileData.length === 0) return;
    
    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      
      let userIds = [];
      
      if (activeTab === 'manual') {
        userIds = selectedUsers.map(user => user.id);
      } else {
        const emails = fileData.map(row => row.email || row.Email || row.EMAIL).filter(Boolean);
        if (emails.length === 0) {
          throw new Error('No valid email addresses found in the file');
        }
        
        const matchingUsers = users.filter(user => emails.includes(user.email));
        if (matchingUsers.length === 0) {
          throw new Error('No matching users found for the provided emails');
        }
        userIds = matchingUsers.map(user => user.id);
      }
  
      const response = await coursesAPI.adminBulkEnrollCourse(selectedCourse.id, userIds);
      
      let successMsg = `Successfully enrolled ${response.data.created || userIds.length} users`;
      if (response.data.already_enrolled > 0) {
        successMsg += ` (${response.data.already_enrolled} were already enrolled)`;
      }
      
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 5000);
      setBulkEnrollDialogOpen(false);
      setSelectedUsers([]);
      setFile(null);
      setFileData([]);
    } catch (err) {
      let errorMessage = 'Failed to bulk enroll users';
      
      if (err.response) {
        errorMessage = err.response.data.error || errorMessage;
        if (err.response.data.details) {
          errorMessage += `: ${JSON.stringify(err.response.data.details)}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setEnrollmentError(errorMessage);
      console.error('Bulk enrollment error:', err);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      return isSelected 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user];
    });
  };

  const toggleSelectAllUsers = (selectAll) => {
    if (selectAll) {
      setSelectedUsers([...users]);
    } else {
      setSelectedUsers([]);
    }
  };

  // Course actions
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

  // Pagination and filtering
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
    setPage(0);
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return '#4caf50';
      case 'Draft': return '#f59e0b';
      case 'Archived': return '#6b7280';
      default: return '#0288d1';
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

  const paginatedCourses = filteredCourses.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="CourseList">
      {successMessage && (
        <div className="notification success">
          <CheckCircle className="icon" /> {successMessage}
        </div>
      )}

      <div className="CourseList-Top">
        <div className="CourseList-Top-Grid">
          <div className="CourseList-Top-1">
            <h2>
              <Description className="icon" /> Course Management
            </h2>
          </div>
          <div className="CourseList-Top-2">
            <span className="status-count">
              {totalCourses} {totalCourses === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
        </div>

        <div className="CourseList-Filters">
          <div className="filter-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="search-icon" />
          </div>
          <div className="filter-buttons">
            <button className="filter-btn" onClick={() => setFilterDialogOpen(true)}>
              <FilterList className="icon" /> Filters
            </button>
            <button className="filter-btn" onClick={resetFilters}>
              <Refresh className="icon" /> Reset
            </button>
          </div>
        </div>

        <div className="status-tabs">
          <button
            className={`tab ${activeStatusTab === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusTabChange(null, 'all')}
          >
            All
          </button>
          <button
            className={`tab ${activeStatusTab === 'Published' ? 'active' : ''}`}
            onClick={() => handleStatusTabChange(null, 'Published')}
          >
            Published
          </button>
          <button
            className={`tab ${activeStatusTab === 'Draft' ? 'active' : ''}`}
            onClick={() => handleStatusTabChange(null, 'Draft')}
          >
            Draft
          </button>
          <button
            className={`tab ${activeStatusTab === 'Archived' ? 'active' : ''}`}
            onClick={() => handleStatusTabChange(null, 'Archived')}
          >
            Archived
          </button>
        </div>
      </div>

      {filterDialogOpen && (
        <div className="filter-dialog">
          <h3>Advanced Filters</h3>
          <div className="filter-grid">
            <div>
              <label className="label">Category</label>
              <select
                className="select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(allCourses.map(c => c.category?.name).filter(Boolean))).map(categoryName => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select
                className="select"
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <button className="action-btn" onClick={() => setFilterDialogOpen(false)}>
              Cancel
            </button>
            <button className="action-btn primary" onClick={() => setFilterDialogOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <Warning className="icon" /> {error}
        </div>
      )}

      <div className="CourseList-Table">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : paginatedCourses.length === 0 ? (
          <div className="empty-state">
            <Warning className="icon" />
            <span>No courses found</span>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Outcomes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <span className="course-title">{course.title}</span>
                    <span className="course-meta">
                      {course.category?.name} • {course.level}
                    </span>
                  </td>
                  <td>
                    {course.discount_price ? (
                      <>
                        <span className="price-strike">{formatPrice(course.price, course.currency)}</span>
                        <span className="price-discount">{formatPrice(course.discount_price, course.currency)}</span>
                      </>
                    ) : (
                      <span>{formatPrice(course.price, course.currency)}</span>
                    )}
                  </td>
                  <td>
                    {course.learning_outcomes?.length > 0 ? (
                      <>
                        {course.learning_outcomes.slice(0, 2).map((outcome, i) => (
                          <div key={i} className="outcome">
                            • {outcome}
                          </div>
                        ))}
                        {course.learning_outcomes.length > 2 && (
                          <span className="more-outcomes">
                            +{course.learning_outcomes.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="no-outcomes">No outcomes</span>
                    )}
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(course.status) }}>
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button onClick={() => handleEnrollClick(course)}>
                        <PersonAdd className="icon" />
                      </button>
                      <button onClick={() => handleBulkEnrollClick(course)}>
                        <GroupAdd className="icon" />
                      </button>
                      <button onClick={() => handleEdit(course.id)}>
                        <Edit className="icon" />
                      </button>
                      <button onClick={() => handleView(course.id)}>
                        <Visibility className="icon" />
                      </button>
                      <button onClick={(e) => handleMenuOpen(e, course)}>
                        <MoreVert className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            className="rows-per-page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <div className="page-controls">
            <button
              disabled={page === 0}
              onClick={() => handleChangePage(null, page - 1)}
              className="page-btn"
            >
              Previous
            </button>
            <span>Page {page + 1} of {Math.ceil(totalCourses / rowsPerPage)}</span>
            <button
              disabled={page >= Math.ceil(totalCourses / rowsPerPage) - 1}
              onClick={() => handleChangePage(null, page + 1)}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className={`enroll-dialog ${enrollDialogOpen ? 'open' : ''}`}>
        <div className="dialog-overlay" onClick={() => setEnrollDialogOpen(false)}></div>
        <div className="dialog-content">
          <div className="dialog-header">
            <h3>
              <Person className="icon" /> Enroll User
            </h3>
            <button className="close-btn" onClick={() => setEnrollDialogOpen(false)}>
              <Warning className="icon" />
            </button>
          </div>
          <div className="dialog-body">
            <span className="dialog-subtitle">{selectedCourse?.title}</span>
            {enrollmentError && (
              <div className="error-message">
                <Warning className="icon" /> {enrollmentError}
              </div>
            )}
            <select
              className="select"
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === parseInt(e.target.value));
                setSelectedUser(user || null);
              }}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="dialog-actions">
            <button className="action-btn" onClick={() => setEnrollDialogOpen(false)}>
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleEnrollSubmit}
              disabled={!selectedUser || enrollmentLoading}
            >
              {enrollmentLoading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </div>
      </div>

      <div className={`bulk-enroll-dialog ${bulkEnrollDialogOpen ? 'open' : ''}`}>
        <div className="dialog-overlay" onClick={() => setBulkEnrollDialogOpen(false)}></div>
        <div className="dialog-content">
          <div className="dialog-header">
            <h3>
              <Groups className="icon" /> Bulk Enroll
            </h3>
            <button className="close-btn" onClick={() => setBulkEnrollDialogOpen(false)}>
              <Warning className="icon" />
            </button>
          </div>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              <Person className="icon" /> Manual
            </button>
            <button
              className={`tab ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              <Description className="icon" /> File Upload
            </button>
          </div>
          <div className="dialog-body">
            <span className="dialog-subtitle">{selectedCourse?.title}</span>
            {enrollmentError && (
              <div className="error-message">
                <Warning className="icon" /> {enrollmentError}
              </div>
            )}
            {activeTab === 'manual' ? (
              <>
                <div className="selection-info">
                  <span>{selectedUsers.length} of {users.length} selected</span>
                  <button onClick={() => toggleSelectAllUsers(selectedUsers.length < users.length)}>
                    {selectedUsers.length === users.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <ul className="user-list">
                  {users.map(user => (
                    <li
                      key={user.id}
                      className="user-item"
                      onClick={() => toggleUserSelection(user)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.some(u => u.id === user.id)}
                        readOnly
                      />
                      <span>{user.first_name} {user.last_name}</span>
                      <span className="user-email">{user.email}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <span className="upload-info">Upload CSV/Excel file with user emails (max 5MB):</span>
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="file-info">
                      <Description className="icon" />
                      <span>{file.name}</span>
                      <span className="file-count">{fileData.length} records found</span>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <UploadFile className="icon" />
                      <span>Drag & drop file here</span>
                      <span className="dropzone-hint">or click to browse (CSV, XLS, XLSX)</span>
                    </div>
                  )}
                </div>
                {fileError && (
                  <div className="error-message">
                    <Warning className="icon" /> {fileError}
                  </div>
                )}
                {fileData.length > 0 && (
                  <div className="file-preview">
                    <span>Preview (first 3 rows):</span>
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(fileData[0]).slice(0, 3).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fileData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).slice(0, 3).map((value, j) => (
                              <td key={j}>{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="dialog-actions">
            <button
              className="action-btn"
              onClick={() => {
                setBulkEnrollDialogOpen(false);
                setSelectedUsers([]);
                setFile(null);
                setFileData([]);
              }}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleBulkEnrollSubmit}
              disabled={
                (activeTab === 'manual' && selectedUsers.length === 0) ||
                (activeTab === 'file' && fileData.length === 0) ||
                enrollmentLoading
              }
            >
              {activeTab === 'manual' 
                ? `Enroll ${selectedUsers.length}`
                : `Enroll from File`}
            </button>
          </div>
        </div>
      </div>

      <div className="menu">
        <div className={`menu-content ${anchorEl ? 'open' : ''}`}>
          <button onClick={() => handleView(selectedCourse?.id)}>
            <Visibility className="icon" /> View
          </button>
          <button onClick={() => handleEdit(selectedCourse?.id)}>
            <Edit className="icon" /> Edit
          </button>
          <button onClick={() => handleDelete(selectedCourse?.id)}>
            <Warning className="icon" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseList;