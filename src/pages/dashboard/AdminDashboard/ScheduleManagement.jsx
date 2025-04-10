import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar,
  Chip, Autocomplete, Checkbox, FormControlLabel, FormGroup, Divider
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {   Add as AddIcon,  Edit as EditIcon,   Delete as DeleteIcon, 
  CalendarToday as CalendarIcon,  Person as PersonIcon,  Group as GroupIcon,  Email as EmailIcon
} from '@mui/icons-material';
import { initGoogleAPI, createCalendarEvent } from '../../../components/common/googleCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// Mock data for users and groups
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', type: 'instructor' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'learner' },
  { id: 3, name: 'Admin User', email: 'admin@example.com', type: 'admin' },
  { id: 4, name: 'Mike Johnson', email: 'mike@example.com', type: 'learner' },
  { id: 5, name: 'Sarah Williams', email: 'sarah@example.com', type: 'instructor' },
];

const userGroups = [
  { id: 'all_learners', name: 'All Learners', type: 'group' },
  { id: 'all_instructors', name: 'All Instructors', type: 'group' },
  { id: 'all_admins', name: 'All Admins', type: 'group' },
];

const ScheduleManagement = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'Math Class', 
      type: 'class', 
      date: new Date('2023-06-15T09:00:00'), 
      endDate: new Date('2023-06-15T10:30:00'), 
      location: 'https://meet.google.com/abc-defg-hij',
      invitees: [
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'learner' },
        { id: 'all_instructors', name: 'All Instructors', type: 'group' }
      ],
      additionalEmails: ['parent1@example.com']
    },
    { 
      id: 2, 
      title: 'Science Revision', 
      type: 'class', 
      date: new Date('2023-06-16T11:00:00'), 
      endDate: new Date('2023-06-16T12:30:00'), 
      location: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_Y2RmNz%40thread.v2/0?context=%7b%7d',
      invitees: [
        { id: 3, name: 'Tom Johnson', email: 'tom@example.com', type: 'learner' },
        { id: 4, name: 'Alice Green', email: 'alice@example.com', type: 'learner' }
      ],
      additionalEmails: ['parent2@example.com']
    },
    { 
      id: 3, 
      title: 'English Literature', 
      type: 'class', 
      date: new Date('2023-06-17T13:00:00'), 
      endDate: new Date('2023-06-17T14:30:00'), 
      location: 'https://meet.google.com/xyz-uvwq-lmn',
      invitees: [
        { id: 5, name: 'Emma Brown', email: 'emma@example.com', type: 'learner' },
        { id: 'all_learners', name: 'All Learners', type: 'group' }
      ],
      additionalEmails: []
    },
    { 
      id: 4, 
      title: 'History Group Discussion', 
      type: 'class', 
      date: new Date('2023-06-18T15:00:00'), 
      endDate: new Date('2023-06-18T16:00:00'), 
      location: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZXNkNz%40thread.v2/0?context=%7b%7d',
      invitees: [
        { id: 6, name: 'David Lee', email: 'david@example.com', type: 'learner' },
        { id: 7, name: 'Sarah White', email: 'sarah@example.com', type: 'learner' }
      ],
      additionalEmails: ['parent3@example.com', 'parent4@example.com']
    },
    { 
      id: 5, 
      title: 'Chemistry Practical Prep', 
      type: 'class', 
      date: new Date('2023-06-19T08:30:00'), 
      endDate: new Date('2023-06-19T10:00:00'), 
      location: 'https://meet.google.com/pqr-stuv-wxy',
      invitees: [
        { id: 8, name: 'Olivia King', email: 'olivia@example.com', type: 'learner' },
        { id: 9, name: 'Liam Scott', email: 'liam@example.com', type: 'learner' }
      ],
      additionalEmails: []
    }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    initGoogleAPI();
  }, []);

  const handleAddToCalendar = (event) => {
    // Include invitees in the calendar event
    const calendarEvent = {
      ...event,
      attendees: [
        ...event.invitees.map(invitee => ({ email: invitee.email })),
        ...event.additionalEmails.map(email => ({ email }))
      ]
    };
    createCalendarEvent(calendarEvent);
    setSnackbar({
      open: true,
      message: 'Event added to calendar with invitations!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (event = null) => {
    const defaultEvent = { 
      title: '', 
      type: 'class', 
      date: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      location: '',
      invitees: [],
      additionalEmails: []
    };

    if (event) {
      setCurrentEvent(event);
      setSelectedUsers(event.invitees.filter(i => i.type !== 'group'));
      setSelectedGroups(event.invitees.filter(i => i.type === 'group'));
      setAdditionalEmails(event.additionalEmails || []);
    } else {
      setCurrentEvent(defaultEvent);
      setSelectedUsers([]);
      setSelectedGroups([]);
      setAdditionalEmails([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveEvent = () => {
    const updatedEvent = {
      ...currentEvent,
      invitees: [...selectedUsers, ...selectedGroups],
      additionalEmails: additionalEmails
    };

    if (updatedEvent.id) {
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      setEvents([...events, { ...updatedEvent, id: events.length + 1 }]);
    }
    handleCloseDialog();
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleAddEmail = () => {
    if (emailInput && !additionalEmails.includes(emailInput)) {
      setAdditionalEmails([...additionalEmails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setAdditionalEmails(additionalEmails.filter(email => email !== emailToRemove));
  };

  const handleRemoveInvitee = (inviteeToRemove) => {
    if (inviteeToRemove.type === 'group') {
      setSelectedGroups(selectedGroups.filter(group => group.id !== inviteeToRemove.id));
    } else {
      setSelectedUsers(selectedUsers.filter(user => user.id !== inviteeToRemove.id));
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Schedule Management
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
        >
          Add New Schedule
        </Button>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Invitees</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>
                    {formatTime(event.date)} - {formatTime(event.endDate)}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {event.invitees.slice(0, 3).map((invitee, i) => (
                        <Chip 
                          key={i} 
                          label={invitee.name} 
                          size="small" 
                          icon={invitee.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                        />
                      ))}
                      {event.invitees.length > 3 && (
                        <Chip label={`+${event.invitees.length - 3}`} size="small" />
                      )}
                      {event.additionalEmails.length > 0 && (
                        <Chip 
                          label={`${event.additionalEmails.length} email(s)`} 
                          size="small" 
                          icon={<EmailIcon />}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(event)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteEvent(event.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<CalendarIcon />}
                      onClick={() => handleAddToCalendar(event)}
                      color="secondary"
                    >
                      Add to Calendar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{currentEvent?.id ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={currentEvent?.title || ''}
              onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Type"
              fullWidth
              value={currentEvent?.type || 'class'}
              onChange={(e) => setCurrentEvent({...currentEvent, type: e.target.value})}
              sx={{ mb: 2 }}
            >
              <MenuItem value="class">Class</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
            </TextField>
            <DateTimePicker
              label="Start Date & Time"
              value={currentEvent?.date || new Date()}
              onChange={(newValue) => setCurrentEvent({...currentEvent, date: newValue})}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
            <DateTimePicker
              label="End Date & Time"
              value={currentEvent?.endDate || new Date(new Date().getTime() + 60 * 60 * 1000)}
              onChange={(newValue) => setCurrentEvent({...currentEvent, endDate: newValue})}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              value={currentEvent?.location || ''}
              onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom>Invite Participants</Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Select Users</Typography>
              <Autocomplete
                multiple
                options={mockUsers}
                getOptionLabel={(option) => option.name}
                value={selectedUsers}
                onChange={(event, newValue) => setSelectedUsers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search users"
                    placeholder="Select individual users"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      icon={<PersonIcon />}
                      onDelete={() => handleRemoveInvitee(option)}
                    />
                  ))
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Select Groups</Typography>
              <FormGroup>
                {userGroups.map((group) => (
                  <FormControlLabel
                    key={group.id}
                    control={
                      <Checkbox
                        checked={selectedGroups.some(g => g.id === group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroups([...selectedGroups, group]);
                          } else {
                            setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1 }} />
                        {group.name}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Additional Email Addresses</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddEmail}
                  disabled={!emailInput}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {additionalEmails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleRemoveEmail(email)}
                    icon={<EmailIcon />}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveEvent} variant="contained">Save Schedule</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleManagement;