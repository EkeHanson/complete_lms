import React, { useState } from 'react';
import './LessonItem.css';
import {
  ExpandMore, ExpandLess, Delete, Edit, Save, Cancel,
  CloudUpload, DragHandle, VideoLibrary, PictureAsPdf,
  Link as LinkIcon, InsertDriveFile
} from '@mui/icons-material';
import { coursesAPI } from '../../../../config';

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
    lesson_type: lesson.lesson_type || 'video', // Align with ModuleForm
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
      lesson_type: lesson.lesson_type || 'video',
      content_url: lesson.content_url || '',
      content_file: null,
      duration: lesson.duration || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedLesson(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e) => {
    setEditedLesson(prev => ({ ...prev, content_file: e.target.files[0] }));
    setError(null);
  };

  const handleSave = async () => {
    if (!editedLesson.title.trim()) {
      setError('Lesson title is required.');
      return;
    }
    if (editedLesson.lesson_type === 'link' && !editedLesson.content_url.trim()) {
      setError('Content URL is required for link lessons.');
      return;
    }
    if (['video', 'pdf', 'file'].includes(editedLesson.lesson_type) && !editedLesson.content_file && !lesson.id) {
      setError('Content file is required for this lesson type.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editedLesson.title);
      formData.append('description', editedLesson.description);
      formData.append('lesson_type', editedLesson.lesson_type);
      formData.append('order', lesson.order ?? index); // Ensure order is set
      if (editedLesson.lesson_type === 'link') {
        formData.append('content_url', editedLesson.content_url);
      } else if (editedLesson.content_file) {
        formData.append('content_file', editedLesson.content_file);
      }
      formData.append('duration', editedLesson.duration);

      let updatedLesson;
      if (lesson.id) {
        updatedLesson = await coursesAPI.updateLesson(courseId, moduleId, lesson.id, formData);
        setSuccess('Lesson updated successfully.');
      } else {
        updatedLesson = await coursesAPI.createLesson(courseId, moduleId, formData);
        setSuccess('Lesson created successfully.');
      }

      onUpdate(updatedLesson.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving lesson:', err.response?.data || err.message);
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to save lesson.');
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
      await coursesAPI.deleteLesson(courseId, moduleId, lesson.id);
      onDelete(lesson.id);
      setSuccess('Lesson deleted successfully.');
    } catch (err) {
      console.error('Error deleting lesson:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to delete lesson.');
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = () => {
    const resourceType = resourceTypes.find(t => t.value === lesson.lesson_type);
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
                name="lesson_type"
                value={editedLesson.lesson_type}
                onChange={handleChange}
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {editedLesson.lesson_type === 'link' ? (
                <>
                  <label className="label">Content URL</label>
                  <input
                    className={`input ${error && editedLesson.lesson_type === 'link' && !editedLesson.content_url.trim() ? 'error' : ''}`}
                    name="content_url"
                    value={editedLesson.content_url}
                    onChange={handleChange}
                    placeholder="Enter URL"
                  />
                  {error && editedLesson.lesson_type === 'link' && !editedLesson.content_url.trim() && (
                    <span className="error-text">Content URL is required</span>
                  )}
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
                        editedLesson.lesson_type === 'pdf' ? 'application/pdf' :
                        editedLesson.lesson_type === 'video' ? 'video/*' : '*'
                      }
                    />
                  </button>
                  {editedLesson.content_file && (
                    <span className="file-info">Selected: {editedLesson.content_file.name}</span>
                  )}
                  {error && ['video', 'pdf', 'file'].includes(editedLesson.lesson_type) && !editedLesson.content_file && !lesson.id && (
                    <span className="error-text">Content file is required</span>
                  )}
                </>
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
                <strong>Content Type:</strong> {getContentIcon()} {lesson.lesson_type}
              </p>
              {lesson.lesson_type === 'link' ? (
                <p>
                  <strong>URL:</strong> {lesson.content_url}
                </p>
              ) : (
                <p>
                  <strong>File:</strong> {lesson.content_file?.name || lesson.content_file || 'Uploaded content'}
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

