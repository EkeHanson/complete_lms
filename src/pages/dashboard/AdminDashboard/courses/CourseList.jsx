import React, { useState, useEffect, useRef } from 'react';
import './CourseList.css';
import Warning from '@mui/icons-material/Warning';
import {
  Edit, Visibility, Search, FilterList, Refresh,
  PersonAdd, GroupAdd, UploadFile, Person, Groups, Description,
  CheckBoxOutlineBlank, CheckBox, Delete
} from '@mui/icons-material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { coursesAPI, userAPI } from '../../../../config';

const NotificationModal = ({ messages, onClose }) => {
  return (
    <div className="notification-modal" role="dialog" onClick={onClose}>
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()}></div>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <Warning className="icon" />
          </button>
        </div>
        <div className="modal-body">
          {messages.map((msg, index) => (
            <div key={index} className={`notification ${msg.type}`}>
              {msg.type === 'error' ? <Warning className="icon" /> : <CheckCircle className="icon" />}
              {msg.text}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="action-btn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseList = () => {
  const navigate = useNavigate();
  
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

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [bulkEnrollDialogOpen, setBulkEnrollDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [searchUserTerm, setSearchUserTerm] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: acceptedFiles => {
      setFileError(null);
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      setFileError('File too large. Maximum size is 5MB');
      showNotification('error', 'File too large. Maximum size is 5MB');
    }
  });

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
        showNotification('error', errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm, filters.category, filters.level]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (enrollDialogOpen || bulkEnrollDialogOpen) {
        setUsersLoading(true);
        try {
          const response = await userAPI.getUsers({ page_size: 1000 });
          setUsers(response.data.results || []);
        } catch (err) {
          console.error('Failed to fetch users at', new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }), ':', err);
          setUsers([]);
          showNotification('error', 'Failed to fetch users');
        } finally {
          setUsersLoading(false);
        }
      }
    };
    fetchUsers();
  }, [enrollDialogOpen, bulkEnrollDialogOpen]);

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

  const parseFile = (file) => {
    setFile(file);
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data.length === 0) {
            setFileError('CSV file is empty or improperly formatted');
            showNotification('error', 'CSV file is empty or improperly formatted');
            return;
          }
          const firstRow = results.data[0];
          if (!('email' in firstRow || 'Email' in firstRow || 'EMAIL' in firstRow)) {
            setFileError('CSV must contain an "email" column');
            showNotification('error', 'CSV must contain an "email" column');
            return;
          }
          setFileData(results.data);
        },
        error: (error) => {
          setFileError(error.message);
          showNotification('error', error.message);
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
            showNotification('error', 'Excel file is empty or improperly formatted');
            return;
          }
          const firstRow = jsonData[0];
          if (!('email' in firstRow || 'Email' in firstRow || 'EMAIL' in firstRow)) {
            setFileError('Excel file must contain an "email" column');
            showNotification('error', 'Excel file must contain an "email" column');
            return;
          }
          setFileData(jsonData);
        } catch (error) {
          setFileError('Error parsing Excel file');
          showNotification('error', 'Error parsing Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEnrollClick = async (course) => {
    if (!course) {
      setError('No course selected');
      showNotification('error', 'No course selected');
      return;
    }
    if (course.status !== 'Published') {
      setError(`Cannot enroll in "${course.title}". Please publish the course first.`);
      showNotification('error', `Cannot enroll in "${course.title}". Please publish the course first.`);
      return;
    }
    setSelectedCourse(course);
    setSelectedUser(null);
    setError(null);
    setEnrollDialogOpen(true);

    if (selectedUser) {
      try {
        const response = await coursesAPI.getEnrollments(course.id, { user_id: selectedUser.id });
        if (response.data.results.length > 0) {
          setError('User already enrolled in this course');
          showNotification('error', 'User already enrolled in this course');
          setEnrollDialogOpen(false);
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      }
    }
  };

  const handleBulkEnrollClick = (course) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
    setActiveTab('manual');
    setFile(null);
    setFileData([]);
    setFileError(null);
    setError(null);
    setBulkEnrollDialogOpen(true);
  };

  const handleEnrollSubmit = async () => {
    if (!selectedUser || !selectedCourse) return;
    try {
      setEnrollmentLoading(true);
      setError(null);
      const response = await coursesAPI.adminSingleEnroll(selectedCourse.id, { user_id: selectedUser.id });
      showNotification('success', `Successfully enrolled ${selectedUser.first_name} ${selectedUser.last_name} in ${selectedCourse.title}`);
      setEnrollDialogOpen(false);
      setSelectedUser(null);
      setSelectedCourse(null);
    } catch (err) {
      let errorMessage = 'Failed to enroll user';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Course not found or not published';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.detail || 'Invalid request';
          if (err.response.data.details) {
            errorMessage += `: ${JSON.stringify(err.response.data.details)}`;
          }
        } else if (err.response.status === 500) {
          errorMessage = err.response.data.error || 'Server error';
          if (err.response.data.details) {
            console.error('Server error details:', err.response.data.details);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleBulkEnrollSubmit = async () => {
    if (activeTab === 'manual' && selectedUsers.length === 0) return;
    if (activeTab === 'file' && fileData.length === 0) return;
    try {
      setEnrollmentLoading(true);
      setError(null);
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
      const payload = { user_ids: Array.from(userIds) };
      const response = await coursesAPI.adminBulkEnrollCourse(selectedCourse.id, payload);
      let successMsg = `Successfully enrolled ${response.data.created || userIds.length} users`;
      if (response.data.already_enrolled > 0) {
        successMsg += ` (${response.data.already_enrolled} were already enrolled)`;
      }
      showNotification('success', successMsg);
      setBulkEnrollDialogOpen(false);
      setSelectedUsers([]);
      setFile(null);
      setFileData([]);
      setSelectedCourse(null);
    } catch (err) {
      let errorMessage = 'Failed to bulk enroll users';
      if (err.response) {
        errorMessage = err.response.data.detail || errorMessage;
        if (err.response.data.details) {
          errorMessage += `: ${JSON.stringify(err.response.data.details)}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      return isSelected ? prev.filter(u => u.id !== user.id) : [...prev, user];
    });
  };

  const toggleSelectAllUsers = (selectAll) => {
    if (selectAll) {
      setSelectedUsers([...users]);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/courses/edit/${courseId}`);
  };

  const handleView = (courseId) => {
    navigate(`/admin/courses/view/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await coursesAPI.deleteCourse(courseId);
      setAllCourses(prev => prev.filter(course => course.id !== courseId));
      setTotalCourses(prev => prev - 1);
      showNotification('success', 'Course deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete course');
      showNotification('error', err.response?.data?.message || err.message || 'Failed to delete course');
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

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  const paginatedCourses = filteredCourses.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const showNotification = (type, text) => {
    setNotificationMessages(prev => [...prev, { type, text }]);
    setIsNotificationOpen(true);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
    setNotificationMessages([]);
  };

  return (
    <div className="CourseList">
      {isNotificationOpen && (
        <NotificationModal messages={notificationMessages} onClose={closeNotification} />
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
                      <button onClick={() => handleEnrollClick(course)} aria-label={`Enroll user in ${course.title}`}>
                        <PersonAdd className="icon" />
                      </button>
                      <button onClick={() => handleBulkEnrollClick(course)} aria-label={`Bulk enroll users in ${course.title}`}>
                        <GroupAdd className="icon" />
                      </button>
                      <button onClick={() => handleEdit(course.id)}>
                        <Edit className="icon" />
                      </button>
                      <button onClick={() => handleView(course.id)}>
                        <Visibility className="icon" />
                      </button>
                      <button onClick={() => handleDelete(course.id)}>
                        <Delete className="icon" style={{ color: '#b91c1c' }} />
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
      {enrollDialogOpen && (
        <div className={`enroll-dialog ${enrollDialogOpen ? 'open' : ''}`} role="dialog" aria-labelledby="enroll-dialog-title" onClick={(e) => e.target === e.currentTarget && setEnrollDialogOpen(false)}>
          <div className="dialog-overlay" onClick={(e) => e.stopPropagation()}></div>
          <div className="dialog-content" tabIndex="-1" ref={node => node && node.focus()} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 id="enroll-dialog-title"><Person className="icon" /> Enroll User</h3>
              <button className="close-btn" onClick={() => setEnrollDialogOpen(false)} aria-label="Close dialog">
                <Warning className="icon" />
              </button>
            </div>
            <div className="dialog-body">
              {(() => {
                try {
                  if (usersLoading) {
                    return <div className="loading">Loading users...</div>;
                  }
                  return (
                    <>
                      <span className="dialog-subtitle">
                        {selectedCourse?.title ? selectedCourse.title : 'No course selected'}
                      </span>
                      {error && (
                        <div className="error-message">
                          <Warning className="icon" /> {error}
                        </div>
                      )}
                      <input
                        type="text"
                        className="select"
                        placeholder="Search users..."
                        value={searchUserTerm}
                        onChange={(e) => setSearchUserTerm(e.target.value)}
                        style={{ marginTop: '10px', width: '100%' }}
                      />
                      <select
                        className="select"
                        value={selectedUser?.id || ''}
                        onChange={(e) => {
                          const user = filteredUsers.find(u => u.id === parseInt(e.target.value));
                          setSelectedUser(user || null);
                        }}
                        autoFocus
                        style={{ marginTop: '10px', width: '100%' }}
                      >
                        <option value="">Select User</option>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.email})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No users available</option>
                        )}
                      </select>
                    </>
                  );
                } catch (error) {
                  console.error('Error rendering modal content:', error);
                  return <div className="error-message">Error loading modal content</div>;
                }
              })()}
            </div>
            <div className="dialog-actions">
              <button className="action-btn" onClick={() => setEnrollDialogOpen(false)}>
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={handleEnrollSubmit}
                disabled={!selectedUser || enrollmentLoading || usersLoading}
              >
                {enrollmentLoading ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}
      {bulkEnrollDialogOpen && (
        <div className={`bulk-enroll-dialog ${bulkEnrollDialogOpen ? 'open' : ''}`} role="dialog" aria-labelledby="bulk-enroll-dialog-title" onClick={(e) => e.target === e.currentTarget && setBulkEnrollDialogOpen(false)}>
          <div className="dialog-overlay" onClick={(e) => e.stopPropagation()}></div>
          <div className="dialog-content" tabIndex="-1" ref={node => node && node.focus()} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 id="bulk-enroll-dialog-title"><Groups className="icon" /> Bulk Enroll</h3>
              <button className="close-btn" onClick={() => setBulkEnrollDialogOpen(false)} aria-label="Close dialog">
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
              {usersLoading ? (
                <div className="loading">Loading users...</div>
              ) : (
                <>
                  <span className="dialog-subtitle">{selectedCourse?.title || 'Select a course'}</span>
                  {error && (
                    <div className="error-message">
                      <Warning className="icon" /> {error}
                    </div>
                  )}
                  {activeTab === 'manual' ? (
                    <>
                      <input
                        type="text"
                        className="select"
                        placeholder="Search users..."
                        value={searchUserTerm}
                        onChange={(e) => setSearchUserTerm(e.target.value)}
                        style={{ marginTop: '10px', width: '100%' }}
                      />
                      <div className="selection-info">
                        <span>{selectedUsers.length} of {filteredUsers.length} selected</span>
                        <button onClick={() => toggleSelectAllUsers(selectedUsers.length < filteredUsers.length)}>
                          {selectedUsers.length === filteredUsers.length ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      <ul className="user-list">
                        {filteredUsers.map(user => (
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
                  setSelectedCourse(null);
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
                  enrollmentLoading || usersLoading
                }
              >
                {activeTab === 'manual' 
                  ? `Enroll ${selectedUsers.length}`
                  : `Enroll from File`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;