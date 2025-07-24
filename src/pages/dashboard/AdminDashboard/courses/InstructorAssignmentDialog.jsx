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
  courseId
}) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(
    currentAssignment?.instructorId || null
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


  console.log("currentAssignment")
  console.log(selectedInstructor)
  console.log("currentAssignment")

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
      setSelectedInstructor(null);
      setAssignmentType('all');
      setSelectedModules([]);
      setSearchTerm('');
      setError('');
    }
  }, [open]);

  const handleInstructorSelect = (instructorId) => {
    setSelectedInstructor(instructorId);
    setError('');
  };

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
  // Validation checks
  if (!selectedInstructor) {
    setError('Please select an instructor');
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
    const instructor = instructors.find((i) => i.id === selectedInstructor);
    if (!instructor) {
      setError('Selected instructor not found.');
      setLoading(false);
      return;
    }

    const data = {
      instructor_id: selectedInstructor,
      assignment_type: assignmentType,
      modules: assignmentType === 'specific' ? selectedModules : [], // Explicitly set modules
      is_active: true,
    };

    if (currentAssignment && currentAssignment.instructorId) {
      await coursesAPI.updateInstructorAssignment(courseId, selectedInstructor, data);
    } else {
      await coursesAPI.assignInstructor(courseId, data);
    }

    onAssign(instructor, data.modules);
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
  useEffect(() => {
    if (open) {
      console.log('DEBUG: currentAssignment', currentAssignment);
      console.log('DEBUG: selectedInstructor', selectedInstructor);
      console.log('DEBUG: instructors', instructors);
    }
  }, [open, instructors, selectedInstructor]);

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
            <ul className="instructor-list">
              {filteredInstructors.length === 0 ? (
                <li className="empty-state">
                  <People className="empty-icon" />
                  <span>No instructors found</span>
                </li>
              ) : (
                filteredInstructors.map((instructor) => (
                  <li
                    key={instructor.id}
                    className={`instructor-item ${
                      selectedInstructor === instructor.id ? 'selected' : ''
                    }`}
                    onClick={() => handleInstructorSelect(instructor.id)}
                  >
                    <div className="instructor-details">
                      <span className="instructor-name">{instructor.name}</span>
                      <span className="instructor-email">{instructor.email}</span>
                    </div>
                    <div className="expertise-tags">
                      {instructor.expertise.map((skill) => (
                        <span
                          key={skill}
                          className={`tag ${
                            selectedInstructor === instructor.id ? 'selected' : ''
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          {selectedInstructor && (
            <>
              <div className="selected-instructor">
                {selectedInstructor
                  ? (() => {
                      const instructor = instructors.find((i) => i.id === selectedInstructor);
                      if (instructor) {
                        return (
                          <span>
                            Selected: {instructor.name || instructor.email} ({instructor.email})
                          </span>
                        );
                      }
                      return <span>Selected: {selectedInstructor}</span>;
                    })()
                  : <span>No instructor assigned</span>
                }
              </div>

              <h4>Assignment Scope</h4>
              <div className="assignment-type">
                <span>
                  {assignmentType === 'all'
                    ? 'This instructor will be assigned to all modules in the course.'
                    : 'Select specific modules to assign this instructor to.'}
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
              !selectedInstructor ||
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