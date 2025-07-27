import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, Grid, Avatar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Upload } from '@mui/icons-material';
import { userAPI } from '../../../config';  // Import userAPI for updating profile

const StudentProfile = ({ open, onClose, student, onSave }) => {
  // Provide default values to prevent undefined errors
  const [formData, setFormData] = useState({
    name: student?.name || '',
    bio: student?.bio || '',
    interests: student?.interests || [],
    learningTrack: student?.learningTrack || 'Intermediate',
    language: student?.language || 'en',
  });

  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!student?.id) {
        throw new Error('Student ID is missing');
      }
      // Update user profile using userAPI
      await userAPI.updateUser(student.id, {
        first_name: formData.name.split(' ')[0], // Assuming name is "First Last"
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
        bio: formData.bio,
        interests: formData.interests,
        learning_track: formData.learningTrack,
        language: formData.language,
      });
      onSave(); // Notify parent component of successful save
      onClose(); // Close the dialog
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    }
  };


  const handlePhotoChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('profile_picture', file);
    await userAPI.uploadProfilePicture(student.id, formData);
    onSave();
  } catch (err) {
    setError('Failed to upload photo. Please try again.');
    console.error('Photo upload error:', err);
  } finally {
    setUploading(false);
  }
};

  // const handlePhotoChange = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   setUploading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('profile_picture', file);
  //     await userAPI.updateUser(student.id, formData); // Assumes userAPI supports file uploads
  //     onSave(); // Notify parent of update
  //   } catch (err) {
  //     setError('Failed to upload photo. Please try again.');
  //     console.error('Photo upload error:', err);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // If student is undefined, don't render the dialog content
  if (!student) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Profile Settings</DialogTitle>
      <DialogContent>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar src={student.avatar} sx={{ width: 120, height: 120, mb: 2 }} />
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={student.email || ''}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Department"
              value={student.department || ''}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Learning Track</InputLabel>
              <Select
                name="learningTrack"
                value={formData.learningTrack}
                onChange={handleChange}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Language</InputLabel>
              <Select
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={uploading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentProfile;