import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField,
  Grid, Avatar, FormControl, InputLabel, Select, MenuItem, Alert,
  Typography, Paper, Divider, Tooltip,
} from '@mui/material';
import { Upload } from '@mui/icons-material';
import { userAPI } from '../../../config';

const accent = '#1976d2';
const bgGradient = 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)';

const StudentProfile = ({ open, onClose, student, onSave }) => {

  //console.log(student)
  const [formData, setFormData] = useState({
    id: student?.id || '',
    full_name: student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim(),
    email: student?.email || '',
    phone: student?.phone || '',
    title: student?.title || '',
    language: student?.language || 'en',
  });

  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!formData.id) {
        throw new Error('Student ID is missing');
      }
      // Split full_name into first_name and last_name for backend
      const [first_name, ...rest] = formData.full_name.trim().split(' ');
      const last_name = rest.join(' ');
      await userAPI.updateUser(formData.id, {
        first_name,
        last_name,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        language: formData.language,
      });
      onSave();
      onClose();
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
      const uploadData = new FormData();
      uploadData.append('profile_picture', file);
      await userAPI.uploadProfilePicture(formData.id, uploadData);
      onSave();
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!student) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: bgGradient,
          boxShadow: 8,
          mx: 2, // margin for small screens
        }
      }}
    >
      <DialogTitle
        sx={{
          background: accent,
          color: '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          pb: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="bold" letterSpacing={1}>
          Student Profile
        </Typography>
        <Typography variant="subtitle2" color="#e3f2fd">
          Manage your personal information
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            borderRadius: 3,
            background: '#fff',
            mb: 2,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={student.avatar}
                sx={{
                  width: 110,
                  height: 110,
                  border: `4px solid ${accent}`,
                  boxShadow: 3,
                  mb: 1,
                }}
              />
              <Tooltip title="Upload a new profile picture" arrow>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<Upload />}
                  disabled={uploading}
                  sx={{
                    background: accent,
                    color: '#fff',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    fontSize: { xs: 12, sm: 14 },
                    '&:hover': { background: '#1565c0' }
                  }}
                >
                  {uploading ? 'Uploading...' : 'Change Photo'}
                  <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                </Button>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {formData.full_name}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
                {formData.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    name="id"
                    value={formData.id}
                    margin="dense"
                    disabled
                    InputProps={{
                      sx: { background: '#f3f6f9', borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    margin="dense"
                    disabled
                    InputProps={{
                      sx: { background: '#f3f6f9', borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    margin="dense"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    margin="dense"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    margin="dense"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Language</InputLabel>
                    <Select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      sx={{ borderRadius: 2, background: '#fafafa' }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="center" gap={2}>
          <Button onClick={onClose} variant="outlined" sx={{
            borderRadius: 2,
            fontWeight: 600,
            color: accent,
            borderColor: accent,
            px: 4,
            '&:hover': { background: '#e3f2fd' }
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={uploading}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              background: accent,
              color: '#fff',
              px: 4,
              boxShadow: 2,
              '&:hover': { background: '#1565c0' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfile;