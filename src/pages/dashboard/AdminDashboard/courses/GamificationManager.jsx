import {
  Add,
  Delete,
  Edit,
  Star,
  CloudUpload, CheckCircle
} from '@mui/icons-material';



import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../../../config';

const GamificationManager = ({ courseId, isMobile }) => {
  const [badges, setBadges] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    course_completion: 100,
    module_completion: 20,
    lesson_completion: 10,
    quiz_score: 5,
    discussion: 2,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [newBadge, setNewBadge] = useState({
    title: '',
    description: '',
    criteria: { courses_completed: 0 },
    image: null,
  });
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [badgesResponse, leaderboardResponse] = await Promise.all([
        coursesAPI.getBadges(),
        coursesAPI.getLeaderboard(courseId),
      ]);
      setBadges(badgesResponse.data?.results || []);
      setLeaderboard(leaderboardResponse.data?.results || []);
    } catch (err) {
      setError('Failed to load gamification data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBadge = async () => {
    if (!newBadge.title.trim()) {
      setError('Badge title is required');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBadge.title);
      formData.append('description', newBadge.description);
      formData.append('criteria', JSON.stringify(newBadge.criteria));
      if (newBadge.image) formData.append('image', newBadge.image);

      const response = await coursesAPI.createBadge(formData);
      setBadges([...badges, response.data]);
      setNewBadge({ title: '', description: '', criteria: { courses_completed: 0 }, image: null });
      setBadgeDialogOpen(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create badge');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge || !newBadge.title.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBadge.title);
      formData.append('description', newBadge.description);
      formData.append('criteria', JSON.stringify(newBadge.criteria));
      if (newBadge.image) formData.append('image', newBadge.image);

      const response = await coursesAPI.updateBadge(editingBadge.id, formData);
      setBadges(badges.map(badge => (badge.id === editingBadge.id ? response.data : badge)));
      setEditingBadge(null);
      setNewBadge({ title: '', description: '', criteria: { courses_completed: 0 }, image: null });
      setBadgeDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update badge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (id) => {
    setLoading(true);
    try {
      await coursesAPI.deleteBadge(id);
      setBadges(badges.filter(badge => badge.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete badge');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBadge = (badge) => {
    setEditingBadge(badge);
    setNewBadge({
      title: badge.title,
      description: badge.description,
      criteria: badge.criteria,
      image: null,
    });
    setBadgeDialogOpen(true);
  };

  const handlePointsConfigChange = (activity, value) => {
    setPointsConfig(prev => ({ ...prev, [activity]: parseInt(value) || 0 }));
  };

  const savePointsConfig = async () => {
    setLoading(true);
    try {
      await coursesAPI.updatePointsConfig(courseId, pointsConfig);
      setError('');
    } catch (err) {
      setError('Failed to save points configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="GamificationManager">
      {error && (
        <div className="error-notification">
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError('')}>
            <CheckCircle className="icon" />
          </button>
        </div>
      )}

      <div className="GamificationManager-Top">
        <div className="GamificationManager-Top-Grid">
          <div className="GamificationManager-Top-1">
            <h2>
              <Star className="icon" /> Gamification Settings
            </h2>
          </div>
          <div className="GamificationManager-Top-2">
            <span className="label">Course ID: {courseId}</span>
          </div>
        </div>
      </div>

      {/* Badge Management */}
      <div className="GamificationManager-Section">
        <h3>{editingBadge ? 'Edit Badge' : 'Create New Badge'}</h3>
        <div className="GamificationManager-Grid">
          <div className="GamificationManager-Field">
            <label className="label">Badge Title</label>
            <input
              type="text"
              className="input"
              value={newBadge.title}
              onChange={e => setNewBadge({ ...newBadge, title: e.target.value })}
              placeholder="Enter badge title"
            />
          </div>
          <div className="GamificationManager-Field">
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              value={newBadge.description}
              onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
              placeholder="Enter badge description"
            />
          </div>
          <div className="GamificationManager-Field">
            <label className="label">Courses to Complete</label>
            <input
              type="number"
              className="input"
              value={newBadge.criteria.courses_completed}
              onChange={e =>
                setNewBadge({
                  ...newBadge,
                  criteria: { ...newBadge.criteria, courses_completed: parseInt(e.target.value) || 0 },
                })
              }
              placeholder="Number of courses"
            />
          </div>
          <div className="GamificationManager-Field">
            <label className="label">Badge Image</label>
            <button className="upload-btn" component="label">
              <CloudUpload className="icon" /> Upload Badge Image
              <input
                type="file"
                hidden
                onChange={e => setNewBadge({ ...newBadge, image: e.target.files[0] })}
                accept="image/*"
              />
            </button>
            {newBadge.image && (
              <span className="file-preview">Selected: {newBadge.image.name}</span>
            )}
          </div>
        </div>
        <div className="action-buttons">
          {editingBadge ? (
            <>
              <button
                className="action-btn"
                onClick={() => {
                  setEditingBadge(null);
                  setNewBadge({ title: '', description: '', criteria: { courses_completed: 0 }, image: null });
                }}
              >
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={handleUpdateBadge}
                disabled={loading || !newBadge.title.trim()}
              >
                {loading ? <CircularProgress className="loading-spinner" /> : 'Update'}
              </button>
            </>
          ) : (
            <button
              className="action-btn primary"
              onClick={handleAddBadge}
              disabled={loading || !newBadge.title.trim()}
            >
              <Add className="icon" /> {loading ? <CircularProgress className="loading-spinner" /> : 'Add Badge'}
            </button>
          )}
        </div>
      </div>

      {/* Existing Badges */}
      <div className="GamificationManager-Section">
        <h3>Existing Badges</h3>
        {loading ? (
          <div className="loading-container">
            <CircularProgress className="loading-spinner" />
          </div>
        ) : badges.length === 0 ? (
          <div className="empty-state">
            <Star className="empty-icon" />
            <span>No badges created yet</span>
          </div>
        ) : (
          <ul className="badge-list">
            {badges.map(badge => (
              <li key={badge.id} className="badge-item">
                <div className="badge-info">
                  <span className="badge-title">{badge.title}</span>
                  <span className="badge-criteria">
                    Criteria: Complete {badge.criteria.courses_completed} courses
                  </span>
                </div>
                {badge.image && <img src={badge.image} alt={badge.title} className="badge-img" />}
                <div className="badge-actions">
                  <button className="action-btn" onClick={() => handleEditBadge(badge)}>
                    <Edit className="icon" />
                  </button>
                  <button className="action-btn danger" onClick={() => handleDeleteBadge(badge.id)}>
                    <Delete className="icon" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Points Configuration */}
      <div className="GamificationManager-Section">
        <h3>Points Configuration</h3>
        <div className="GamificationManager-Grid">
          {Object.entries(pointsConfig).map(([activity, points]) => (
            <div key={activity} className="GamificationManager-Field">
              <label className="label">{activity.replace('_', ' ').toUpperCase()}</label>
              <input
                type="number"
                className="input"
                value={points}
                onChange={e => handlePointsConfigChange(activity, e.target.value)}
                placeholder="Points"
              />
            </div>
          ))}
        </div>
        <div className="action-buttons">
          <button
            className="action-btn primary"
            onClick={savePointsConfig}
            disabled={loading}
          >
            {loading ? <CircularProgress className="loading-spinner" /> : 'Save Points Config'}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="GamificationManager-Section">
        <h3>Leaderboard</h3>
        {leaderboard.length === 0 ? (
          <span className="empty-text">No leaderboard data available</span>
        ) : (
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.user__username}>
                    <td>{index + 1}</td>
                    <td>{entry.user__username}</td>
                    <td>{entry.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Badge Dialog */}
      <div className={`badge-dialog ${badgeDialogOpen ? 'open' : ''}`}>
        <div className="badge-dialog-overlay" onClick={() => setBadgeDialogOpen(false)}></div>
        <div className="badge-dialog-content">
          <div className="badge-dialog-header">
            <h3>{editingBadge ? 'Edit Badge' : 'Add New Badge'}</h3>
            <button className="close-btn" onClick={() => setBadgeDialogOpen(false)}>
              <CheckCircle className="icon" />
            </button>
          </div>
          <div className="badge-dialog-body">
            <label className="label">Badge Title</label>
            <input
              type="text"
              className="input"
              value={newBadge.title}
              onChange={e => setNewBadge({ ...newBadge, title: e.target.value })}
              placeholder="Enter badge title"
              autoFocus
            />
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              value={newBadge.description}
              onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
              placeholder="Enter badge description"
            />
            <label className="label">Courses to Complete</label>
            <input
              type="number"
              className="input"
              value={newBadge.criteria.courses_completed}
              onChange={e =>
                setNewBadge({
                  ...newBadge,
                  criteria: { ...newBadge.criteria, courses_completed: parseInt(e.target.value) || 0 },
                })
              }
              placeholder="Number of courses"
            />
            <label className="label">Badge Image</label>
            <button className="upload-btn" component="label">
              <CloudUpload className="icon" /> Upload Badge Image
              <input
                type="file"
                hidden
                onChange={e => setNewBadge({ ...newBadge, image: e.target.files[0] })}
                accept="image/*"
              />
            </button>
            {newBadge.image && (
              <span className="file-preview">Selected: {newBadge.image.name}</span>
            )}
          </div>
          <div className="badge-dialog-actions">
            <button className="action-btn" onClick={() => setBadgeDialogOpen(false)}>
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={editingBadge ? handleUpdateBadge : handleAddBadge}
              disabled={loading || !newBadge.title.trim()}
            >
              {loading ? <CircularProgress className="loading-spinner" /> : (editingBadge ? 'Update' : 'Add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationManager;