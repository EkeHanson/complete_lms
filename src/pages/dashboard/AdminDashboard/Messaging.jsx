// import React, { useState, useEffect } from 'react';
// import { 
//   Box, Typography, Button, Paper, Table, TableBody, TableCell, 
//   TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
//   DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
//   Tooltip, Link, Chip, Autocomplete, Checkbox, FormControlLabel, 
//   FormGroup, Divider, useMediaQuery, IconButton, Stack, 
//   Collapse, Card, CardContent, CardActions, List, ListItem, 
//   ListItemText, ListItemAvatar, Avatar, TablePagination, Grid
// } from '@mui/material';
// import MuiAlert from '@mui/material/Alert';
// import {
//   Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
//   Send as SendIcon, Email as EmailIcon, Person as PersonIcon,
//   Group as GroupIcon, MoreVert as MoreIcon, ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon, MarkEmailRead as ReadIcon,
//   MarkEmailUnread as UnreadIcon, Reply as ReplyIcon,
//   Forward as ForwardIcon, Attachment as AttachmentIcon,
//   Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon
// } from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// // Mock data for users and groups
// const mockUsers = [
//   { id: 1, name: 'John Doe', email: 'john@example.com', type: 'instructor' },
//   { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'learner' },
//   { id: 3, name: 'Admin User', email: 'admin@example.com', type: 'admin' },
//   { id: 4, name: 'Mike Johnson', email: 'mike@example.com', type: 'learner' },
//   { id: 5, name: 'Sarah Williams', email: 'sarah@example.com', type: 'instructor' },
// ];

// const userGroups = [
//   { id: 'all_learners', name: 'All Learners', type: 'group' },
//   { id: 'all_instructors', name: 'All Instructors', type: 'group' },
//   { id: 'all_admins', name: 'All Admins', type: 'group' },
// ];

// const messageTypes = [
//   { value: 'announcement', label: 'Announcement' },
//   { value: 'notification', label: 'Notification' },
//   { value: 'reminder', label: 'Reminder' },
//   { value: 'personal', label: 'Personal Message' },
// ];

// const Messaging = () => {
//   const isMobile = useMediaQuery('(max-width:600px)');
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Original messages data
//   const originalMessages = [
//     { 
//       id: 1, 
//       subject: 'System Maintenance Tonight', 
//       type: 'announcement', 
//       content: 'We will be performing system maintenance tonight from 10 PM to 2 AM. The platform will be unavailable during this time.',
//       date: new Date('2023-06-14T09:00:00'),
//       sender: { id: 3, name: 'Admin User', email: 'admin@example.com' },
//       recipients: [
//         { id: 'all_learners', name: 'All Learners', type: 'group' },
//         { id: 'all_instructors', name: 'All Instructors', type: 'group' }
//       ],
//       status: 'sent',
//       read: true,
//       attachments: []
//     },
//     { 
//       id: 2, 
//       subject: 'Your Assignment is Due Soon', 
//       type: 'reminder', 
//       content: 'Just a friendly reminder that your math assignment is due in 2 days. Please submit it on time.',
//       date: new Date('2023-06-15T11:00:00'),
//       sender: { id: 1, name: 'John Doe', email: 'john@example.com' },
//       recipients: [
//         { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'learner' },
//         { id: 4, name: 'Mike Johnson', email: 'mike@example.com', type: 'learner' }
//       ],
//       status: 'sent',
//       read: false,
//       attachments: [
//         { name: 'Assignment_Details.pdf', url: '/files/assignment123.pdf' }
//       ]
//     },
//     { 
//       id: 3, 
//       subject: 'Welcome to the New Semester', 
//       type: 'notification', 
//       content: 'Welcome everyone to the new semester! We have exciting courses lined up for you. Check your dashboard for updates.',
//       date: new Date('2023-06-16T08:30:00'),
//       sender: { id: 5, name: 'Sarah Williams', email: 'sarah@example.com' },
//       recipients: [
//         { id: 'all_learners', name: 'All Learners', type: 'group' }
//       ],
//       status: 'sent',
//       read: true,
//       attachments: []
//     },
//     { 
//       id: 4, 
//       subject: 'Personal Feedback', 
//       type: 'personal', 
//       content: 'Hi Jane, I wanted to personally commend you on your excellent performance in the last test. Keep up the good work!',
//       date: new Date('2023-06-17T14:15:00'),
//       sender: { id: 1, name: 'John Doe', email: 'john@example.com' },
//       recipients: [
//         { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'learner' }
//       ],
//       status: 'sent',
//       read: false,
//       attachments: []
//     },
//     { 
//       id: 5, 
//       subject: 'Course Materials Updated', 
//       type: 'notification', 
//       content: 'The course materials for Advanced Mathematics have been updated. Please download the new version from the course page.',
//       date: new Date('2023-06-18T10:45:00'),
//       sender: { id: 3, name: 'Admin User', email: 'admin@example.com' },
//       recipients: [
//         { id: 'all_learners', name: 'All Learners', type: 'group' },
//         { id: 'all_instructors', name: 'All Instructors', type: 'group' }
//       ],
//       status: 'sent',
//       read: true,
//       attachments: [
//         { name: 'Updated_Syllabus.docx', url: '/files/syllabus_v2.docx' }
//       ]
//     },
//     { 
//       id: 6, 
//       subject: 'Important Security Update', 
//       type: 'announcement', 
//       content: 'We have implemented new security measures. Please change your password if you haven\'t done so in the last 90 days.',
//       date: new Date('2023-06-19T13:20:00'),
//       sender: { id: 3, name: 'Admin User', email: 'admin@example.com' },
//       recipients: [
//         { id: 'all_learners', name: 'All Learners', type: 'group' },
//         { id: 'all_instructors', name: 'All Instructors', type: 'group' },
//         { id: 'all_admins', name: 'All Admins', type: 'group' }
//       ],
//       status: 'sent',
//       read: false,
//       attachments: []
//     },
//     { 
//       id: 7, 
//       subject: 'Weekly Meeting Reminder', 
//       type: 'reminder', 
//       content: 'This is a reminder about our weekly team meeting tomorrow at 10 AM in the main conference room.',
//       date: new Date('2023-06-20T09:15:00'),
//       sender: { id: 5, name: 'Sarah Williams', email: 'sarah@example.com' },
//       recipients: [
//         { id: 1, name: 'John Doe', email: 'john@example.com', type: 'instructor' },
//         { id: 3, name: 'Admin User', email: 'admin@example.com', type: 'admin' }
//       ],
//       status: 'sent',
//       read: true,
//       attachments: [
//         { name: 'Meeting_Agenda.pdf', url: '/files/agenda_0621.pdf' }
//       ]
//     }
//   ];

//   const [messages, setMessages] = useState(originalMessages);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [currentMessage, setCurrentMessage] = useState(null);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [selectedGroups, setSelectedGroups] = useState([]);
//   const [expandedMessage, setExpandedMessage] = useState(null);
//   const [replyMode, setReplyMode] = useState(false);
//   const [forwardMode, setForwardMode] = useState(false);

//   // Pagination state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   // Filters state
//   const [filters, setFilters] = useState({
//     search: '',
//     type: 'all',
//     status: 'all',
//     dateFrom: null,
//     dateTo: null,
//     readStatus: 'all'
//   });

//   // Handle pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Handle filter changes
//   const handleFilterChange = (name, value) => {
//     setFilters({
//       ...filters,
//       [name]: value
//     });
//     setPage(0); // Reset to first page when filters change
//   };

//   // Filter messages based on current filters
//   const filteredMessages = messages.filter(message => {
//     const matchesSearch = filters.search === '' || 
//       message.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
//       message.content.toLowerCase().includes(filters.search.toLowerCase()) ||
//       message.sender.name.toLowerCase().includes(filters.search.toLowerCase());
    
//     const matchesType = filters.type === 'all' || message.type === filters.type;
//     const matchesStatus = filters.status === 'all' || message.status === filters.status;
//     const matchesReadStatus = filters.readStatus === 'all' || 
//       (filters.readStatus === 'read' && message.read) || 
//       (filters.readStatus === 'unread' && !message.read);
    
//     const matchesDateFrom = !filters.dateFrom || new Date(message.date) >= new Date(filters.dateFrom);
//     const matchesDateTo = !filters.dateTo || new Date(message.date) <= new Date(filters.dateTo);
    
//     return matchesSearch && matchesType && matchesStatus && matchesReadStatus && matchesDateFrom && matchesDateTo;
//   });

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString([], { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleOpenDialog = (message = null, reply = false, forward = false) => {
//     const defaultMessage = { 
//       subject: '', 
//       type: 'announcement', 
//       content: '',
//       date: new Date(),
//       sender: { id: 3, name: 'Admin User', email: 'admin@example.com' }, // Default to admin
//       recipients: [],
//       status: 'draft',
//       read: false,
//       attachments: []
//     };

//     if (message) {
//       if (reply) {
//         setCurrentMessage({
//           ...defaultMessage,
//           subject: `Re: ${message.subject}`,
//           recipients: [message.sender],
//           content: `\n\n---------- Original Message ----------\nFrom: ${message.sender.name}\nDate: ${formatDate(message.date)}\nSubject: ${message.subject}\n\n${message.content}`
//         });
//         setReplyMode(true);
//       } else if (forward) {
//         setCurrentMessage({
//           ...defaultMessage,
//           subject: `Fwd: ${message.subject}`,
//           content: `\n\n---------- Forwarded Message ----------\nFrom: ${message.sender.name}\nDate: ${formatDate(message.date)}\nSubject: ${message.subject}\n\n${message.content}`
//         });
//         setForwardMode(true);
//       } else {
//         setCurrentMessage(message);
//         setSelectedUsers(message.recipients.filter(r => r.type !== 'group'));
//         setSelectedGroups(message.recipients.filter(r => r.type === 'group'));
//       }
//     } else {
//       setCurrentMessage(defaultMessage);
//       setSelectedUsers([]);
//       setSelectedGroups([]);
//     }
    
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setReplyMode(false);
//     setForwardMode(false);
//   };

//   const handleSendMessage = () => {
//     const updatedMessage = {
//       ...currentMessage,
//       recipients: [...selectedUsers, ...selectedGroups],
//       date: new Date(),
//       status: 'sent'
//     };

//     if (updatedMessage.id) {
//       setMessages(messages.map(m => m.id === updatedMessage.id ? updatedMessage : m));
//     } else {
//       setMessages([...messages, { ...updatedMessage, id: messages.length + 1 }]);
//     }
    
//     setSnackbar({
//       open: true,
//       message: replyMode ? 'Reply sent successfully!' : forwardMode ? 'Message forwarded successfully!' : 'Message sent successfully!',
//       severity: 'success'
//     });
    
//     handleCloseDialog();
//   };

//   const handleSaveDraft = () => {
//     const updatedMessage = {
//       ...currentMessage,
//       recipients: [...selectedUsers, ...selectedGroups],
//       status: 'draft'
//     };

//     if (updatedMessage.id) {
//       setMessages(messages.map(m => m.id === updatedMessage.id ? updatedMessage : m));
//     } else {
//       setMessages([...messages, { ...updatedMessage, id: messages.length + 1 }]);
//     }
    
//     setSnackbar({
//       open: true,
//       message: 'Draft saved successfully!',
//       severity: 'success'
//     });
    
//     handleCloseDialog();
//   };

//   const handleDeleteMessage = (id) => {
//     setMessages(messages.filter(m => m.id !== id));
//     setSnackbar({
//       open: true,
//       message: 'Message deleted successfully!',
//       severity: 'success'
//     });
//   };

//   const handleMarkAsRead = (id) => {
//     setMessages(messages.map(m => 
//       m.id === id ? { ...m, read: true } : m
//     ));
//   };

//   const handleRemoveRecipient = (recipientToRemove) => {
//     if (recipientToRemove.type === 'group') {
//       setSelectedGroups(selectedGroups.filter(group => group.id !== recipientToRemove.id));
//     } else {
//       setSelectedUsers(selectedUsers.filter(user => user.id !== recipientToRemove.id));
//     }
//   };

//   const toggleExpandMessage = (messageId) => {
//     setExpandedMessage(expandedMessage === messageId ? null : messageId);
//     if (expandedMessage !== messageId) {
//       handleMarkAsRead(messageId);
//     }
//   };

//   const resetFilters = () => {
//     setFilters({
//       search: '',
//       type: 'all',
//       status: 'all',
//       dateFrom: null,
//       dateTo: null,
//       readStatus: 'all'
//     });
//   };

//   // Mobile view for messages
//   const renderMobileMessageCards = () => (
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//       {filteredMessages
//         .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//         .map((message) => (
//           <Card key={message.id} elevation={3}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   {message.read ? <ReadIcon color="action" /> : <UnreadIcon color="primary" />}
//                   <Typography variant="subtitle1" component="div" sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
//                     {message.subject}
//                   </Typography>
//                 </Box>
//                 <IconButton onClick={() => toggleExpandMessage(message.id)}>
//                   {expandedMessage === message.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                 </IconButton>
//               </Box>
//               <Typography color="text.secondary" gutterBottom>
//                 From: {message.sender.name} • {formatDate(message.date)}
//               </Typography>
              
//               <Collapse in={expandedMessage === message.id}>
//                 <Box sx={{ mt: 2 }}>
//                   <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
//                     {message.content}
//                   </Typography>
                  
//                   {message.attachments.length > 0 && (
//                     <>
//                       <Typography variant="subtitle2">Attachments:</Typography>
//                       <List dense>
//                         {message.attachments.map((attachment, index) => (
//                           <ListItem key={index}>
//                             <ListItemAvatar>
//                               <Avatar>
//                                 <AttachmentIcon />
//                               </Avatar>
//                             </ListItemAvatar>
//                             <ListItemText 
//                               primary={attachment.name} 
//                               secondary={
//                                 <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
//                                   Download
//                                 </Link>
//                               }
//                             />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </>
//                   )}
                  
//                   <Typography variant="subtitle2" sx={{ mt: 2 }}>Recipients:</Typography>
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
//                     {message.recipients.map((recipient, i) => (
//                       <Chip 
//                         key={i} 
//                         label={recipient.name} 
//                         size="small" 
//                         icon={recipient.type === 'group' ? <GroupIcon /> : <PersonIcon />}
//                       />
//                     ))}
//                   </Box>
//                 </Box>
//               </Collapse>
//             </CardContent>
//             <CardActions sx={{ justifyContent: 'space-between' }}>
//               <Box>
//                 <Button 
//                   size="small" 
//                   startIcon={<ReplyIcon />}
//                   onClick={() => handleOpenDialog(message, true)}
//                   color="secondary"
//                 >
//                   Reply
//                 </Button>
//                 <Button 
//                   size="small" 
//                   startIcon={<ForwardIcon />}
//                   onClick={() => handleOpenDialog(message, false, true)}
//                   sx={{ ml: 1 }}
//                   color="secondary"
//                 >
//                   Forward
//                 </Button>
//               </Box>
//               <Box>
//                 <Button 
//                   size="small" 
//                   startIcon={<EditIcon />}
//                   onClick={() => handleOpenDialog(message)}
//                   sx={{ mr: 1 }}
//                 >
//                   Edit
//                 </Button>
//                 <Button 
//                   size="small" 
//                   startIcon={<DeleteIcon />}
//                   onClick={() => handleDeleteMessage(message.id)}
//                   color="error"
//                 >
//                   Delete
//                 </Button>
//               </Box>
//             </CardActions>
//           </Card>
//         ))}
//     </Box>
//   );

//   // Desktop view for messages
//   const renderDesktopMessageTable = () => (
//     <TableContainer component={Paper}>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell width="40px"></TableCell>
//             <TableCell>Subject</TableCell>
//             <TableCell>Type</TableCell>
//             <TableCell>From</TableCell>
//             <TableCell>Date</TableCell>
//             <TableCell>Recipients</TableCell>
//             <TableCell>Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {filteredMessages
//             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//             .map((message) => (
//               <TableRow 
//                 key={message.id} 
//                 hover 
//                 sx={{ 
//                   '&:hover': { cursor: 'pointer' },
//                   backgroundColor: expandedMessage === message.id ? 'action.hover' : 'inherit'
//                 }}
//                 onClick={() => toggleExpandMessage(message.id)}
//               >
//                 <TableCell>
//                   {message.read ? <ReadIcon color="action" /> : <UnreadIcon color="primary" />}
//                 </TableCell>
//                 <TableCell>
//                   <Typography sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
//                     {message.subject}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Chip 
//                     label={messageTypes.find(t => t.value === message.type)?.label || message.type}
//                     size="small"
//                     color={
//                       message.type === 'announcement' ? 'primary' : 
//                       message.type === 'reminder' ? 'secondary' : 
//                       message.type === 'personal' ? 'success' : 'default'
//                     }
//                   />
//                 </TableCell>
//                 <TableCell>{message.sender.name}</TableCell>
//                 <TableCell>{formatDate(message.date)}</TableCell>
//                 <TableCell>
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                     {message.recipients.slice(0, 2).map((recipient, i) => (
//                       <Chip 
//                         key={i} 
//                         label={recipient.name} 
//                         size="small" 
//                         icon={recipient.type === 'group' ? <GroupIcon /> : <PersonIcon />}
//                       />
//                     ))}
//                     {message.recipients.length > 2 && (
//                       <Chip label={`+${message.recipients.length - 2}`} size="small" />
//                     )}
//                   </Box>
//                 </TableCell>
//                 <TableCell>
//                   <Stack direction="row" spacing={1}>
//                     <Tooltip title="Reply">
//                       <IconButton 
//                         size="small" 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleOpenDialog(message, true);
//                         }}
//                         color="secondary"
//                       >
//                         <ReplyIcon />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Forward">
//                       <IconButton 
//                         size="small" 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleOpenDialog(message, false, true);
//                         }}
//                         color="secondary"
//                       >
//                         <ForwardIcon />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Edit">
//                       <IconButton 
//                         size="small" 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleOpenDialog(message);
//                         }}
//                       >
//                         <EditIcon />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Delete">
//                       <IconButton 
//                         size="small" 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteMessage(message.id);
//                         }}
//                         color="error"
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </Tooltip>
//                   </Stack>
//                 </TableCell>
//               </TableRow>
//             ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box>
//         <Typography variant="h4" gutterBottom>
//           Messaging Center
//         </Typography>
        
//         <Button 
//           variant="contained" 
//           startIcon={<SendIcon />}
//           onClick={() => handleOpenDialog()}
//           sx={{ mb: 3 }}
//           fullWidth={isMobile}
//         >
//           New Message
//         </Button>
        
//         {/* Filters Section */}
//         <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 placeholder="Search messages..."
//                 value={filters.search}
//                 onChange={(e) => handleFilterChange('search', e.target.value)}
//                 InputProps={{
//                   startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
//                 }}
//               />
//             </Grid>
//             <Grid item xs={6} sm={3} md={2}>
//               <TextField
//                 select
//                 fullWidth
//                 size="small"
//                 label="Message Type"
//                 value={filters.type}
//                 onChange={(e) => handleFilterChange('type', e.target.value)}
//               >
//                 <MenuItem value="all">All Types</MenuItem>
//                 {messageTypes.map((type) => (
//                   <MenuItem key={type.value} value={type.value}>
//                     {type.label}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={6} sm={3} md={2}>
//               <TextField
//                 select
//                 fullWidth
//                 size="small"
//                 label="Status"
//                 value={filters.status}
//                 onChange={(e) => handleFilterChange('status', e.target.value)}
//               >
//                 <MenuItem value="all">All Statuses</MenuItem>
//                 <MenuItem value="sent">Sent</MenuItem>
//                 <MenuItem value="draft">Draft</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={6} sm={3} md={2}>
//               <TextField
//                 select
//                 fullWidth
//                 size="small"
//                 label="Read Status"
//                 value={filters.readStatus}
//                 onChange={(e) => handleFilterChange('readStatus', e.target.value)}
//               >
//                 <MenuItem value="all">All</MenuItem>
//                 <MenuItem value="read">Read</MenuItem>
//                 <MenuItem value="unread">Unread</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={6} sm={3} md={1}>
//               <DatePicker
//                 label="From"
//                 value={filters.dateFrom}
//                 onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     fullWidth 
//                     size="small"
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={6} sm={3} md={1}>
//               <DatePicker
//                 label="To"
//                 value={filters.dateTo}
//                 onChange={(newValue) => handleFilterChange('dateTo', newValue)}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     fullWidth 
//                     size="small"
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={1} sx={{ textAlign: 'right' }}>
//               <IconButton onClick={resetFilters}>
//                 <RefreshIcon />
//               </IconButton>
//               <IconButton>
//                 <FilterIcon />
//               </IconButton>
//             </Grid>
//           </Grid>
//         </Paper>

//         {isMobile ? renderMobileMessageCards() : renderDesktopMessageTable()}

//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={filteredMessages.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//         />

//         <Dialog 
//           open={openDialog} 
//           onClose={handleCloseDialog} 
//           maxWidth="md" 
//           fullWidth
//           fullScreen={isMobile}
//         >
//           <DialogTitle>
//             {replyMode ? 'Reply to Message' : forwardMode ? 'Forward Message' : currentMessage?.id ? 'Edit Message' : 'Compose New Message'}
//           </DialogTitle>
//           <DialogContent dividers>
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Subject"
//               fullWidth
//               value={currentMessage?.subject || ''}
//               onChange={(e) => setCurrentMessage({...currentMessage, subject: e.target.value})}
//               sx={{ mb: 2 }}
//             />
//             <TextField
//               select
//               margin="dense"
//               label="Message Type"
//               fullWidth
//               value={currentMessage?.type || 'announcement'}
//               onChange={(e) => setCurrentMessage({...currentMessage, type: e.target.value})}
//               sx={{ mb: 2 }}
//             >
//               {messageTypes.map((type) => (
//                 <MenuItem key={type.value} value={type.value}>
//                   {type.label}
//                 </MenuItem>
//               ))}
//             </TextField>
            
//             <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//               Recipients
//             </Typography>
//             <Divider sx={{ mb: 2 }} />

//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2" gutterBottom>Select Users</Typography>
//               <Autocomplete
//                 multiple
//                 options={mockUsers}
//                 getOptionLabel={(option) => option.name}
//                 value={selectedUsers}
//                 onChange={(event, newValue) => setSelectedUsers(newValue)}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label="Search users"
//                     placeholder="Select individual users"
//                   />
//                 )}
//                 renderTags={(value, getTagProps) =>
//                   value.map((option, index) => (
//                     <Chip
//                       {...getTagProps({ index })}
//                       key={option.id}
//                       label={option.name}
//                       icon={<PersonIcon />}
//                       onDelete={() => handleRemoveRecipient(option)}
//                     />
//                   ))
//                 }
//               />
//             </Box>

//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2" gutterBottom>Select Groups</Typography>
//               <FormGroup>
//                 {userGroups.map((group) => (
//                   <FormControlLabel
//                     key={group.id}
//                     control={
//                       <Checkbox
//                         checked={selectedGroups.some(g => g.id === group.id)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setSelectedGroups([...selectedGroups, group]);
//                           } else {
//                             setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
//                           }
//                         }}
//                       />
//                     }
//                     label={
//                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                         <GroupIcon sx={{ mr: 1 }} />
//                         {group.name}
//                       </Box>
//                     }
//                   />
//                 ))}
//               </FormGroup>
//             </Box>

//             <TextField
//               margin="dense"
//               label="Message Content"
//               fullWidth
//               multiline
//               rows={8}
//               value={currentMessage?.content || ''}
//               onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
//               sx={{ mb: 2 }}
//             />

//             <Box sx={{ mb: 2 }}>
//               <Button 
//                 variant="outlined" 
//                 startIcon={<AttachmentIcon />}
//               >
//                 Add Attachment
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             {!replyMode && !forwardMode && (
//               <Button 
//                 onClick={handleSaveDraft} 
//                 color="inherit"
//               >
//                 Save Draft
//               </Button>
//             )}
//             <Button onClick={handleCloseDialog}>Cancel</Button>
//             <Button 
//               onClick={handleSendMessage} 
//               variant="contained" 
//               startIcon={<SendIcon />}
//             >
//               {replyMode ? 'Send Reply' : forwardMode ? 'Forward' : 'Send Message'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={6000}
//           onClose={handleCloseSnackbar}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//         >
//           <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
//             {snackbar.message}
//           </MuiAlert>
//         </Snackbar>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default Messaging;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, 
  Tooltip, Link, Chip, Autocomplete, Checkbox, FormControlLabel, 
  FormGroup, Divider, useMediaQuery, IconButton, Stack, 
  Collapse, Card, CardContent, CardActions, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, TablePagination, Grid,
  LinearProgress
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Send as SendIcon, Email as EmailIcon, Person as PersonIcon,
  Group as GroupIcon, MoreVert as MoreIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon, Reply as ReplyIcon,
  Forward as ForwardIcon, Attachment as AttachmentIcon,
  Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import { messagingAPI, userAPI, groupAPI } from '../../../services/messagingAPI';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const messageTypes = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'notification', label: 'Notification' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'personal', label: 'Personal Message' },
];

const Messaging = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyMode, setReplyMode] = useState(false);
  const [forwardMode, setForwardMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    readStatus: 'all'
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [messagesRes, usersRes, groupsRes] = await Promise.all([
          messagingAPI.getMessages(),
          userAPI.getUsers(),
          groupAPI.getGroups()
        ]);
        
        setMessages(messagesRes.data);
        setUsers(usersRes.data);
        setUserGroups(groupsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load messages',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();

    // Set up WebSocket connection for real-time updates
    const socket = new WebSocket(`ws://${window.location.host}/ws/messages/`);
    
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new_message') {
        setMessages(prev => [data.message, ...prev]);
      } else if (data.type === 'message_read') {
        setMessages(prev => prev.map(m => 
          m.id === data.message_id ? { ...m, read: true } : m
        ));
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);

  // Apply filters to messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = filters.search === '' || 
      message.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      message.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      message.sender.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      `${message.sender.first_name} ${message.sender.last_name}`.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || message.message_type === filters.type;
    const matchesStatus = filters.status === 'all' || message.status === filters.status;
    const matchesReadStatus = filters.readStatus === 'all' || 
      (filters.readStatus === 'read' && message.read) || 
      (filters.readStatus === 'unread' && !message.read);
    
    const matchesDateFrom = !filters.dateFrom || new Date(message.sent_at) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(message.sent_at) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesType && matchesStatus && matchesReadStatus && matchesDateFrom && matchesDateTo;
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy - h:mm a');
  };

  const handleOpenDialog = (message = null, reply = false, forward = false) => {
    const defaultMessage = { 
      subject: '', 
      message_type: 'announcement', 
      content: '',
      status: 'draft',
      attachments: []
    };

    if (message) {
      if (reply) {
        setCurrentMessage({
          ...defaultMessage,
          subject: `Re: ${message.subject}`,
          content: `\n\n---------- Original Message ----------\nFrom: ${message.sender.first_name} ${message.sender.last_name}\nDate: ${formatDate(message.sent_at)}\nSubject: ${message.subject}\n\n${message.content}`,
          parent_message: message.id
        });
        setSelectedUsers([{ id: message.sender.id, email: message.sender.email }]);
        setReplyMode(true);
      } else if (forward) {
        setCurrentMessage({
          ...defaultMessage,
          subject: `Fwd: ${message.subject}`,
          content: `\n\n---------- Forwarded Message ----------\nFrom: ${message.sender.first_name} ${message.sender.last_name}\nDate: ${formatDate(message.sent_at)}\nSubject: ${message.subject}\n\n${message.content}`,
          parent_message: message.id,
          is_forward: true
        });
        setForwardMode(true);
      } else {
        setCurrentMessage(message);
        setSelectedUsers(message.recipients.filter(r => r.recipient).map(r => ({
          id: r.recipient.id,
          email: r.recipient.email
        })));
        setSelectedGroups(message.recipients.filter(r => r.recipient_group).map(r => ({
          id: r.recipient_group.id,
          name: r.recipient_group.name
        })));
        setAttachments(message.attachments);
      }
    } else {
      setCurrentMessage(defaultMessage);
      setSelectedUsers([]);
      setSelectedGroups([]);
      setAttachments([]);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReplyMode(false);
    setForwardMode(false);
    setCurrentMessage(null);
    setSelectedUsers([]);
    setSelectedGroups([]);
    setAttachments([]);
  };

  const handleSendMessage = async () => {
    try {
      const messageData = {
        subject: currentMessage.subject,
        content: currentMessage.content,
        message_type: currentMessage.message_type,
        status: 'sent',
        recipient_users: selectedUsers.map(u => u.id),
        recipient_groups: selectedGroups.map(g => g.id),
        parent_message: currentMessage.parent_message,
        is_forward: currentMessage.is_forward || false
      };
      
      const response = currentMessage.id 
        ? await messagingAPI.updateMessage(currentMessage.id, messageData)
        : await messagingAPI.createMessage(messageData);
      
      // Handle attachments if any
      if (attachments.length > 0 && !currentMessage.id) {
        for (const attachment of attachments) {
          if (attachment.file) {
            await messagingAPI.uploadAttachment(attachment.file);
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: replyMode ? 'Reply sent successfully!' : 
                forwardMode ? 'Message forwarded successfully!' : 
                'Message sent successfully!',
        severity: 'success'
      });
      
      // Refresh messages
      const messagesRes = await messagingAPI.getMessages();
      setMessages(messagesRes.data);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Error sending message',
        severity: 'error'
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const messageData = {
        subject: currentMessage.subject,
        content: currentMessage.content,
        message_type: currentMessage.message_type,
        status: 'draft',
        recipient_users: selectedUsers.map(u => u.id),
        recipient_groups: selectedGroups.map(g => g.id),
        parent_message: currentMessage.parent_message,
        is_forward: currentMessage.is_forward || false
      };
      
      const response = currentMessage.id 
        ? await messagingAPI.updateMessage(currentMessage.id, messageData)
        : await messagingAPI.createMessage(messageData);
      
      // Handle attachments if any
      if (attachments.length > 0 && !currentMessage.id) {
        for (const attachment of attachments) {
          if (attachment.file) {
            await messagingAPI.uploadAttachment(attachment.file);
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Draft saved successfully!',
        severity: 'success'
      });
      
      // Refresh messages
      const messagesRes = await messagingAPI.getMessages();
      setMessages(messagesRes.data);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving draft:', error);
      setSnackbar({
        open: true,
        message: 'Error saving draft',
        severity: 'error'
      });
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await messagingAPI.deleteMessage(id);
      setSnackbar({
        open: true,
        message: 'Message deleted successfully!',
        severity: 'success'
      });
      
      // Refresh messages
      const messagesRes = await messagingAPI.getMessages();
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error deleting message:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting message',
        severity: 'error'
      });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await messagingAPI.markAsRead(id);
      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, read: true } : m
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleRemoveRecipient = (recipientToRemove) => {
    if (recipientToRemove.email) {
      setSelectedUsers(selectedUsers.filter(user => user.id !== recipientToRemove.id));
    } else {
      setSelectedGroups(selectedGroups.filter(group => group.id !== recipientToRemove.id));
    }
  };

  const toggleExpandMessage = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
    if (expandedMessage !== messageId) {
      handleMarkAsRead(messageId);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      dateFrom: null,
      dateTo: null,
      readStatus: 'all'
    });
  };

  const handleAddAttachment = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const newAttachments = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newAttachments.push({
          file,
          original_filename: file.name,
          id: `temp-${Date.now()}-${i}`,
          uploaded_at: new Date().toISOString()
        });
      }
      
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error adding attachments:', error);
      setSnackbar({
        open: true,
        message: 'Error adding attachments',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'primary';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };
  // Handle pagination
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};


  // Mobile view for messages
  const renderMobileMessageCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {filteredMessages
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((message) => (
          <Card key={message.id} elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {message.read ? <ReadIcon color="action" /> : <UnreadIcon color="primary" />}
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
                    {message.subject}
                  </Typography>
                </Box>
                <IconButton onClick={() => toggleExpandMessage(message.id)}>
                  {expandedMessage === message.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Typography color="text.secondary" gutterBottom>
                From: {message.sender.first_name} {message.sender.last_name} • {formatDate(message.sent_at)}
              </Typography>
              
              <Collapse in={expandedMessage === message.id}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {message.content}
                  </Typography>
                  
                  {message.attachments.length > 0 && (
                    <>
                      <Typography variant="subtitle2">Attachments:</Typography>
                      <List dense>
                        {message.attachments.map((attachment, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar>
                                <AttachmentIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={attachment.original_filename} 
                              secondary={
                                <Link href={attachment.file} target="_blank" rel="noopener noreferrer">
                                  Download
                                </Link>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Recipients:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {message.recipients.map((recipient, i) => (
                      <Chip 
                        key={i} 
                        label={recipient.recipient ? 
                          `${recipient.recipient.first_name} ${recipient.recipient.last_name}` : 
                          recipient.recipient_group.name}
                        size="small" 
                        icon={recipient.recipient_group ? <GroupIcon /> : <PersonIcon />}
                      />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Button 
                  size="small" 
                  startIcon={<ReplyIcon />}
                  onClick={() => handleOpenDialog(message, true)}
                  color="secondary"
                >
                  Reply
                </Button>
                <Button 
                  size="small" 
                  startIcon={<ForwardIcon />}
                  onClick={() => handleOpenDialog(message, false, true)}
                  sx={{ ml: 1 }}
                  color="secondary"
                >
                  Forward
                </Button>
              </Box>
              <Box>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(message)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteMessage(message.id)}
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </CardActions>
          </Card>
        ))}
    </Box>
  );

  // Desktop view for messages
  const renderDesktopMessageTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="40px"></TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Recipients</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMessages
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((message) => (
              <TableRow 
                key={message.id} 
                hover 
                sx={{ 
                  '&:hover': { cursor: 'pointer' },
                  backgroundColor: expandedMessage === message.id ? 'action.hover' : 'inherit'
                }}
                onClick={() => toggleExpandMessage(message.id)}
              >
                <TableCell>
                  {message.read ? <ReadIcon color="action" /> : <UnreadIcon color="primary" />}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
                    {message.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={messageTypes.find(t => t.value === message.message_type)?.label || message.message_type}
                    size="small"
                    color={getStatusColor(message.status)}
                  />
                </TableCell>
                <TableCell>
                  {message.sender.first_name} {message.sender.last_name}
                </TableCell>
                <TableCell>{formatDate(message.sent_at)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {message.recipients.slice(0, 2).map((recipient, i) => (
                      <Chip 
                        key={i} 
                        label={recipient.recipient ? 
                          `${recipient.recipient.first_name} ${recipient.recipient.last_name}` : 
                          recipient.recipient_group.name}
                        size="small" 
                        icon={recipient.recipient_group ? <GroupIcon /> : <PersonIcon />}
                      />
                    ))}
                    {message.recipients.length > 2 && (
                      <Chip label={`+${message.recipients.length - 2}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Reply">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(message, true);
                        }}
                        color="secondary"
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Forward">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(message, false, true);
                        }}
                        color="secondary"
                      >
                        <ForwardIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(message);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Messaging Center
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<SendIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
          fullWidth={isMobile}
        >
          New Message
        </Button>
        
        {/* Filters Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search messages..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Message Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {messageTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Read Status"
                value={filters.readStatus}
                onChange={(e) => handleFilterChange('readStatus', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
              <DatePicker
                label="From"
                value={filters.dateFrom}
                onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
              <DatePicker
                label="To"
                value={filters.dateTo}
                onChange={(newValue) => handleFilterChange('dateTo', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1} sx={{ textAlign: 'right' }}>
              <IconButton onClick={resetFilters}>
                <RefreshIcon />
              </IconButton>
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <LinearProgress />
        ) : isMobile ? renderMobileMessageCards() : renderDesktopMessageTable()}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMessages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Message Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {replyMode ? 'Reply to Message' : forwardMode ? 'Forward Message' : currentMessage?.id ? 'Edit Message' : 'Compose New Message'}
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
              autoFocus
              margin="dense"
              label="Subject"
              fullWidth
              value={currentMessage?.subject || ''}
              onChange={(e) => setCurrentMessage({...currentMessage, subject: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Message Type"
              fullWidth
              value={currentMessage?.message_type || 'announcement'}
              onChange={(e) => setCurrentMessage({...currentMessage, message_type: e.target.value})}
              sx={{ mb: 2 }}
            >
              {messageTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Recipients
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Select Users</Typography>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
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
                      label={`${option.first_name} ${option.last_name}`}
                      icon={<PersonIcon />}
                      onDelete={() => handleRemoveRecipient(option)}
                    />
                  ))
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Select Groups</Typography>
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

            <TextField
              margin="dense"
              label="Message Content"
              fullWidth
              multiline
              rows={8}
              value={currentMessage?.content || ''}
              onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAddAttachment}
                style={{ display: 'none' }}
                multiple
              />
              <Button 
                variant="outlined" 
                startIcon={<AttachmentIcon />}
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
              >
                Add Attachment
                {isUploading && (
                  <CircularProgress size={24} sx={{ ml: 1 }} />
                )}
              </Button>
            </Box>

            {attachments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Attachments:</Typography>
                <List dense>
                  {attachments.map((attachment) => (
                    <ListItem 
                      key={attachment.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AttachmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={attachment.original_filename}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {!replyMode && !forwardMode && (
              <Button 
                onClick={handleSaveDraft} 
                color="inherit"
                disabled={isUploading}
              >
                Save Draft
              </Button>
            )}
            <Button 
              onClick={handleCloseDialog} 
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              variant="contained" 
              startIcon={<SendIcon />}
              disabled={
                !currentMessage?.subject || 
                !currentMessage?.content || 
                (selectedUsers.length === 0 && selectedGroups.length === 0) ||
                isUploading
              }
            >
              {replyMode ? 'Send Reply' : forwardMode ? 'Forward' : 'Send Message'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Messaging;