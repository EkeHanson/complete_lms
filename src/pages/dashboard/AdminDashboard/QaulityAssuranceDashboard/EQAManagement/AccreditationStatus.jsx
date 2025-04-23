import React, { useState } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  CalendarToday,
  Update,
  Description,
  Lock,
  Download,
  History
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const statusMap = {
  accredited: { color: 'success', icon: <CheckCircle />, label: 'Accredited' },
  pending: { color: 'warning', icon: <Warning />, label: 'Pending Review' },
  probation: { color: 'error', icon: <Error />, label: 'On Probation' },
  expired: { color: 'error', icon: <Error />, label: 'Expired' },
  renewal: { color: 'info', icon: <Info />, label: 'Renewal in Progress' }
};

const AccreditationStatus = ({ isReadOnly = false }) => {
  const theme = useTheme();
  const [status, setStatus] = useState('pending');
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [renewalData, setRenewalData] = useState({
    applicationDate: '',
    expectedDate: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const accreditationDetails = {
    currentStatus: status,
    validUntil: '2024-12-31',
    accreditor: "Ofqual",
    reference: "QA12345",
    lastReview: '2023-06-15',
    nextReview: '2024-06-01',
    standardsMet: 18,
    totalStandards: 20,
    requirements: [
      { id: 1, name: 'Trainer Qualifications', status: 'met', eqaNotes: 'Verified 2023-05', lastChecked: '2023-05-10' },
      { id: 2, name: 'Assessment Procedures', status: 'met', eqaNotes: 'Sample reviewed', lastChecked: '2023-05-12' },
      { id: 3, name: 'IQA Process', status: 'met', eqaNotes: 'Full audit passed', lastChecked: '2023-06-01' },
      { id: 4, name: 'Facility Standards', status: 'pending', eqaNotes: 'Site visit required', lastChecked: '2023-04-15' },
      { id: 5, name: 'Learner Support', status: 'partial', eqaNotes: 'Minor improvements needed', lastChecked: '2023-05-20' }
    ],
    documents: [
      { id: 1, name: 'Accreditation Certificate', type: 'pdf', url: '/docs/cert.pdf', uploaded: '2023-01-10' },
      { id: 2, name: 'Last Audit Report', type: 'docx', url: '/docs/audit_2023.docx', uploaded: '2023-06-20' },
      { id: 3, name: 'Improvement Plan', type: 'xlsx', url: '/docs/improvement.xlsx', uploaded: '2023-07-05' }
    ],
    history: [
      { date: '2022-12-15', action: 'Initial Accreditation', by: 'EQA Team A' },
      { date: '2023-06-15', action: 'Annual Review', by: 'EQA Team B' }
    ]
  };

  const handleRenewalClick = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRenewalData({
      applicationDate: '',
      expectedDate: '',
      notes: ''
    });
  };

  const handleRenewalSubmit = () => {
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

  const handleDownload = (url) => {
    console.log('Downloading:', url);
    // Actual download implementation would go here
  };

  const handleViewHistory = () => {
    setOpenHistory(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Accreditation Status
        {isReadOnly && (
          <Chip 
            icon={<Lock />} 
            label="EQA View" 
            size="small" 
            sx={{ ml: 2 }} 
            color="info"
          />
        )}
      </Typography>

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={statusMap[status].icon}
                  label={statusMap[status].label}
                  color={statusMap[status].color}
                  sx={{ fontSize: '1rem', padding: '8px 12px' }}
                />
                <Typography variant="body2" sx={{ ml: 'auto' }}>
                  Ref: {accreditationDetails.reference}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Accrediting Body:</Typography>
                <Typography>{accreditationDetails.accreditor}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Valid Until:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  <Typography>
                    {new Date(accreditationDetails.validUntil).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Standards Compliance:</Typography>
                  <Typography>
                    {accreditationDetails.standardsMet}/{accreditationDetails.totalStandards}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(accreditationDetails.standardsMet / accreditationDetails.totalStandards) * 100}
                  sx={{ height: 8, mt: 1 }}
                />
                {isReadOnly && (
                  <Typography variant="caption" color="text.secondary">
                    Last EQA Review: {accreditationDetails.lastReview}
                  </Typography>
                )}
              </Box>

              {!isReadOnly && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Update />}
                  onClick={handleRenewalClick}
                  fullWidth
                >
                  Initiate Renewal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Document Access */}
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Accreditation Documents</Typography>
                {isReadOnly && (
                  <Button 
                    size="small" 
                    startIcon={<History />}
                    onClick={handleViewHistory}
                  >
                    View History
                  </Button>
                )}
              </Box>
              <List>
                {accreditationDetails.documents.map((doc) => (
                  <ListItem 
                    key={doc.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDownload(doc.url)}>
                        <Download />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.name} 
                      secondary={
                        <>
                          {doc.type.toUpperCase()} • Uploaded: {doc.uploaded}
                          {isReadOnly && ` • By: Admin User`}
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Compliance Requirements
              </Typography>
              
              <List>
                {accreditationDetails.requirements.map((req) => (
                  <React.Fragment key={req.id}>
                    <ListItem>
                      <ListItemIcon>
                        {req.status === 'met' ? (
                          <CheckCircle color="success" />
                        ) : req.status === 'partial' ? (
                          <Warning color="warning" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={req.name}
                        secondary={
                          isReadOnly ? (
                            <>
                              {req.eqaNotes}
                              <br />
                              Last checked: {req.lastChecked}
                            </>
                          ) : (
                            `Status: ${req.status}`
                          )
                        }
                      />
                      <Chip 
                        label={req.status} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 2 }}
                        color={
                          req.status === 'met' ? 'success' :
                          req.status === 'partial' ? 'warning' : 'error'
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
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

      {/* History Dialog */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Accreditation History</DialogTitle>
        <DialogContent>
          <List>
            {accreditationDetails.history.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {item.by.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.action}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          By: {item.by}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Date: {item.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < accreditationDetails.history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>Close</Button>
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