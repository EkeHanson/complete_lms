import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, TextField, Chip, useTheme, Grid, useMediaQuery
} from '@mui/material';
import {
  Add, Delete, DragHandle, School, Edit
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const LearningPaths = ({ courseId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paths, setPaths] = useState([
    { id: '1', name: 'Beginner Track', description: 'For students new to the subject', courses: ['101', '102'] },
    { id: '2', name: 'Advanced Track', description: 'For experienced learners', courses: ['201', '202'] }
  ]);
  const [newPath, setNewPath] = useState({ name: '', description: '' });
  const [editingPath, setEditingPath] = useState(null);

  const handleAddPath = () => {
    if (!newPath.name.trim()) return;
    
    const path = {
      id: Date.now().toString(),
      name: newPath.name,
      description: newPath.description,
      courses: []
    };
    
    setPaths([...paths, path]);
    setNewPath({ name: '', description: '' });
  };

  const handleDeletePath = (id) => {
    setPaths(paths.filter(path => path.id !== id));
  };

  const handleEditPath = (path) => {
    setEditingPath(path);
    setNewPath({ name: path.name, description: path.description });
  };

  const handleUpdatePath = () => {
    if (!editingPath || !newPath.name.trim()) return;
    
    setPaths(paths.map(path => 
      path.id === editingPath.id ? 
      { ...path, name: newPath.name, description: newPath.description } : 
      path
    ));
    
    setEditingPath(null);
    setNewPath({ name: '', description: '' });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const reorderedPaths = Array.from(paths);
    const [removed] = reorderedPaths.splice(result.source.index, 1);
    reorderedPaths.splice(result.destination.index, 0, removed);
    
    setPaths(reorderedPaths);
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
        mb: 3, 
        fontWeight: 600,
        wordBreak: 'break-word'
      }}>
        Learning Paths
      </Typography>
      
      {/* Create/Edit Path Form */}
      <Paper sx={{ 
        p: isMobile ? 2 : 3, 
        mb: 3,
        overflow: 'hidden'
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 600,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          {editingPath ? 'Edit Learning Path' : 'Create New Learning Path'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Path Name"
              value={newPath.name}
              onChange={(e) => setNewPath({...newPath, name: e.target.value})}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              value={newPath.description}
              onChange={(e) => setNewPath({...newPath, description: e.target.value})}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {editingPath ? (
            <>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setEditingPath(null);
                  setNewPath({ name: '', description: '' });
                }}
                size={isMobile ? "small" : "medium"}
                sx={{ minWidth: isMobile ? 'auto' : 100 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdatePath}
                size={isMobile ? "small" : "medium"}
                sx={{ minWidth: isMobile ? 'auto' : 120 }}
              >
                Update
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleAddPath}
              disabled={!newPath.name.trim()}
              startIcon={<Add />}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
            >
              Add Path
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Existing Paths List */}
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600,
        fontSize: isMobile ? '1.1rem' : '1.25rem'
      }}>
        Existing Learning Paths
      </Typography>
      
      {paths.length === 0 ? (
        <Paper sx={{ 
          p: 3, 
          textAlign: 'center',
          mb: 2
        }}>
          <School sx={{ 
            fontSize: 60, 
            color: 'text.disabled', 
            mb: 2 
          }} />
          <Typography variant="h6" color="text.secondary">
            No learning paths created yet
          </Typography>
          <Typography color="text.secondary">
            Create learning paths to sequence courses for different learner journeys
          </Typography>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="learningPaths">
            {(provided) => (
              <List 
                {...provided.droppableProps} 
                ref={provided.innerRef} 
                sx={{ 
                  p: 0,
                  '& .MuiListItem-root': {
                    p: 0
                  }
                }}
              >
                {paths.map((path, index) => (
                  <Draggable key={path.id} draggableId={path.id} index={index}>
                    {(provided) => (
                      <Paper 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ 
                          mb: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                          {/* Path Header */}
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            mb: 1
                          }}>
                            <Box 
                              {...provided.dragHandleProps} 
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                cursor: 'grab',
                                pt: isMobile ? 0.5 : 0
                              }}
                            >
                              <DragHandle fontSize={isMobile ? "small" : "medium"} />
                            </Box>
                            
                            <Box sx={{ 
                              flex: 1,
                              minWidth: 0, // Prevent overflow
                              mr: 1
                            }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 500,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {path.name}
                              </Typography>
                              {path.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {path.description}
                                </Typography>
                              )}
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex',
                              flexShrink: 0
                            }}>
                              <IconButton 
                                onClick={() => handleEditPath(path)} 
                                size="small"
                                sx={{ p: isMobile ? 0.5 : 1 }}
                              >
                                <Edit fontSize={isMobile ? "small" : "medium"} />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleDeletePath(path.id)} 
                                size="small"
                                sx={{ p: isMobile ? 0.5 : 1 }}
                              >
                                <Delete fontSize={isMobile ? "small" : "medium"} color="error" />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          {/* Courses Section */}
                          <Box sx={{ 
                            pl: isMobile ? 3 : 4,
                            pt: 1
                          }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Courses in this path:
                            </Typography>
                            
                            {path.courses.length > 0 ? (
                              <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 1,
                                mb: 1
                              }}>
                                {path.courses.map(courseId => (
                                  <Chip 
                                    key={courseId} 
                                    label={`Course ${courseId}`} 
                                    onDelete={() => {}}
                                    size={isMobile ? "small" : "medium"}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                No courses added to this path yet
                              </Typography>
                            )}
                            
                            <Button 
                              size={isMobile ? "small" : "medium"}
                              startIcon={<Add />}
                              sx={{ mt: 0.5 }}
                            >
                              Add Courses
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Box>
  );
};

export default LearningPaths;