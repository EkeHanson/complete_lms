import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Email as EmailIcon, Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  Add as AddIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { coursesAPI } from  '../../../config';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
  Tooltip, Link, Chip, Autocomplete, Checkbox, FormControlLabel, 
  FormGroup, Divider, useMediaQuery, IconButton, Stack, 
  Collapse, Card, CardContent, CardActions, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, TablePagination, Grid,
  LinearProgress, CircularProgress, Badge,
} from '@mui/material';
import './LearnerProfile.css';

const LearnerProfile = ({ learnerId }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isEditingContact, setIsEditingContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [learnerData, setLearnerData] = useState({
    id: learnerId,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 555-123-4567',
    coursesSubscribed: 5,
    coursesCompleted: 3,
    completionRate: 60,
    qualifications: 'BSc Computer Science, MSc Data Science',
    target: 'Become a full-stack developer',
    keyActivities: 'Working on React projects, Learning Node.js',
    coursesTaken: [
      { id: 1, name: 'React Fundamentals', status: 'completed' },
      { id: 2, name: 'Advanced JavaScript', status: 'completed' },
      { id: 3, name: 'Node.js Basics', status: 'completed' },
      { id: 4, name: 'Database Design', status: 'in-progress' },
      { id: 5, name: 'Cloud Computing', status: 'pending' }
    ],
    contactLogs: [
      { id: 1, date: '2023-06-01', method: 'email', notes: 'Follow-up on course progress', admin: 'John Doe' },
      { id: 2, date: '2023-05-15', method: 'phone', notes: 'Initial consultation', admin: 'Jane Smith' },
      { id: 3, date: '2023-04-10', method: 'messaging', notes: 'Course recommendation', admin: 'John Doe' }
    ]
  });
  const [userBadges, setUserBadges] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [newContactLog, setNewContactLog] = useState({
    date: new Date().toISOString().split('T')[0],
    method: 'email',
    notes: '',
    admin: 'Current User'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [badgesResponse, pointsResponse] = await Promise.all([
          coursesAPI.getUserBadges(learnerId),
          coursesAPI.getUserPoints(learnerId),
        ]);
        setUserBadges(badgesResponse.data?.results || []);
        setUserPoints(pointsResponse.data?.total_points || 0);
        if (badgesResponse.data?.results?.length > 0) {
          toast.success('New badge earned!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (err) {
        setError('Failed to load gamification data');
        console.error('Error fetching gamification data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [learnerId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditContact = (log) => {
    setIsEditingContact(log.id);
  };

  const handleSaveContact = () => {
    setIsEditingContact(null);
  };

  const handleDeleteContact = (logId) => {
    setLearnerData(prev => ({
      ...prev,
      contactLogs: prev.contactLogs.filter(log => log.id !== logId)
    }));
  };

  const handleAddContact = () => {
    const newLog = {
      ...newContactLog,
      id: Math.max(...learnerData.contactLogs.map(log => log.id), 0) + 1
    };
    setLearnerData(prev => ({
      ...prev,
      contactLogs: [...prev.contactLogs, newLog]
    }));
    setNewContactLog({
      date: new Date().toISOString().split('T')[0],
      method: 'email',
      notes: '',
      admin: 'Current User'
    });
    setOpenModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className="lp-container">
      <ToastContainer />
      <button
        className="lp-back-btn"
        onClick={() => navigate('/admin/users')}
      >
        <ArrowBackIcon />
        Back to Users
      </button>

      <div className="lp-profile-card">
        <div className="lp-profile-header">
          <div className="lp-avatar">{learnerData.name.charAt(0)}</div>
          <h1>{learnerData.name}</h1>
        </div>
        <div className="lp-profile-content">
          <div className="lp-profile-grid">
            <div className="lp-profile-info">
              <div className="lp-info-item">
                <EmailIcon />
                <span>{learnerData.email}</span>
              </div>
              <div className="lp-info-item">
                <PhoneIcon />
                <span>{learnerData.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="lp-profile-stats">
              <div className="lp-stat-item">
                <span className="lp-stat-label">Courses:</span>
                <span>{learnerData.coursesSubscribed} subscribed • {learnerData.coursesCompleted} completed</span>
              </div>
              <div className="lp-stat-item">
                <span className="lp-stat-label">Completion Rate:</span>
                <div className="lp-progress-container">
                  <div
                    className="lp-progress-bar"
                    style={{
                      width: `${learnerData.completionRate}%`,
                      backgroundColor:
                        learnerData.completionRate >= 75 ? '#065f46' :
                        learnerData.completionRate >= 50 ? '#d97706' : '#991b1b'
                    }}
                  ></div>
                  <span>{learnerData.completionRate}%</span>
                </div>
              </div>
            </div>
            <div className="lp-profile-details">
              <div className="lp-detail-item">
                <h4>Qualifications</h4>
                <p>{learnerData.qualifications || 'Not specified'}</p>
              </div>
              <div className="lp-detail-item">
                <h4>Target</h4>
                <p>{learnerData.target || 'Not specified'}</p>
              </div>
              <div className="lp-detail-item">
                <h4>Key Activities</h4>
                <p>{learnerData.keyActivities || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-tabs">
        <button
          className={`lp-tab ${tabValue === 0 ? 'active' : ''}`}
          onClick={() => setTabValue(0)}
        >
          Courses
        </button>
        <button
          className={`lp-tab ${tabValue === 1 ? 'active' : ''}`}
          onClick={() => setTabValue(1)}
        >
          Contact Log
        </button>
        <button
          className={`lp-tab ${tabValue === 2 ? 'active' : ''}`}
          onClick={() => setTabValue(2)}
        >
          Gamification
        </button>
      </div>

      {tabValue === 0 && (
        <div className="lp-section-card">
          <h2>Course Progress</h2>
          <div className="lp-courses-grid">
            <div className="lp-courses-section">
              <h4>Completed Courses</h4>
              {learnerData.coursesTaken
                .filter(course => course.status === 'completed')
                .map(course => (
                  <div key={course.id} className="lp-course-item">
                    <CheckCircleIcon />
                    <span>{course.name}</span>
                  </div>
                ))}
            </div>
            <div className="lp-courses-section">
              <h4>Pending/In-Progress Courses</h4>
              {learnerData.coursesTaken
                .filter(course => course.status !== 'completed')
                .map(course => (
                  <div key={course.id} className="lp-course-item">
                    <PendingIcon className={course.status === 'in-progress' ? 'lp-icon-warning' : 'lp-icon-disabled'} />
                    <span>{course.name}</span>
                    <span className={`lp-chip ${course.status === 'in-progress' ? 'in-progress' : 'pending'}`}>
                      {course.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tabValue === 1 && (
        <div className="lp-section-card">
          <div className="lp-section-header">
            <h2>Contact History</h2>
            <button className="lp-btn lp-btn-primary" onClick={handleOpenModal}>
              <AddIcon />
              Add Contact Log
            </button>
          </div>
          <div className="lp-table-container">
            <table className="lp-table">
              <thead>
                <tr>
                  <th><span>Date</span></th>
                  <th><span>Method</span></th>
                  <th><span>Notes</span></th>
                  <th><span>Admin</span></th>
                  <th><span>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {learnerData.contactLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>
                      <span
                        className={`lp-chip ${
                          log.method === 'email' ? 'email' :
                          log.method === 'phone' ? 'phone' : 'default'
                        }`}
                      >
                        {log.method.charAt(0).toUpperCase() + log.method.slice(1)}
                      </span>
                    </td>
                    <td>
                      {isEditingContact === log.id ? (
                        <input
                          type="text"
                          value={log.notes}
                          onChange={(e) => {
                            const updatedLogs = learnerData.contactLogs.map(item =>
                              item.id === log.id ? {...item, notes: e.target.value} : item
                            );
                            setLearnerData({...learnerData, contactLogs: updatedLogs});
                          }}
                        />
                      ) : (
                        log.notes
                      )}
                    </td>
                    <td>{log.admin}</td>
                    <td>
                      <div className="lp-action-btns">
                        {isEditingContact === log.id ? (
                          <>
                            <button className="lp-btn lp-btn-edit" onClick={handleSaveContact}>
                              <CheckCircleIcon />
                            </button>
                            <button className="lp-btn lp-btn-delete" onClick={() => setIsEditingContact(null)}>
                              <CloseIcon />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="lp-btn lp-btn-edit" onClick={() => handleEditContact(log)}>
                              <EditIcon />
                            </button>
                            <button className="lp-btn lp-btn-delete" onClick={() => handleDeleteContact(log.id)}>
                              <DeleteIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tabValue === 2 && (
        <div className="lp-section-card">
          <h2>Gamification</h2>
          {error && <div className="lp-error">{error}</div>}
          <div className="lp-gamification-grid">
            <div className="lp-gamification-item">
              <StarIcon />
              <span>Total Points: {userPoints}</span>
            </div>
            <div className="lp-gamification-item">
              <h4>Earned Badges</h4>
              {loading ? (
                <div className="lp-loading">
                  <div className="lp-progress-bar-loading"></div>
                </div>
              ) : userBadges.length === 0 ? (
                <p className="lp-text-secondary">No badges earned yet</p>
              ) : (
                <div className="lp-badges-container">
                  {userBadges.map(badge => (
                    <div key={badge.id} className="lp-badge-item">
                      <div className="lp-chip">
                        <div className="lp-badge-avatar" style={{ backgroundImage: `url(${badge.badge.image})` }}></div>
                        {badge.badge.title}
                      </div>
                      <p className="lp-text-secondary">
                        Progress: {learnerData.coursesCompleted} / {badge.badge.criteria.courses_completed} courses
                      </p>
                      <div className="lp-progress-container">
                        <div
                          className="lp-progress-bar"
                          style={{
                            width: `${(learnerData.coursesCompleted / badge.badge.criteria.courses_completed) * 100}%`,
                            backgroundColor: '#7226FF'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      < Dialog open={openModal} onClose={handleCloseModal} className="lp-dialog">
        <div className="lp-dialog-backdrop" onClick={handleCloseModal}></div>
        <div className="lp-dialog-content">
          <div className="lp-dialog-header">
            <h3>Add New Contact Log</h3>
            <button className="lp-dialog-close" onClick={handleCloseModal}>
              <CloseIcon />
            </button>
          </div>
          <div className="lp-dialog-body">
            <div className="lp-form-grid">
              <div className="lp-form-field">
                <label>Date</label>
                <input
                  type="date"
                  value={newContactLog.date}
                  onChange={(e) => setNewContactLog({...newContactLog, date: e.target.value})}
                />
              </div>
              <div className="lp-form-field">
                <label>Contact Method</label>
                <select
                  value={newContactLog.method}
                  onChange={(e) => setNewContactLog({...newContactLog, method: e.target.value})}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="messaging">Messaging</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
              <div className="lp-form-field lp-form-field-full">
                <label>Notes</label>
                <textarea
                  rows="4"
                  value={newContactLog.notes}
                  onChange={(e) => setNewContactLog({...newContactLog, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="lp-dialog-actions">
            <button className="lp-btn lp-btn-cancel" onClick={handleCloseModal}>
              Cancel
            </button>
            <button
              className="lp-btn lp-btn-confirm"
              onClick={handleAddContact}
              disabled={!newContactLog.notes.trim()}
            >
              Add Contact Log
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LearnerProfile;