import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  LinearProgress, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  Info, 
  CalendarToday,
  Update,
  Description
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const statusMap = {
  'accredited': { color: 'success', icon: <CheckCircle />, label: 'Accredited' },
  'pending': { color: 'warning', icon: <Warning />, label: 'Pending Review' },
  'probation': { color: 'error', icon: <Error />, label: 'On Probation' },
  'expired': { color: 'error', icon: <Error />, label: 'Expired' },
  'renewal': { color: 'info', icon: <Info />, label: 'Renewal in Progress' }
};

const AccreditationStatus = () => {
  const theme = useTheme();
  const [status, setStatus] = useState('pending');
  const [openDialog, setOpenDialog] = useState(false);
  const [renewalData, setRenewalData] = useState({
    applicationDate: '',
    expectedDate: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data - in a real app this would come from an API
  const accreditationDetails = {
    currentStatus: status,
    validUntil: '2024-12-31',
    lastReview: '2023-06-15',
    nextReview: '2024-06-01',
    standardsMet: 18,
    totalStandards: 20,
    requirements: [
      { id: 1, name: 'Trainer Qualifications', status: 'met' },
      { id: 2, name: 'Assessment Procedures', status: 'met' },
      { id: 3, name: 'IQA Process', status: 'met' },
      { id: 4, name: 'Facility Standards', status: 'pending' },
      { id: 5, name: 'Learner Support', status: 'partial' }
    ]
  };

  const handleRenewalClick = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleRenewalSubmit = () => {
    // In a real app, this would submit to an API
    setStatus('renewal');
    setSnackbar({
      open: true,
      message: 'Renewal application submitted successfully!',
      severity: 'success'
    });
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRenewalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Accreditation Status
      </Typography>

      <Grid container spacing={3}>
        {/* Main Status Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={statusMap[status].icon}
                  label={statusMap[status].label}
                  color={statusMap[status].color}
                  sx={{ 
                    fontSize: '1rem',
                    padding: '8px 12px',
                    '& .MuiChip-icon': { fontSize: '1.2rem' }
                  }}
                />
                <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary' }}>
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Accreditation Valid Until:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                  <Typography variant="body1">
                    {new Date(accreditationDetails.validUntil).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Standards Compliance:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {accreditationDetails.standardsMet}/{accreditationDetails.totalStandards}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(accreditationDetails.standardsMet / accreditationDetails.totalStandards) * 100}
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: theme.palette.success.main
                      }
                    }}
                  />
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Update />}
                onClick={handleRenewalClick}
                fullWidth
              >
                Initiate Renewal Process
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Key Requirements
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {accreditationDetails.requirements.map((req) => (
                  <Box key={req.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[1]
                  }}>
                    <Chip
                      label={req.status.toUpperCase()}
                      size="small"
                      color={
                        req.status === 'met' ? 'success' : 
                        req.status === 'partial' ? 'warning' : 'default'
                      }
                      sx={{ mr: 2, minWidth: 80 }}
                    />
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {req.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Renewal Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Initiate Accreditation Renewal</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Application Date"
              type="date"
              name="applicationDate"
              value={renewalData.applicationDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Expected Decision Date"
              type="date"
              name="expectedDate"
              value={renewalData.expectedDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={renewalData.notes}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRenewalSubmit}
            variant="contained"
            color="primary"
            startIcon={<Description />}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({...snackbar, open: false})}
          sx={{ position: 'fixed', bottom: 20, right: 20, minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default AccreditationStatus;