import React, { useState , useEffect} from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem , Snackbar, 
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CalendarToday as CalendarIcon, 
} from '@mui/icons-material';

import { initGoogleAPI, createCalendarEvent } from '../../../components/common/googleCalendar';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const ScheduleManagement = () => {

    useEffect(() => {
        initGoogleAPI();
      }, []);

        const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success'
        });

      
      const handleAddToCalendar = (event) => {
        createCalendarEvent(event);
        setSnackbar({
            open: true,
            message: 'Event added to calendar!',
            severity: 'success'
          });
      };
      
      const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
      };
    
    const [events, setEvents] = useState([
      { 
        id: 1, 
        title: 'Math Class', 
        type: 'class', 
        date: new Date('2023-06-15T09:00:00'), 
        endDate: new Date('2023-06-15T10:30:00'), 
        location: 'Room 101' 
      },
      { 
        id: 2, 
        title: 'Parent Meeting', 
        type: 'event', 
        date: new Date('2023-06-16T14:00:00'), 
        endDate: new Date('2023-06-16T15:00:00'), 
        location: 'Conference Room' 
      },
    ]);
    
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
  
    const handleOpenDialog = (event = null) => {
      setCurrentEvent(event || { 
        title: '', 
        type: 'class', 
        date: new Date(),
        endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        location: '' 
      });
      setOpenDialog(true);
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
    };
  
    const handleSaveEvent = () => {
      if (currentEvent.id) {
        // Update existing event
        setEvents(events.map(e => e.id === currentEvent.id ? currentEvent : e));
      } else {
        // Add new event
        setEvents([...events, { ...currentEvent, id: events.length + 1 }]);
      }
      handleCloseDialog();
    };
  
    const handleDeleteEvent = (id) => {
      setEvents(events.filter(e => e.id !== id));
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
                        onClick={handleAddToCalendar}
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
  
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{currentEvent?.id ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
            <DialogContent>
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
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSaveEvent} variant="contained">Save</Button>
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