import React, { useState } from 'react';
import {
  Box,  TextField,  IconButton,  Divider,  useTheme,  Menu,  MenuItem,  Typography // <-- Add this line
} from '@mui/material';
import { Edit, Delete, MoreVert } from '@mui/icons-material';

const LessonItem = ({ lesson, onUpdate, onDelete }) => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editedLesson, setEditedLesson] = useState(lesson);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditing(true);
    handleMenuClose();
  };

  const handleSave = () => {
    onUpdate(lesson.id, editedLesson);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedLesson(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ mb: 1 }}>
      {editing ? (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            name="title"
            value={editedLesson.title}
            onChange={handleChange}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            name="duration"
            value={editedLesson.duration}
            onChange={handleChange}
            sx={{ width: '100px' }}
          />
          <IconButton onClick={handleSave} size="small" color="primary">
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 1
        }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {lesson.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lesson.duration}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuClick}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 1,
              sx: {
                minWidth: '120px'
              }
            }}
          >
            <MenuItem onClick={handleEdit}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => {
              onDelete(lesson.id);
              handleMenuClose();
            }}>
              <Delete fontSize="small" sx={{ mr: 1 }} color="error" />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      )}
      <Divider sx={{ my: 1 }} />
    </Box>
  );
};

export default LessonItem;