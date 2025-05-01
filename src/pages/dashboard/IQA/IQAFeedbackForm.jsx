import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Send, AttachFile, Cancel } from '@mui/icons-material';

const IQAFeedbackForm = () => {
  const [feedbackType, setFeedbackType] = useState('assessor');
  const [feedbackText, setFeedbackText] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Dummy data
  const recipientOptions = [
    { id: 1, name: 'Sarah Smith', role: 'Assessor' },
    { id: 2, name: 'Michael Brown', role: 'Assessor' },
    { id: 3, name: 'John Doe', role: 'Learner' },
    { id: 4, name: 'Jane Smith', role: 'Learner' }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = () => {
    // Submit feedback logic
    console.log({
      feedbackType,
      feedbackText,
      attachments
    });
    // Reset form
    setFeedbackText('');
    setAttachments([]);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Provide IQA Feedback
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Feedback Type</InputLabel>
            <Select
              value={feedbackType}
              label="Feedback Type"
              onChange={(e) => setFeedbackType(e.target.value)}
            >
              <MenuItem value="assessor">To Assessor</MenuItem>
              <MenuItem value="learner">To Learner</MenuItem>
              <MenuItem value="general">General Note</MenuItem>
            </Select>
          </FormControl>
          
          {feedbackType !== 'general' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Recipient</InputLabel>
              <Select
                label="Recipient"
                defaultValue=""
              >
                {recipientOptions
                  .filter(person => 
                    (feedbackType === 'assessor' && person.role === 'Assessor') ||
                    (feedbackType === 'learner' && person.role === 'Learner')
                  )
                  .map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.name} ({person.role})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={`Enter your ${feedbackType} feedback here...`}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mr: 2 }}>
              Attachments:
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AttachFile />}
              component="label"
            >
              Add Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
          
          {attachments.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  variant="outlined"
                  onDelete={() => handleRemoveAttachment(index)}
                  deleteIcon={<Cancel />}
                />
              ))}
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={!feedbackText}
            >
              Send Feedback
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IQAFeedbackForm;