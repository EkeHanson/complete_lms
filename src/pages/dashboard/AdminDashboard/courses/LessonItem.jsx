import React, { useState } from 'react';
import './LessonItem.css';
import {
  ExpandMore, ExpandLess, Delete, Edit, Save, Cancel,
  CloudUpload, DragHandle, VideoLibrary, PictureAsPdf,
  Link as LinkIcon, InsertDriveFile
} from '@mui/icons-material';
import { coursesAPI } from '../../../../config'; // Import API from api.js

const resourceTypes = [
  { value: 'link', label: 'Web Link', icon: <LinkIcon /> },
  { value: 'pdf', label: 'PDF Document', icon: <PictureAsPdf /> },
  { value: 'video', label: 'Video', icon: <VideoLibrary /> },
  { value: 'file', label: 'File', icon: <InsertDriveFile /> }
];

const LessonItem = ({ lesson, index, moduleId, courseId, onUpdate, onDelete, isMobile }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(!lesson.id); // Auto-edit for new lessons
  const [editedLesson, setEditedLesson] = useState({
    title: lesson.title || '',
    description: lesson.description || '',
    content_type: lesson.content_type || 'video',
    content_url: lesson.content_url || '',
    content_file: null,
    duration: lesson.duration || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedLesson({
      title: lesson.title || '',
      description: lesson.description || '',
      content_type: lesson.content_type || 'video',
      content_url: lesson.content_url || '',
      content_file: null,
      duration: lesson.duration || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setEditedLesson(prev => ({ ...prev, content_file: e.target.files[0] }));
  };

  const handleSave = async () => {
    if (!editedLesson.title.trim()) {
      setError('Lesson title is required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editedLesson.title);
      formData.append('description', editedLesson.description);
      formData.append('content_type', editedLesson.content_type);
      if (editedLesson.content_type === 'link') {
        formData.append('content_url', editedLesson.content_url);
      } else if (editedLesson.content_file) {
        formData.append('content_file', editedLesson.content_file);
      }
      formData.append('duration', editedLesson.duration);
      formData.append('module_id', moduleId);

      let updatedLesson;
      if (lesson.id) {
        updatedLesson = await coursesAPI.updateLesson(lesson.id, formData);
        setSuccess('Lesson updated successfully.');
      } else {
        updatedLesson = await coursesAPI.createLesson(formData);
        setSuccess('Lesson created successfully.');
      }

      onUpdate(updatedLesson.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson.id) {
      onDelete(lesson.tempId);
      return;
    }

    setLoading(true);
    try {
      await coursesAPI.deleteLesson(lesson.id);
      onDelete(lesson.id);
      setSuccess('Lesson deleted successfully.');
    } catch (err) {
      setError('Failed to delete lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = () => {
    const resourceType = resourceTypes.find(t => t.value === lesson.content_type);
    return resourceType ? resourceType.icon : <InsertDriveFile />;
  };

  return (
    <div className="LessonItem">
      <div className="LessonItem-Header">
        <DragHandle className="icon" />
        <span className="title">{lesson.title || `Lesson ${index + 1}`}</span>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleToggleExpand}>
            {expanded ? <ExpandLess className="icon" /> : <ExpandMore className="icon" />}
          </button>
          {!isEditing && (
            <button className="icon-btn" onClick={handleEditToggle}>
              <Edit className="icon" />
            </button>
          )}
          <button className="icon-btn delete" onClick={handleDelete} disabled={loading}>
            <Delete className="icon" />
          </button>
        </div>
      </div>

      {(expanded || isEditing) && (
        <div className="LessonItem-Content">
          {isEditing ? (
            <>
              <label className="label">Lesson Title</label>
              <input
                className={`input ${error && !editedLesson.title.trim() ? 'error' : ''}`}
                name="title"
                value={editedLesson.title}
                onChange={handleChange}
                placeholder="Enter lesson title"
              />
              {error && !editedLesson.title.trim() && (
                <span className="error-text">Title is required</span>
              )}

              <label className="label">Description</label>
              <textarea
                className="textarea"
                name="description"
                value={editedLesson.description}
                onChange={handleChange}
                rows={2}
                placeholder="Enter description"
              />

              <label className="label">Content Type</label>
              <select
                className="select"
                name="content_type"
                value={editedLesson.content_type}
                onChange={handleChange}
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {editedLesson.content_type === 'link' ? (
                <>
                  <label className="label">Content URL</label>
                  <input
                    className="input"
                    name="content_url"
                    value={editedLesson.content_url}
                    onChange={handleChange}
                    placeholder="Enter URL"
                  />
                </>
              ) : (
                <>
                  <label className="label">Upload Content</label>
                  <button className="upload-btn" component="label">
                    <CloudUpload className="icon" /> Upload Content
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept={
                        editedLesson.content_type === 'pdf' ? 'application/pdf' :
                        editedLesson.content_type === 'video' ? 'video/*' : '*'
                      }
                    />
                  </button>
                </>
              )}
              {editedLesson.content_file && (
                <span className="file-info">Selected: {editedLesson.content_file.name}</span>
              )}

              <label className="label">Duration</label>
              <input
                className="input"
                name="duration"
                value={editedLesson.duration}
                onChange={handleChange}
                placeholder="e.g., 30 min"
              />

              <div className="action-buttons">
                <button
                  className="action-btn"
                  onClick={() => lesson.id ? setIsEditing(false) : onDelete(lesson.tempId)}
                  disabled={loading}
                >
                  <Cancel className="icon" /> Cancel
                </button>
                <button
                  className="action-btn primary"
                  onClick={handleSave}
                  disabled={loading || !editedLesson.title.trim()}
                >
                  <Save className="icon" /> Save
                </button>
              </div>
            </>
          ) : (
            <div className="content-details">
              <p>
                <strong>Description:</strong> {lesson.description || 'No description'}
              </p>
              <p>
                <strong>Content Type:</strong> {getContentIcon()} {lesson.content_type}
              </p>
              {lesson.content_type === 'link' ? (
                <p>
                  <strong>URL:</strong> {lesson.content_url}
                </p>
              ) : (
                <p>
                  <strong>File:</strong> {lesson.content_file?.name || 'Uploaded content'}
                </p>
              )}
              <p>
                <strong>Duration:</strong> {lesson.duration || 'Not specified'}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="notification error">
          {error}
        </div>
      )}
      {success && (
        <div className="notification success">
          {success}
        </div>
      )}
    </div>
  );
};

export default LessonItem;
