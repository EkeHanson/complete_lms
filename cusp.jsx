import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, List, ListItem, ListItemText,
  Checkbox, FormControlLabel, Divider, Chip, Box,
  useMediaQuery, useTheme, TextField, InputAdornment, Avatar, Badge
} from '@mui/material';
import { People, School, Search, Check, Group } from '@mui/icons-material';

const InstructorAssignmentDialog = ({
  open,
  onClose,
  instructors,
  modules,
  currentAssignments = [],
  onAssign
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [assignmentType, setAssignmentType] = useState('specific');
  const [moduleAssignments, setModuleAssignments] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstructors, setFilteredInstructors] = useState(instructors);
  const [activeStep, setActiveStep] = useState('select'); // 'select' or 'assign'

  // Initialize state from currentAssignments
  useEffect(() => {
    const initialModuleAssignments = {};
    const initialSelectedInstructors = new Set();
    
    currentAssignments.forEach(assignment => {
      if (assignment.assignedModules === 'all') {
        modules.forEach(module => {
          initialModuleAssignments[module.id] = [
            ...(initialModuleAssignments[module.id] || []),
            assignment.instructorId
          ];
        });
        initialSelectedInstructors.add(assignment.instructorId);
      } else {
        assignment.assignedModules.forEach(moduleId => {
          initialModuleAssignments[moduleId] = [
            ...(initialModuleAssignments[moduleId] || []),
            assignment.instructorId
          ];
          initialSelectedInstructors.add(assignment.instructorId);
        });
      }
    });
    
    setModuleAssignments(initialModuleAssignments);
    setSelectedInstructors(Array.from(initialSelectedInstructors));
  }, [currentAssignments, modules]);

  // Filter instructors based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(instructor => 
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.expertise.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  const toggleInstructorSelection = (instructorId) => {
    setSelectedInstructors(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const toggleModuleAssignment = (moduleId, instructorId) => {
    setModuleAssignments(prev => {
      const current = prev[moduleId] || [];
      return {
        ...prev,
        [moduleId]: current.includes(instructorId)
          ? current.filter(id => id !== instructorId)
          : [...current, instructorId]
      };
    });
  };

  const handleAssignmentTypeChange = (e) => {
    setAssignmentType(e.target.checked ? 'specific' : 'all');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = () => {
    // Group assignments by instructor
    const assignmentsByInstructor = {};
    
    if (assignmentType === 'all') {
      // Assign all selected instructors to all modules
      selectedInstructors.forEach(instructorId => {
        assignmentsByInstructor[instructorId] = {
          instructor: instructors.find(i => i.id === instructorId),
          assignedModules: 'all'
        };
      });
    } else {
      // Process specific module assignments
      Object.entries(moduleAssignments).forEach(([moduleId, instructorIds]) => {
        instructorIds.forEach(instructorId => {
          if (!assignmentsByInstructor[instructorId]) {
            assignmentsByInstructor[instructorId] = {
              instructor: instructors.find(i => i.id === instructorId),
              assignedModules: []
            };
          }
          assignmentsByInstructor[instructorId].assignedModules.push(moduleId);
        });
      });
    }
    
    // Convert to array and call onAssign
    onAssign(Object.values(assignmentsByInstructor));
    onClose();
  };

  const getInstructorInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        fontSize: isMobile ? '1.25rem' : '1.5rem',
        padding: isMobile ? 2 : 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Group fontSize="large" />
        {currentAssignments.length > 0 ? 'Edit Module Assignments' : 'Assign Instructors to Modules'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ 
        padding: isMobile ? 2 : 3,
        '& .MuiListItem-root': {
          paddingLeft: isMobile ? 1 : 2,
          paddingRight: isMobile ? 1 : 2
        }
      }}>
        {activeStep === 'select' ? (
          <>
            <Typography variant="subtitle1" sx={{ 
              mb: 2, 
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : 'inherit'
            }}>
              Select Instructors ({selectedInstructors.length} selected)
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search instructors by name, email or expertise..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            
            <List sx={{ 
              maxHeight: isMobile ? '40vh' : 300, 
              overflow: 'auto', 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              {filteredInstructors.length === 0 ? (
                <ListItem sx={{ 
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: isMobile ? '16px 12px' : '24px 16px'
                }}>
                  <People sx={{ 
                    fontSize: isMobile ? 32 : 40, 
                    color: 'text.disabled', 
                    mb: 1 
                  }} />
                  <Typography color="text.secondary" align="center">
                    No instructors found matching your search
                  </Typography>
                </ListItem>
              ) : (
                filteredInstructors.map((instructor) => (
                  <ListItem 
                    key={instructor.id}
                    button={true}
                    selected={selectedInstructors.includes(instructor.id)}
                    onClick={() => toggleInstructorSelection(instructor.id)}
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: isMobile ? '8px 12px' : '12px 16px',
                      backgroundColor: selectedInstructors.includes(instructor.id) 
                        ? theme.palette.action.selected 
                        : 'inherit',
                      borderLeft: selectedInstructors.includes(instructor.id)
                        ? `4px solid ${theme.palette.primary.main}`
                        : '4px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        selectedInstructors.includes(instructor.id) ? (
                          <Avatar sx={{
                            width: 20,
                            height: 20,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText
                          }}>
                            <Check fontSize="small" />
                          </Avatar>
                        ) : null
                      }
                    >
                      <Avatar sx={{ 
                        bgcolor: selectedInstructors.includes(instructor.id)
                          ? theme.palette.primary.light
                          : theme.palette.grey[300],
                        color: selectedInstructors.includes(instructor.id)
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.secondary,
                        mr: 2
                      }}>
                        {getInstructorInitials(instructor.name)}
                      </Avatar>
                    </Badge>
                    
                    <ListItemText
                      primary={
                        <Typography 
                          fontWeight={selectedInstructors.includes(instructor.id) ? 700 : 500}
                          color={selectedInstructors.includes(instructor.id) ? 'primary.main' : 'text.primary'}
                        >
                          {instructor.name}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="body2"
                          color={selectedInstructors.includes(instructor.id) ? 'primary.main' : 'text.secondary'}
                        >
                          {instructor.email}
                        </Typography>
                      }
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: 0.5,
                      justifyContent: 'flex-end',
                      flex: 1
                    }}>
                      {instructor.expertise.slice(0, 3).map(skill => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            maxWidth: 100,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: selectedInstructors.includes(instructor.id)
                              ? theme.palette.primary.lighter
                              : theme.palette.grey[200],
                            color: selectedInstructors.includes(instructor.id)
                              ? theme.palette.primary.dark
                              : 'inherit'
                          }} 
                        />
                      ))}
                      {instructor.expertise.length > 3 && (
                        <Chip 
                          label={`+${instructor.expertise.length - 3}`} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            backgroundColor: theme.palette.grey[200]
                          }} 
                        />
                      )}
                    </Box>
                  </ListItem>
                ))
              )}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep('assign')}
                disabled={selectedInstructors.length === 0}
              >
                Next: Assign to Modules
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : 'inherit'
              }}>
                Assign Selected Instructors to Modules
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setActiveStep('select')}
                startIcon={<People />}
              >
                Change Selection
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                overflowX: 'auto',
                py: 1,
                mb: 2
              }}>
                {selectedInstructors.map(instructorId => {
                  const instructor = instructors.find(i => i.id === instructorId);
                  return (
                    <Chip
                      key={instructorId}
                      avatar={
                        <Avatar sx={{ 
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem'
                        }}>
                          {getInstructorInitials(instructor.name)}
                        </Avatar>
                      }
                      label={instructor.name}
                      sx={{
                        flexShrink: 0,
                        backgroundColor: theme.palette.primary.lighter
                      }}
                    />
                  );
                })}
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={assignmentType === 'all'}
                    onChange={handleAssignmentTypeChange}
                    color="primary"
                  />
                }
                label="Assign all selected instructors to every module"
                sx={{ mb: 2 }}
              />
            </Box>

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
                    <School sx={{ 
                      fontSize: isMobile ? 32 : 40, 
                      color: 'text.disabled', 
                      mb: 1 
                    }} />
                    <Typography color="text.secondary" align="center">
                      No modules available for assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Create modules first to assign specific ones
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    maxHeight: isMobile ? '50vh' : 400, 
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    {modules.map((module) => (
                      <Box key={module.id} sx={{ mb: 2 }}>
                        <ListItem sx={{
                          backgroundColor: theme.palette.grey[100],
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}>
                          <ListItemText
                            primary={
                              <Typography fontWeight={600}>
                                {module.title || 'Untitled Module'}
                              </Typography>
                            }
                            secondary={module.description || 'No description'}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {moduleAssignments[module.id]?.length || 0} instructors assigned
                          </Typography>
                        </ListItem>
                        <Box sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          p: 2
                        }}>
                          {selectedInstructors.map(instructorId => {
                            const instructor = instructors.find(i => i.id === instructorId);
                            const isAssigned = moduleAssignments[module.id]?.includes(instructorId);
                            return (
                              <Chip
                                key={`${module.id}-${instructorId}`}
                                avatar={
                                  <Avatar sx={{ 
                                    bgcolor: isAssigned 
                                      ? theme.palette.primary.main 
                                      : theme.palette.grey[300],
                                    color: isAssigned 
                                      ? theme.palette.primary.contrastText 
                                      : theme.palette.text.secondary,
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}>
                                    {getInstructorInitials(instructor.name)}
                                  </Avatar>
                                }
                                label={instructor.name}
                                onClick={() => toggleModuleAssignment(module.id, instructorId)}
                                variant={isAssigned ? 'filled' : 'outlined'}
                                color={isAssigned ? 'primary' : 'default'}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: isAssigned
                                      ? theme.palette.primary.dark
                                      : theme.palette.action.hover
                                  }
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </List>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{
        padding: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column-reverse' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Button 
          onClick={onClose} 
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          Cancel
        </Button>
        {activeStep === 'assign' && (
          <Button 
            onClick={handleSubmit}
            disabled={assignmentType === 'specific' && 
              Object.values(moduleAssignments).flat().length === 0}
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            color="primary"
          >
            {currentAssignments.length > 0 ? 'Update Assignments' : 'Save Assignments'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InstructorAssignmentDialog;





    
