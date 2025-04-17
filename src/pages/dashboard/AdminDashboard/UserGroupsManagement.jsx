import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Avatar, IconButton, Divider, useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const UserGroupsManagement = ({ users }) => {
  const theme = useTheme();
  const [groups, setGroups] = useState([
    { id: 1, name: 'Frontend Developers', description: 'Team working on frontend projects', members: [1, 3] },
    { id: 2, name: 'Data Science Team', description: 'Team focused on data analysis and ML', members: [2, 5] },
    { id: 3, name: 'New Learners', description: 'Recently onboarded users', members: [3, 4] }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleOpenDialog = (group = null) => {
    setCurrentGroup(group || { id: null, name: '', description: '', members: [] });
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGroup(null);
  };
  
  const handleSaveGroup = () => {
    if (currentGroup.id) {
      // Update existing group
      setGroups(groups.map(g => g.id === currentGroup.id ? currentGroup : g));
    } else {
      // Add new group
      setGroups([...groups, {
        ...currentGroup,
        id: Math.max(...groups.map(g => g.id), 0) + 1
      }]);
    }
    handleCloseDialog();
  };
  
  const handleDeleteGroup = (id) => {
    setGroups(groups.filter(g => g.id !== id));
  };
  
  const toggleMember = (userId) => {
    setCurrentGroup(prev => {
      const members = prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };
  
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getUserById = (id) => users.find(user => user.id === id);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          User Groups Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Group
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
        />
      </Paper>
      
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Group Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id} hover>
                <TableCell>
                  <Typography fontWeight="500">{group.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {group.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.members.slice(0, 3).map(userId => {
                      const user = getUserById(userId);
                      return user ? (
                        <Chip
                          key={userId}
                          avatar={<Avatar>{user.name.charAt(0)}</Avatar>}
                          label={user.name}
                          size="small"
                        />
                      ) : null;
                    })}
                    {group.members.length > 3 && (
                      <Chip
                        label={`+${group.members.length - 3} more`}
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(group)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteGroup(group.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Group Edit/Create Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {currentGroup?.id ? 'Edit Group' : 'Create New Group'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Group Name"
            value={currentGroup?.name || ''}
            onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={currentGroup?.description || ''}
            onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })}
            margin="normal"
          />
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Group Members
          </Typography>
          
          <Box sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {users.map(user => (
              <Box 
                key={user.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: currentGroup?.members.includes(user.id) 
                    ? theme.palette.action.selected 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={() => toggleMember(user.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                {currentGroup?.members.includes(user.id) && (
                  <CheckIcon color="primary" />
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveGroup} 
            variant="contained"
            disabled={!currentGroup?.name || !currentGroup?.description}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserGroupsManagement;