import React, { useState, useEffect } from 'react';
import './InstructorAssignmentDialog.css';
import { People, School, Search } from '@mui/icons-material';
import { groupsAPI } from '../../../../config';

const InstructorAssignmentDialog = ({
  open,
  onClose,
  modules,
  currentAssignment,
  onAssign,
  isMobile,
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

  useEffect(() => {
    if (open) {
      setLoading(true);
      const tryGroupNames = ['trainers', 'instructors', 'teachers'];

      const fetchMembers = async (index = 0) => {
        if (index >= tryGroupNames.length) {
          setError('No instructor groups found (trainers, instructors, teachers)');
          setLoading(false);
          return;
        }
        try {
          const response = await groupsAPI.getGroupMembersByName(tryGroupNames[index]);
          const instructorList = response.data.map((membership) => ({
            id: membership.user.id,
            name: `${membership.user.first_name} ${membership.user.last_name}`,
            email: membership.user.email,
            expertise: membership.user.expertise || [],
          }));
          setInstructors(instructorList);
          setFilteredInstructors(instructorList);
          setLoading(false);
        } catch (err) {
          fetchMembers(index + 1);
        }
      };

      fetchMembers();
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

  const handleInstructorSelect = (instructorId) => {
    setSelectedInstructor(instructorId);
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

  const handleSubmit = () => {
    if (!selectedInstructor) return;

    const instructor = instructors.find((i) => i.id === selectedInstructor);
    const assignedModules = assignmentType === 'all' ? 'all' : selectedModules;
    onAssign(instructor, assignedModules);
    onClose();
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
            <span>&times;</span>
          </button>
        </div>

        <div className="InstructorAssignmentDialog-Body">
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError('')}>Dismiss</button>
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
                <span>
                  Selected: {instructors.find((i) => i.id === selectedInstructor)?.name} (
                  {instructors.find((i) => i.id === selectedInstructor)?.email})
                </span>
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
              !selectedInstructor ||
              (assignmentType === 'specific' && selectedModules.length === 0)
            }
          >
            {currentAssignment ? 'Update Assignment' : 'Assign Instructor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorAssignmentDialog;