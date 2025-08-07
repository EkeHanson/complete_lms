import React, { useState, useEffect } from 'react';
import './InstructorAssignmentDialog.css';
import { People, School, Search } from '@mui/icons-material';
import { groupsAPI, coursesAPI } from '../../../../config';

const InstructorAssignmentDialog = ({
  open,
  onClose,
  modules = [],
  currentAssignment,
  onAssign,
  isMobile,
  courseId,
  course // <-- Add course prop
}) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState(
    currentAssignment?.instructorIds || []
  );
  
  const [assignmentType, setAssignmentType] = useState(
    currentAssignment?.assignedModules === 'all' ? 'all' : 'specific'
  );
  const [selectedModules, setSelectedModules] = useState(
    currentAssignment?.assignedModules !== 'all'
      ? currentAssignment?.assignedModules || []
      : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');




  useEffect(() => {
  if (open) {
    const fetchInstructors = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await groupsAPI.getGroupMembersByName('All Instructors');
        const memberships = response.data || [];
        const instructorsData = memberships.map(membership => ({
          id: membership.user.id,
          name: `${membership.user.first_name} ${membership.user.last_name}`.trim() || membership.user.email,
          email: membership.user.email,
          expertise: membership.user.expertise || []
        }));
        const uniqueInstructors = Array.from(
          new Map(instructorsData.map(instructor => [instructor.id, instructor])).values()
        );
        console.log('Fetched Instructors:', uniqueInstructors);
        setInstructors(uniqueInstructors);
        setFilteredInstructors(uniqueInstructors);
        if (uniqueInstructors.length === 0) {
          setError('No instructors found in the "All Instructors" group.');
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        if (error.response?.status === 404) {
          setError('Instructors group not found. Please ensure the group exists.');
        } else {
          setError('Failed to load instructors. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }
}, [open]);


  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.expertise.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSelectedInstructors([]);
      setAssignmentType('all');
      setSelectedModules([]);
      setSearchTerm('');
      setError('');
    }
  }, [open]);

 
  
  const handleInstructorSelect = (instructorId) => {
  setSelectedInstructors((prev) =>
    prev.includes(instructorId)
      ? prev.filter((id) => id !== instructorId)
      : [...prev, instructorId]
  );
  setError('');
};


  //   setSelectedInstructor(instructorId);
  //   setError('');
  // };

  const handleAssignmentTypeChange = (e) => {
    setAssignmentType(e.target.checked ? 'specific' : 'all');
    if (!e.target.checked) {
      setSelectedModules([]);
    }
  };

  const toggleModuleSelection = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

const handleSubmit = async () => {
  if (selectedInstructors.length === 0) {
    setError('Please select at least one instructor');
    return;
  }
  if (assignmentType === 'specific' && selectedModules.length === 0) {
    setError('Please select at least one module for specific assignment');
    return;
  }
  if (!courseId) {
    setError('Course ID is missing. Please save the course first.');
    return;
  }

  setLoading(true);
  setError('');
  try {
    for (const instructorId of selectedInstructors) {
      const data = {
        instructor_id: instructorId,
        assignment_type: assignmentType,
        modules: assignmentType === 'specific' ? selectedModules : [],
        is_active: true,
      };
      await coursesAPI.assignInstructor(courseId, data);
    }
    onAssign(selectedInstructors, assignmentType === 'specific' ? selectedModules : []);
    onClose();
  } catch (error) {
    console.error('Error saving instructor assignment:', error);
    let errorMessage = 'Failed to save instructor assignment';
    if (error.response?.data) {
      if (Array.isArray(error.response.data)) {
        errorMessage = error.response.data[0];
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
    }
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

const handleRemoveInstructor = async (instructorId) => {
  if (!window.confirm('Remove this instructor from the course?')) return;
  try {
    await coursesAPI.deleteInstructorAssignment(course.id, instructorId);
    // Refresh course data or remove from local state
  } catch (e) {
    alert('Failed to remove instructor');
  }
};


  return (
    <div className={`InstructorAssignmentDialog ${open ? 'open' : ''}`}>
      <div className="InstructorAssignmentDialog-Overlay" onClick={onClose}></div>
      <div className="InstructorAssignmentDialog-Content">
        <div className="InstructorAssignmentDialog-Header">
          <h3>
            <People className="icon" />
            {currentAssignment ? 'Edit Instructor Assignment' : 'Assign Instructor'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="InstructorAssignmentDialog-Body">
          {error && (
            <div className="error-modal">
              <div className="error-modal-overlay" onClick={() => setError('')}></div>
              <div className="error-message">
                <span>{error}</span>
                <button onClick={() => setError('')}>Dismiss</button>
              </div>
            </div>
          )}

          {/* Show currently assigned instructors */}
          {Array.isArray(course?.course_instructors) && course.course_instructors.length > 0 && (
            <div className="assigned-instructors-list">
              <h4>Currently Assigned Instructors</h4>
              <ul>
                {course.course_instructors.map(ci => (
                  <li key={ci.id} className="assigned-instructor-item">
                    <span className="avatar small">{ci.first_name?.charAt(0) || ci.email?.charAt(0) || "?"}</span>
                    <span className="instructor-name">{ci.first_name} {ci.last_name}</span>
                    <span className="instructor-email">{ci.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h4>Select Instructor</h4>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search instructors by name, email or expertise..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <span>Loading...</span>
            </div>
          ) : (
            /* Single instructor list, assigned at top and marked */
            <ul className="instructor-list">
              {(() => {
                const assignedIds = Array.isArray(course?.course_instructors)
                  ? course.course_instructors.map(ci => ci.id)
                  : [];
                const sorted = [
                  ...filteredInstructors.filter(i => assignedIds.includes(i.id)),
                  ...filteredInstructors.filter(i => !assignedIds.includes(i.id)),
                ];
                if (sorted.length === 0) {
                  return (
                    <li className="empty-state">
                      <People className="empty-icon" />
                      <span>No instructors found</span>
                    </li>
                  );
                }
                return sorted.map((instructor) => {
                  const isAssigned = assignedIds.includes(instructor.id);
                  return (
                    <li
                      key={instructor.id}
                      className={`instructor-item compact ${selectedInstructors.includes(instructor.id) ? 'selected' : ''} ${isAssigned ? 'assigned' : ''}`}
                      onClick={() => handleInstructorSelect(instructor.id)}
                    >
                      <div className="instructor-main-row">
                        <span className="instructor-name">{instructor.name}</span>
                        <span className="instructor-email">{instructor.email}</span>
                        {isAssigned && (
                          <span className="assigned-label" title="Already assigned">
                            ✔
                          </span>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedInstructors.includes(instructor.id)}
                          readOnly
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                      {instructor.expertise.length > 0 && (
                        <div className="expertise-tags compact">
                          {instructor.expertise.map((skill) => (
                            <span
                              key={skill}
                              className={`tag ${selectedInstructors.includes(instructor.id) ? 'selected' : ''}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                });
              })()}
            </ul>
          )}

          {selectedInstructors.length > 0 && (
            <>
              <div className="selected-instructor">
                {selectedInstructors.length} instructor
                {selectedInstructors.length > 1 ? 's' : ''} selected
              </div>

              <h4>Assignment Scope</h4>
              <div className="assignment-type">
                <span>
                  {assignmentType === 'all'
                    ? 'These instructors will be assigned to all modules in the course.'
                    : 'Select specific modules to assign these instructors to.'}
                </span>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={assignmentType === 'specific'}
                    onChange={handleAssignmentTypeChange}
                    className="checkbox"
                  />
                  Assign to specific modules only
                </label>
              </div>

              {assignmentType === 'specific' && (
                <>
                  {modules.length === 0 ? (
                    <div className="empty-state">
                      <School className="empty-icon" />
                      <span>No modules available for assignment</span>
                      <span>Create modules first to assign specific ones</span>
                    </div>
                  ) : (
                    <>
                      <span className="module-count">
                        Selected: {selectedModules.length} of {modules.length} modules
                      </span>
                      <ul className="module-list">
                        {modules.map((module) => (
                          <li
                            key={module.id}
                            className={`module-item ${
                              selectedModules.includes(module.id) ? 'selected' : ''
                            }`}
                            onClick={() => toggleModuleSelection(module.id)}
                          >
                            <div className="module-details">
                              <span className="module-title">
                                {module.title || 'Untitled Module'}
                              </span>
                              <span className="module-description">
                                {module.description || 'No description'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedModules.includes(module.id)}
                              onChange={() => toggleModuleSelection(module.id)}
                              className="checkbox"
                            />
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>

        <div className="InstructorAssignmentDialog-Actions">
          <button className="action-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="action-btn primary"
            onClick={handleSubmit}
            disabled={
              loading ||
              selectedInstructors.length === 0 ||
              (assignmentType === 'specific' && selectedModules.length === 0)
            }
          >
            {loading ? <span className="loading-spinner" /> : (currentAssignment ? 'Update Assignment' : 'Assign Instructor')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorAssignmentDialog;