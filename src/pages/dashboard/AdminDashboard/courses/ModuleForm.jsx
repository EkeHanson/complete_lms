import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import './ModuleForm.css';
import {
  ExpandMore, AddCircle, Delete, Edit, 
  VideoLibrary, InsertDriveFile, Link as LinkIcon,
  CloudUpload, Visibility, VisibilityOff, CheckCircle
} from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import { coursesAPI } from '../../../../config';

const lessonTypes = [
  { value: 'video', label: 'Video', icon: <VideoLibrary /> },
  { value: 'file', label: 'File', icon: <InsertDriveFile /> },
  { value: 'link', label: 'Link', icon: <LinkIcon /> }
];

const DraggableModule = ({ module, index, moveModule, selectedModules, toggleModuleSelection, ...props }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'MODULE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MODULE',
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveModule(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`DraggableModule ${isDragging ? 'dragging' : ''} ${selectedModules.includes(module.id) ? 'selected' : ''}`}
    >
      <ModuleForm
        module={module}
        index={index}
        selected={selectedModules.includes(module.id)}
        onToggleSelect={() => toggleModuleSelection(module.id)}
        {...props}
      />
    </div>
  );
};

const ModuleForm = ({
  module,
  index,
  onChange,
  onDelete,
  courseId,
  selected,
  onToggleSelect
}) => {
  const [expanded, setExpanded] = useState(true);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    lesson_type: 'video',
    content_url: '',
    content_file: null,
    duration: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // console.log("Here")
  // console.log("Here")
  // console.log("Here")
  useEffect(() => {
  console.log('lessonDialogOpen changed:', lessonDialogOpen);
}, [lessonDialogOpen]);

  const validateLesson = () => {
    const newErrors = {};
    if (!newLesson.title.trim()) newErrors.title = 'Lesson title is required';
    if (newLesson.lesson_type === 'link' && !newLesson.content_url.trim()) {
      newErrors.content_url = 'URL is required for link lessons';
    }
    if (['video', 'file'].includes(newLesson.lesson_type) && !newLesson.content_file && !editingLesson) {
      newErrors.content_file = 'File is required for this lesson type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModuleChange = (field, value) => {
    const updatedModule = { ...module, [field]: value };
    onChange(module.id, updatedModule);
  };

  const handleModuleSave = async (field, value) => {
    if (!module.id || !courseId || isNaN(module.id)) {
      setErrors((prev) => ({
        ...prev,
        module: 'Module not saved yet. Please save the module first.'
      }));
      return;
    }

    try {
      setLoading(true);
      const updatedModule = { ...module, [field]: value };
      await coursesAPI.updateModule(courseId, module.id, { [field]: value });
      onChange(module.id, updatedModule);
    } catch (error) {
      console.error('Error updating module:', error);
      const errorMessage = error.response?.status === 404
        ? 'Module not found. It may have been deleted.'
        : error.response?.data?.detail || 'Failed to update module';
      setErrors((prev) => ({
        ...prev,
        module: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async () => {
    try {
      setLoading(true);
      if (module.id && courseId) {
        await coursesAPI.deleteModule(courseId, module.id);
      }
      onDelete(module.id);
    } catch (error) {
      console.error('Error deleting module:', error);
      setErrors((prev) => ({ ...prev, module: error.response?.data || 'Failed to delete module' }));
    } finally {
      setLoading(false);
    }
  };

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setNewLesson((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLessonFileChange = (e) => {
    setNewLesson((prev) => ({ ...prev, content_file: e.target.files[0] }));
    setErrors((prev) => ({ ...prev, content_file: '' }));
  };

const addLesson = async () => {
  if (!validateLesson()) return;

  console.log('addLesson called with courseId:', courseId, 'moduleId:', module.id); // Debug log

  if (!courseId || !module.id) {
    setErrors({ ...errors, submit: 'Invalid course or module ID' });
    return;
  }

  const formData = new FormData();
  formData.append('title', newLesson.title.trim());
  formData.append('lesson_type', newLesson.lesson_type);
  formData.append('order', module.lessons.length);
  formData.append('is_published', true);
  if (newLesson.duration) formData.append('duration', newLesson.duration);
  if (newLesson.lesson_type === 'link') {
    formData.append('content_url', newLesson.content_url);
  } else if (newLesson.content_file) {
    formData.append('content_file', newLesson.content_file);
  }

  try {
    setLoading(true);
    const response = await coursesAPI.createLesson(courseId, module.id, formData);
    console.log('Lesson created:', response.data);
    onChange(module.id, {
      ...module,
      lessons: [...module.lessons, { ...response.data, order: module.lessons.length }]
    });
    setNewLesson({
      title: '',
      lesson_type: 'video',
      content_url: '',
      content_file: null,
      duration: ''
    });
    setLessonDialogOpen(false);
    setErrors({});
  } catch (error) {
    console.error('Error creating lesson:', error.response?.data || error.message);
    setErrors({
      ...errors,
      submit: error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || 'Failed to create lesson'
    });
  } finally {
    setLoading(false);
  }
};

  const updateLesson = async () => {
    if (!validateLesson()) return;

    const formData = new FormData();
    formData.append('title', newLesson.title.trim());
    formData.append('lesson_type', newLesson.lesson_type);
    if (newLesson.duration) formData.append('duration', newLesson.duration);
    if (newLesson.lesson_type === 'link') {
      formData.append('content_url', newLesson.content_url);
    } else if (newLesson.content_file) {
      formData.append('content_file', newLesson.content_file);
    }

    try {
      setLoading(true);
      const response = await coursesAPI.updateLesson(courseId, module.id, editingLesson.id, formData);
      const updatedLessons = module.lessons.map((lesson) =>
        lesson.id === editingLesson.id ? response.data : lesson
      );
      onChange(module.id, {
        ...module,
        lessons: updatedLessons
      });
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setNewLesson({
        title: '',
        lesson_type: 'video',
        content_url: '',
        content_file: null,
        duration: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error updating lesson:', error);
      setErrors((prev) => ({ ...prev, submit: error.response?.data || 'Failed to update lesson' }));
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      await coursesAPI.deleteLesson(courseId, module.id, lessonId);
      onChange(module.id, {
        ...module,
        lessons: module.lessons.filter((l) => l.id !== lessonId)
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setErrors((prev) => ({ ...prev, lesson: error.response?.data || 'Failed to delete lesson' }));
    } finally {
      setLoading(false);
    }
  };

  const editLesson = (lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      content_url: lesson.content_url || '',
      content_file: null,
      duration: lesson.duration || ''
    });
    setLessonDialogOpen(true);
  };

  const getLessonIcon = (type) => {
    const lessonType = lessonTypes.find((t) => t.value === type);
    return lessonType ? lessonType.icon : <InsertDriveFile />;
  };

  return (
    <>
      <div className={`ModuleForm ${expanded ? 'expanded' : ''}`}>
        <div className="ModuleForm-Header">
          {loading && <div className="loading-spinner" />}
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="checkbox"
          />
          <h3>Module {index + 1}: {module.title || 'Untitled Module'}</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="toggle-btn"
          >
            <ExpandMore />
          </button>
          <button
            onClick={handleDeleteModule}
            className="delete-btn"
          >
            <Delete />
          </button>
        </div>
        {expanded && (
          <div className="ModuleForm-Content">
            {errors.module && (
              <div className="error-message">
                {typeof errors.module === 'string' ? errors.module :
                  Object.entries(errors.module).map(([key, val]) => (
                    <div key={key}>{key}: {val}</div>
                  ))}
              </div>
            )}

            <button
              className={`action-btn ${previewMode ? 'active' : ''}`}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <Edit /> : <Visibility />}
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>

            {previewMode ? (
              <div className="ModuleForm-Preview">
                <h4>{module.title}</h4>
                <p>{module.description || 'No description provided.'}</p>
                {module.lessons.length > 0 && (
                  <div className="lessons-preview">
                    <span>Lessons:</span>
                    <ul>
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <span className="lesson-icon">{getLessonIcon(lesson.lesson_type)}</span>
                          <span>{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="label">Module Title</label>
                <input
                  className="input"
                  value={module.title}
                  onChange={(e) => handleModuleChange('title', e.target.value)}
                  onBlur={(e) => handleModuleSave('title', e.target.value)}
                  placeholder="Enter module title"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}

                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={module.description || ''}
                  onChange={(e) => handleModuleChange('description', e.target.value)}
                  onBlur={(e) => handleModuleSave('description', e.target.value)}
                  placeholder="Enter module description"
                  rows={4}
                />

                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={module.is_published}
                    onChange={(e) => {
                      handleModuleChange('is_published', e.target.checked);
                      handleModuleSave('is_published', e.target.checked);
                    }}
                    className="switch"
                  />
                  Published
                </label>

                <div className="lessons-header">
                  <h4>Lessons</h4>
                  {/* <button
                    className="action-btn"
                    onClick={() => {
                      setEditingLesson(null);
                      setNewLesson({
                        title: '',
                        lesson_type: 'video',
                        content_url: '',
                        content_file: null,
                        duration: ''
                      });
                      setLessonDialogOpen(true);
                    }}
                  >
                    <AddCircle /> Add Lesson
                  </button> */}
                  <button
                    className="action-btn"
                    type="button"
                    onClick={(e) => { // Add 'e' as a parameter
                      e.preventDefault(); // Prevent form submission
                      console.log('Add Lesson button clicked');
                      setEditingLesson(null);
                      setNewLesson({
                        title: '',
                        lesson_type: 'video',
                        content_url: '',
                        content_file: null,
                        duration: ''
                      });
                      setLessonDialogOpen(true);
                    }}
                  >
                    <AddCircle /> Add Lesson
                  </button>
                </div>

                {module.lessons.length === 0 && (
                  <div className="empty-state">No lessons added to this module yet</div>
                )}

                <ul className="lessons-list">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="lesson-item">
                      <span className="lesson-icon">{getLessonIcon(lesson.lesson_type)}</span>
                      <div className="lesson-content">
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-details">
                          {lesson.lesson_type === 'link' ? lesson.content_url : (lesson.content_file?.name || lesson.content_file || 'No file selected')}
                          {lesson.duration && ` • Duration: ${lesson.duration}`}
                        </span>
                      </div>
                      <div className="lesson-actions">
                        <button
                          className="action-btn small"
                          onClick={() => editLesson(lesson)}
                        >
                          <Edit />
                        </button>
                        <button
                          className="action-btn small danger"
                          onClick={() => deleteLesson(lesson.id)}
                        >
                          <Delete />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className={`LessonDialog ${lessonDialogOpen ? 'open' : ''}`}>
        <div className="LessonDialog-Content">
          <h3>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
          <button
            className="close-btn"
            onClick={() => {
              setLessonDialogOpen(false);
              setEditingLesson(null);
              setNewLesson({
                title: '',
                lesson_type: 'video',
                content_url: '',
                content_file: null,
                duration: ''
              });
              setErrors({});
            }}
          >
            <Delete />
          </button>
          <div className="form-group">
            <label className="label">Lesson Title</label>
            <input
              className="input"
              name="title"
              value={newLesson.title}
              onChange={handleLessonChange}
              placeholder="Enter lesson title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="label">Lesson Type</label>
            <select
              className="select"
              name="lesson_type"
              value={newLesson.lesson_type}
              onChange={handleLessonChange}
            >
              {lessonTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {newLesson.lesson_type === 'link' && (
            <div className="form-group">
              <label className="label">Content URL</label>
              <input
                className="input"
                name="content_url"
                value={newLesson.content_url}
                onChange={handleLessonChange}
                placeholder="Enter content URL"
              />
              {errors.content_url && <span className="error-text">{errors.content_url}</span>}
            </div>
          )}

          {(newLesson.lesson_type === 'video' || newLesson.lesson_type === 'file') && (
            <div className="form-group">
              <label className="label">Upload {newLesson.lesson_type === 'video' ? 'Video' : 'File'}</label>
              <button className="action-btn upload" component="label">
                <CloudUpload /> Upload {newLesson.lesson_type === 'video' ? 'Video' : 'File'}
                <input
                  type="file"
                  hidden
                  onChange={handleLessonFileChange}
                  accept={newLesson.lesson_type === 'video' ? 'video/*' : '*'}
                />
              </button>
              {newLesson.content_file && (
                <span className="file-info">Selected: {newLesson.content_file.name}</span>
              )}
              {errors.content_file && <span className="error-text">{errors.content_file}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="label">Duration (e.g., 15 min)</label>
            <input
              className="input"
              name="duration"
              value={newLesson.duration}
              onChange={handleLessonChange}
              placeholder="Enter duration"
            />
          </div>

          {errors.submit && <span className="error-text">{errors.submit}</span>}

          <div className="dialog-actions">
            <button
              className="action-btn"
              onClick={() => {
                setLessonDialogOpen(false);
                setEditingLesson(null);
                setNewLesson({
                  title: '',
                  lesson_type: 'video',
                  content_url: '',
                  content_file: null,
                  duration: ''
                });
                setErrors({});
              }}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={editingLesson ? updateLesson : addLesson}
              disabled={!newLesson.title.trim() || loading}
            >
              {loading ? <div className="loading-spinner" /> : (editingLesson ? 'Update' : 'Add')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { ModuleForm, DraggableModule };


