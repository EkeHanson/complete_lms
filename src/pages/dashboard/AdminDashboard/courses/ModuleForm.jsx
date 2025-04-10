import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import { Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import LessonItem from './LessonItem';

const ModuleForm = ({ module, index, onChange, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [newLesson, setNewLesson] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...module, [name]: value });
  };

  const addLesson = () => {
    if (!newLesson.trim()) return;
    const newLessons = [
      ...module.lessons,
      {
        id: Date.now(),
        title: newLesson,
        duration: '30 min'
      }
    ];
    onChange({ ...module, lessons: newLessons });
    setNewLesson('');
  };

  const updateLesson = (id, updatedLesson) => {
    const updatedLessons = module.lessons.map(lesson =>
      lesson.id === id ? updatedLesson : lesson
    );
    onChange({ ...module, lessons: updatedLessons });
  };

  const deleteLesson = (id) => {
    const updatedLessons = module.lessons.filter(lesson => lesson.id !== id);
    onChange({ ...module, lessons: updatedLessons });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Module {index + 1}
        </Typography>
        <Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <IconButton onClick={onDelete} size="small" color="error">
            <Delete />
          </IconButton>
        </Box>
      </Box>

      {expanded && (
        <>
          <TextField
            fullWidth
            label="Module Title"
            name="title"
            value={module.title}
            onChange={handleChange}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={module.description}
            onChange={handleChange}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Lessons
          </Typography>

          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              onUpdate={updateLesson}
              onDelete={deleteLesson}
            />
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="New lesson title"
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLesson()}
            />
            <Button variant="outlined" onClick={addLesson}>
              Add
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ModuleForm;