import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const StudentMessages = ({ messages }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Messages</Typography>
      <List>
        {messages.map(msg => (
          <ListItem
            key={msg.id}
            sx={{
              borderLeft: msg.important ? '3px solid red' : 'none',
              bgcolor: !msg.read ? '#e3f2fd' : 'inherit',
              mb: 1,
              borderRadius: 1
            }}
          >
            <ListItemIcon>
              <MessageIcon color={!msg.read ? 'primary' : 'action'} />
            </ListItemIcon>
            <ListItemText
              primary={msg.sender}
              secondary={
                <>
                  <Typography variant="body2">{msg.content}</Typography>
                  <Typography variant="caption">{format(new Date(msg.date), 'MMM dd, h:mm a')}</Typography>
                  {msg.course && <Chip label={msg.course} size="small" sx={{ ml: 1 }} />}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StudentMessages;