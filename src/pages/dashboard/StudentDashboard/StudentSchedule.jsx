import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { Event } from '@mui/icons-material';
import { format } from 'date-fns';

const StudentSchedule = ({ schedules }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Schedule</Typography>
      <List>
        {schedules.map(event => (
          <ListItem key={event.id} sx={{ mb: 1, borderBottom: '1px solid #eee' }}>
            <ListItemText
              primary={event.title}
              secondary={
                <>
                  <Typography variant="body2">{event.description}</Typography>
                  <Typography variant="caption">{format(new Date(event.date), 'MMMM dd, yyyy h:mm a')}</Typography>
                  <Typography variant="caption" display="block">Platform: {event.platform}</Typography>
                </>
              }
            />
            <Button variant="contained" href={event.link} target="_blank">
              Join
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StudentSchedule;