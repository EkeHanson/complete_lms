import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, List, ListItem, ListItemText,
  Checkbox, FormControlLabel, Divider, Chip, Box
} from '@mui/material';
import { People, School } from '@mui/icons-material';

const InstructorAssignmentDialog = ({
  open,
  onClose,
  instructors,
  modules,
  currentAssignment,
  onAssign
}) => {
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

  const instructor = instructors.find(i => i.id === selectedInstructor) || {};

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
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = () => {
    if (!selectedInstructor) return;

    const assignedModules = assignmentType === 'all' ? 'all' : selectedModules;
    onAssign(instructor, assignedModules);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {currentAssignment ? 'Edit Instructor Assignment' : 'Assign Instructor'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Select Instructor
        </Typography>
        
        <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
          {instructors.map((instructor) => (
            <ListItem 
              key={instructor.id}
              button
              selected={selectedInstructor === instructor.id}
              onClick={() => handleInstructorSelect(instructor.id)}
            >
              <ListItemText
                primary={instructor.name}
                secondary={
                  <>
                    {instructor.email}
                    <Box sx={{ mt: 0.5 }}>
                      {instructor.expertise.map(skill => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        {selectedInstructor && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Assignment Scope
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={assignmentType === 'specific'}
                  onChange={handleAssignmentTypeChange}
                />
              }
              label="Assign to specific modules only"
              sx={{ mb: 2 }}
            />

            {assignmentType === 'specific' && (
              <>
                {modules.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    py: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <School sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No modules available for assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create modules first to assign specific ones
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {modules.map((module) => (
                      <ListItem 
                        key={module.id}
                        button
                        onClick={() => toggleModuleSelection(module.id)}
                      >
                        <ListItemText
                          primary={module.title || 'Untitled Module'}
                          secondary={module.description || 'No description'}
                        />
                        <Checkbox
                          edge="end"
                          checked={selectedModules.includes(module.id)}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!selectedInstructor || (assignmentType === 'specific' && selectedModules.length === 0)}
          variant="contained"
        >
          {currentAssignment ? 'Update Assignment' : 'Assign Instructor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructorAssignmentDialog;