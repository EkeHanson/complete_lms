import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextareaAutosize,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search, 
  Visibility, 
  Edit, 
  CheckCircle, 
  Warning, 
  Close,
  Save
} from '@mui/icons-material';

// Sample data with observations
const trainerData = [
  {
    id: 1,
    name: 'John Smith',
    avatar: '/avatars/1.jpg',
    sessionsCompleted: 24,
    complianceScore: 92,
    lastObservation: '2023-06-15',
    status: 'compliant',
    qualifications: ['Level 5', 'First Aid'],
    observations: [
      {
        date: '2023-06-15',
        rating: 4.5,
        notes: 'Excellent session delivery with strong learner engagement',
        observer: 'QA Officer James'
      }
    ]
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    avatar: '/avatars/2.jpg',
    sessionsCompleted: 18,
    complianceScore: 85,
    lastObservation: '2023-06-10',
    status: 'needs_improvement',
    qualifications: ['Level 3', 'Safeguarding'],
    observations: [
      {
        date: '2023-06-10',
        rating: 3,
        notes: 'Needs to improve assessment feedback quality',
        observer: 'QA Officer James'
      }
    ]
  }
];

const statusMap = {
  exemplary: { label: 'Exemplary', color: 'info', icon: <CheckCircle fontSize="small" /> },
  compliant: { label: 'Compliant', color: 'success', icon: <CheckCircle fontSize="small" /> },
  needs_improvement: { label: 'Needs Improvement', color: 'warning', icon: <Warning fontSize="small" /> },
  action_required: { label: 'Action Required', color: 'error', icon: <Warning fontSize="small" /> },
};

export default function TrainerMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [projectedStatus, setProjectedStatus] = useState('compliant');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [trainers, setTrainers] = useState(trainerData);
  const rowsPerPage = 5;

  // Helper functions
  const getStatusDescription = (status) => {
    const descriptions = {
      exemplary: "Trainer will be flagged as top performer",
      compliant: "No action needed - meets all standards",
      needs_improvement: "Will trigger improvement plan",
      action_required: "Immediate supervisor notification"
    };
    return descriptions[status];
  };

  const determineStatus = (rating, notes = "") => {
    let status;
    if (rating >= 4.5) status = 'exemplary';
    else if (rating >= 3.5) status = 'compliant';
    else if (rating >= 2.5) status = 'needs_improvement';
    else status = 'action_required';

    const urgentKeywords = ['safeguarding', 'violation', 'emergency', 'immediate'];
    const hasUrgentNote = urgentKeywords.some(keyword => 
      notes.toLowerCase().includes(keyword)
    );

    return hasUrgentNote ? 'action_required' : status;
  };

  // Event handlers
  const handleSubmitFeedback = () => {
    const finalStatus = determineStatus(feedbackRating, feedbackNotes);
    const newObservation = {
      date: new Date().toISOString().split('T')[0],
      rating: feedbackRating,
      notes: feedbackNotes,
      observer: 'Current User'
    };

    const updatedTrainers = trainers.map(trainer => 
      trainer.id === selectedTrainer.id 
        ? { 
            ...trainer, 
            status: finalStatus,
            observations: [...trainer.observations, newObservation],
            lastObservation: new Date().toISOString().split('T')[0],
            complianceScore: Math.min(100, Math.max(0, feedbackRating * 20)) // Simple score calculation
          }
        : trainer
    );

    setTrainers(updatedTrainers);
    setSnackbarMessage(
      `Feedback submitted! Status updated to: ${statusMap[finalStatus].label}`
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setFeedbackDialogOpen(false);
  };

  const filteredData = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Filters */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Trainer Monitoring
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search trainers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
          sx={{ width: 300 }}
        />
        
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {Object.keys(statusMap).map(status => (
              <MenuItem key={status} value={status}>
                {statusMap[status].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Main Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Trainer</TableCell>
              <TableCell align="center">Sessions</TableCell>
              <TableCell align="center">Compliance Score</TableCell>
              <TableCell align="center">Last Observed</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((trainer) => (
              <TableRow key={trainer.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={trainer.avatar} alt={trainer.name} />
                    <Typography>{trainer.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">{trainer.sessionsCompleted}</TableCell>
                <TableCell align="center">{trainer.complianceScore}%</TableCell>
                <TableCell align="center">{trainer.lastObservation}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={statusMap[trainer.status].icon}
                    label={statusMap[trainer.status].label}
                    color={statusMap[trainer.status].color}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton 
                      color="primary"
                      onClick={() => setSelectedTrainer(trainer)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Provide Feedback">
                    <IconButton 
                      color="secondary"
                      onClick={() => {
                        setSelectedTrainer(trainer);
                        setFeedbackRating(3);
                        setFeedbackNotes('');
                        setProjectedStatus(determineStatus(3));
                        setFeedbackDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      {/* Trainer Details Dialog */}
      <Dialog 
        open={Boolean(selectedTrainer)} 
        onClose={() => setSelectedTrainer(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTrainer?.name}'s Details
          <IconButton onClick={() => setSelectedTrainer(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTrainer && (
            <Box>
              <Stack direction="row" spacing={4} alignItems="center" mb={3}>
                <Avatar src={selectedTrainer.avatar} sx={{ width: 80, height: 80 }} />
                <Box>
                  <Typography variant="h6">{selectedTrainer.name}</Typography>
                  <Typography color="text.secondary">
                    {selectedTrainer.qualifications.join(', ')}
                  </Typography>
                  <Chip
                    icon={statusMap[selectedTrainer.status].icon}
                    label={statusMap[selectedTrainer.status].label}
                    color={statusMap[selectedTrainer.status].color}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Typography>Compliance: {selectedTrainer.complianceScore}%</Typography>
                  <Typography>Sessions: {selectedTrainer.sessionsCompleted}</Typography>
                </Box>
              </Stack>

              <Typography variant="h6" gutterBottom>Observation History</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Observer</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTrainer.observations.map((obs, index) => (
                      <TableRow key={index}>
                        <TableCell>{obs.date}</TableCell>
                        <TableCell>
                          <Rating value={obs.rating} precision={0.5} readOnly />
                        </TableCell>
                        <TableCell>{obs.observer}</TableCell>
                        <TableCell>{obs.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTrainer(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Feedback for {selectedTrainer?.name}
          <IconButton onClick={() => setFeedbackDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Rating (1-5)</Typography>
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => {
                setFeedbackRating(newValue);
                setProjectedStatus(determineStatus(newValue, feedbackNotes));
              }}
              precision={0.5}
              size="large"
            />
            
            {feedbackRating && (
              <Box sx={{ mt: 2, p: 2, bgcolor: `${statusMap[projectedStatus].color}.light`, borderRadius: 1 }}>
                <Typography variant="body2"><strong>Status Impact:</strong></Typography>
                <Chip
                  label={statusMap[projectedStatus].label}
                  color={statusMap[projectedStatus].color}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {getStatusDescription(projectedStatus)}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box>
            <Typography gutterBottom>Observation Notes</Typography>
            <TextareaAutosize
              minRows={4}
              style={{ width: '100%', padding: '8px', fontFamily: 'inherit' }}
              placeholder="Detailed feedback... (mention any urgent issues)"
              value={feedbackNotes}
              onChange={(e) => {
                setFeedbackNotes(e.target.value);
                setProjectedStatus(determineStatus(feedbackRating, e.target.value));
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitFeedback}
            variant="contained"
            color="primary"
            startIcon={<Save />}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}