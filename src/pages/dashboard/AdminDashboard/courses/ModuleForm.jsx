import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Divider,
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  FormControl, InputLabel, Select, MenuItem, Chip, useTheme, Dialog, DialogTitle,
  Accordion, AccordionSummary, AccordionDetails, DialogContent, DialogActions,
  ListItemIcon // Add this import
} from '@mui/material';
import {
  ExpandMore, AddCircle, Delete, Edit,
  VideoLibrary, InsertDriveFile, Link as LinkIcon,
  CloudUpload // Add this import
} from '@mui/icons-material';

const lessonTypes = [
  { value: 'video', label: 'Video', icon: <VideoLibrary /> },
  { value: 'file', label: 'File', icon: <InsertDriveFile /> },
  { value: 'link', label: 'Link', icon: <LinkIcon /> }
];

const ModuleForm = ({ module, index, onChange, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video',
    url: '',
    file: null
  });
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const handleModuleChange = (field, value) => {
    onChange(module.id, { ...module, [field]: value });
  };

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setNewLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleLessonFileChange = (e) => {
    setNewLesson(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const addLesson = () => {
    if (!newLesson.title.trim()) return;

    const lesson = {
      id: Date.now(),
      title: newLesson.title.trim(),
      type: newLesson.type,
      duration: '10 min', // Default duration, could be made editable
      ...(newLesson.type === 'link' ? { url: newLesson.url } : {}),
      ...(newLesson.type !== 'link' ? { file: newLesson.file } : {})
    };

    onChange(module.id, {
      ...module,
      lessons: [...module.lessons, lesson]
    });

    setNewLesson({
      title: '',
      type: 'video',
      url: '',
      file: null
    });
  };

  const editLesson = (lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      type: lesson.type,
      url: lesson.url || '',
      file: lesson.file || null
    });
    setLessonDialogOpen(true);
  };

  const updateLesson = () => {
    if (!editingLesson || !newLesson.title.trim()) return;

    const updatedLessons = module.lessons.map(lesson => 
      lesson.id === editingLesson.id ? {
        ...lesson,
        title: newLesson.title.trim(),
        type: newLesson.type,
        ...(newLesson.type === 'link' ? { url: newLesson.url } : {}),
        ...(newLesson.type !== 'link' ? { file: newLesson.file } : {})
      } : lesson
    );

    onChange(module.id, {
      ...module,
      lessons: updatedLessons
    });

    setLessonDialogOpen(false);
    setEditingLesson(null);
    setNewLesson({
      title: '',
      type: 'video',
      url: '',
      file: null
    });
  };

  const deleteLesson = (lessonId) => {
    onChange(module.id, {
      ...module,
      lessons: module.lessons.filter(l => l.id !== lessonId)
    });
  };

  const getLessonIcon = (type) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.icon : <InsertDriveFile />;
  };

  return (
    <Accordion 
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
          Module {index + 1}: {module.title || 'Untitled Module'}
        </Typography>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(module.id);
          }}
          sx={{ mr: 1 }}
        >
          <Delete />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          fullWidth
          label="Module Title"
          value={module.title}
          onChange={(e) => handleModuleChange('title', e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          value={module.description}
          onChange={(e) => handleModuleChange('description', e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Lessons
        </Typography>

        {module.lessons.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No lessons added to this module yet
          </Typography>
        )}

        <List dense>
          {module.lessons.map((lesson) => (
            <ListItem key={lesson.id} divider>
              <ListItemIcon>
                {getLessonIcon(lesson.type)}
              </ListItemIcon>
              <ListItemText 
                primary={lesson.title}
                secondary={
                  lesson.type === 'link' ? lesson.url : 
                  lesson.file?.name || lesson.file || 'No file selected'
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => editLesson(lesson)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => deleteLesson(lesson.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddCircle />}
            onClick={() => setLessonDialogOpen(true)}
          >
            Add Lesson
          </Button>
        </Box>
      </AccordionDetails>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)}>
        <DialogTitle>
          {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lesson Title"
            fullWidth
            name="title"
            value={newLesson.title}
            onChange={handleLessonChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Lesson Type</InputLabel>
            <Select
              name="type"
              value={newLesson.type}
              onChange={handleLessonChange}
              label="Lesson Type"
            >
              {lessonTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {newLesson.type === 'link' && (
            <TextField
              margin="dense"
              label="URL"
              fullWidth
              name="url"
              value={newLesson.url}
              onChange={handleLessonChange}
            />
          )}

          {(newLesson.type === 'video' || newLesson.type === 'file') && (
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mt: 1 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleLessonFileChange}
                accept={newLesson.type === 'video' ? 'video/*' : '*'}
              />
            </Button>
          )}

          {newLesson.file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {newLesson.file.name || newLesson.file}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={editingLesson ? updateLesson : addLesson}
            disabled={!newLesson.title.trim()}
            variant="contained"
          >
            {editingLesson ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

export default ModuleForm;