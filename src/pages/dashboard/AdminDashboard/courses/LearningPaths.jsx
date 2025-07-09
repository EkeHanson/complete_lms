import { coursesAPI } from '../../../../config';
import React, { useState, useEffect } from 'react';
import './LearningPaths.css';

import {
  Add, Delete, DragHandle, School, Edit, CheckCircle
} from '@mui/icons-material';


import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const LearningPaths = ({ courseId }) => {
  const [paths, setPaths] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newPath, setNewPath] = useState({ title: '', description: '', courses: [] });
  const [editingPath, setEditingPath] = useState(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      coursesAPI.getLearningPaths(),
      coursesAPI.getCourses()
    ])
      .then(([pathsResponse, coursesResponse]) => {
        setPaths(pathsResponse.data?.results || []);
        setCourses(coursesResponse.data?.results || []);
      })
      .catch(err => {
        setError('Failed to load learning paths or courses');
        console.error(err);
        setPaths([]);
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddPath = async () => {
    if (!newPath.title.trim()) {
      setError("Title is required");
      return;
    }
  
    if (newPath.courses.length === 0 || !newPath.courses.every((c) => c.id)) {
      setError("At least one valid course with an ID is required");
      return;
    }
  
    setLoading(true);
    try {
      const pathData = {
        title: newPath.title,
        description: newPath.description,
        course_ids: newPath.courses.map((c) => c.id),
      };
      const response = await coursesAPI.createLearningPath(pathData);
      setPaths([...paths, response.data]);
      setNewPath({ title: "", description: "", courses: [] });
      setSelectedCourses([]);
      setError("");
    } catch (err) {
      console.error("Error creating path:", err.response?.data);
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = [];
        if (errorData.title) errorMessages.push(errorData.title.join(" "));
        if (errorData.course_ids) errorMessages.push(errorData.course_ids.join(" "));
        setError(errorMessages.join(" ") || "Failed to create learning path");
      } else {
        setError(err.message || "Failed to create learning path");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePath = async (id) => {
    setLoading(true);
    try {
      await coursesAPI.deleteLearningPath(id);
      setPaths(paths.filter(path => path.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPath = (path) => {
    setEditingPath(path);
    setNewPath({ 
      title: path.title, 
      description: path.description, 
      courses: path.courses 
    });
    setSelectedCourses(path.courses.map(c => c.id));
    setCourseDialogOpen(true);
  };

  const handleUpdatePath = async () => {
    if (!editingPath || !newPath.title.trim()) return;
    
    setLoading(true);
    try {
      const pathData = {
        title: newPath.title,
        description: newPath.description,
        course_ids: newPath.courses.map(c => typeof c === 'object' ? c.id : c)
      };
      const response = await coursesAPI.updateLearningPath(editingPath.id, pathData);
      setPaths(paths.map(path => path.id === editingPath.id ? response.data : path));
      setEditingPath(null);
      setNewPath({ title: '', description: '', courses: [] });
      setSelectedCourses([]);
      setCourseDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update learning path');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const saveSelectedCourses = () => {
    setNewPath(prev => ({ 
      ...prev, 
      courses: selectedCourses.map(id => {
        const fullCourse = courses.find(c => c.id === id);
        return fullCourse || id;
      })
    }));
    setCourseDialogOpen(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const reorderedPaths = Array.from(paths);
    const [removed] = reorderedPaths.splice(result.source.index, 1);
    reorderedPaths.splice(result.destination.index, 0, removed);
    
    setPaths(reorderedPaths);
  };

  return (
    <div className="LearningPaths">
      {error && (
        <div className="error-notification">
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <CheckCircle className="icon" />
          </button>
        </div>
      )}

      <div className="LearningPaths-Top">
        <div className="LearningPaths-Top-Grid">
          <div className="LearningPaths-Top-1">
            <h2>
              <School className="icon" /> Learning Paths
            </h2>
          </div>
          <div className="LearningPaths-Top-2">
            <span>Course ID: {courseId}</span>
          </div>
        </div>
      </div>

      <div className="LearningPaths-Create">
        <h3>{editingPath ? 'Edit Learning Path' : 'Create New Learning Path'}</h3>
        <div className="LearningPaths-Form">
          <div className="form-group">
            <label className="label">Path Title</label>
            <input
              type="text"
              className="input"
              value={newPath.title}
              onChange={(e) => setNewPath({...newPath, title: e.target.value})}
              placeholder="Enter path title"
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              value={newPath.description}
              onChange={(e) => setNewPath({...newPath, description: e.target.value})}
              placeholder="Enter description"
            />
          </div>
          <div className="form-group">
            <label className="label">Selected Courses: {newPath.courses.length}</label>
            <button
              className="action-btn"
              onClick={() => setCourseDialogOpen(true)}
            >
              <Add className="icon" /> Select Courses
            </button>
          </div>
          <div className="action-buttons">
            {editingPath ? (
              <>
                <button
                  className="action-btn"
                  onClick={() => {
                    setEditingPath(null);
                    setNewPath({ title: '', description: '', courses: [] });
                    setSelectedCourses([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="action-btn primary"
                  onClick={handleUpdatePath}
                  disabled={loading || !newPath.title.trim()}
                >
                  {loading ? <div className="spinner"></div> : 'Update'}
                </button>
              </>
            ) : (
              <button
                className="action-btn primary"
                onClick={handleAddPath}
                disabled={loading || !newPath.title.trim()}
              >
                <Add className="icon" /> {loading ? <div className="spinner"></div> : 'Add Path'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="LearningPaths-List">
        <h3>Existing Learning Paths</h3>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (paths || []).length === 0 ? (
          <div className="empty-state">
            <School className="empty-icon" />
            <span>No learning paths created yet</span>
            <p>Create learning paths to sequence courses for different learner journeys</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="learningPaths">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="path-list"
                >
                  {paths.map((path, index) => (
                    <Draggable key={path.id} draggableId={path.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="path-item"
                        >
                          <div className="path-header">
                            <div className="drag-handle" {...provided.dragHandleProps}>
                              <DragHandle className="icon" />
                            </div>
                            <div className="path-info">
                              <h4>{path.title}</h4>
                              {path.description && <p>{path.description}</p>}
                            </div>
                            <div className="path-actions">
                              <button
                                className="icon-btn"
                                onClick={() => handleEditPath(path)}
                              >
                                <Edit className="icon" />
                              </button>
                              <button
                                className="icon-btn delete"
                                onClick={() => handleDeletePath(path.id)}
                              >
                                <Delete className="icon" />
                              </button>
                            </div>
                          </div>
                          <div className="path-courses">
                            <span className="label">Courses in this path:</span>
                            {path.courses.length > 0 ? (
                              <div className="course-chips">
                                {path.courses.map(course => (
                                  <div key={course.id} className="chip">
                                    <span>{course.title}</span>
                                    <button
                                      className="chip-delete"
                                      onClick={() => {
                                        setNewPath(prev => ({
                                          ...prev,
                                          courses: prev.courses.filter(c => c.id !== course.id)
                                        }));
                                        setSelectedCourses(prev => prev.filter(id => id !== course.id));
                                      }}
                                    >
                                      <Delete className="icon" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="no-courses">No courses added to this path yet</p>
                            )}
                            <button
                              className="action-btn"
                              onClick={() => handleEditPath(path)}
                            >
                              <Add className="icon" /> Add Courses
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {courseDialogOpen && (
        <div className="CourseDialog">
          <div className="CourseDialog-Body" onClick={() => setCourseDialogOpen(false)}></div>
          <div className="CourseDialog-Main">
            <button
              className="CourseDialog-Close"
              onClick={() => setCourseDialogOpen(false)}
            >
              <CheckCircle className="icon" />
            </button>
            <div className="CourseDialog-Header">
              <h3>Select Courses</h3>
            </div>
            <div className="CourseDialog-Content">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : (
                <ul className="course-list">
                  {Array.isArray(courses) && courses.length > 0 ? (
                    courses.map(course => (
                      <li
                        key={course.id}
                        className="course-item"
                        onClick={() => toggleCourseSelection(course.id)}
                      >
                        <div className="course-info">
                          <span>{course.title}</span>
                          <p>{course.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="checkbox"
                        />
                      </li>
                    ))
                  ) : (
                    <li className="empty-state">
                      <span>No courses available</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div className="CourseDialog-Actions">
              <button
                className="action-btn"
                onClick={() => setCourseDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={saveSelectedCourses}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
