import React, { useState, useEffect } from 'react';
import {
  Box,  Typography,  Card,  CardContent,  Grid,
  Button,  Chip,  TextField,  Divider,  Table,  TableBody,
  TableCell,  TableContainer,
  TableHead,  TableRow,  Paper,  Dialog,  DialogTitle,  DialogContent,
  DialogActions,  IconButton,  MenuItem,  Alert
} from '@mui/material';
import {
  CalendarToday,  Add,  Edit,  Delete,
  Visibility,  Download,  CheckCircle,  Warning,  Error
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';

// Mock data - replace with API calls
const mockAudits = [
  {
    id: 1,
    title: "Annual Ofqual Compliance Review",
    type: "full",
    status: "scheduled",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    auditor: "Ofqual Team A",
    focusAreas: ["Assessment", "IQA", "Certification"],
    documents: ["iqa_policy.pdf", "sampling_2023.xlsx"]
  },
  {
    id: 2,
    title: "Spot Check - Digital Marketing Course",
    type: "partial",
    status: "completed",
    startDate: "2023-11-02",
    endDate: "2023-11-02",
    auditor: "EQA Specialist B",
    focusAreas: ["Assessment"],
    documents: ["course_assessments.zip"]
  },
  {
    id: 3,
    title: "ISO 9001 Surveillance Audit",
    type: "full",
    status: "pending",
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    auditor: "ISO Certification Body",
    focusAreas: ["Processes", "Documentation"],
    documents: []
  }
];

const statusConfig = {
  scheduled: { color: "info", icon: <Warning /> },
  completed: { color: "success", icon: <CheckCircle /> },
  pending: { color: "warning", icon: <Warning /> },
  cancelled: { color: "error", icon: <Error /> }
};

const AuditScheduler = ({ isReadOnly = false }) => {
  const theme = useTheme();
  const [audits, setAudits] = useState(mockAudits);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const handleOpenCreate = () => {
    setCurrentAudit({
      title: "",
      type: "partial",
      status: "pending",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      auditor: "",
      focusAreas: [],
      documents: []
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (audit) => {
    setCurrentAudit({ ...audit });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAudit(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAudit(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setCurrentAudit(prev => ({ 
      ...prev, 
      [name]: date ? date.toISOString().split('T')[0] : "" 
    }));
  };

  const handleSubmitAudit = () => {
    if (currentAudit.id) {
      // Update existing
      setAudits(audits.map(a => a.id === currentAudit.id ? currentAudit : a));
      setAlert({ open: true, message: "Audit updated successfully", severity: "success" });
    } else {
      // Create new
      const newAudit = {
        ...currentAudit,
        id: Math.max(...audits.map(a => a.id)) + 1
      };
      setAudits([...audits, newAudit]);
      setAlert({ open: true, message: "Audit scheduled successfully", severity: "success" });
    }
    handleCloseDialog();
  };

  const handleDeleteAudit = (id) => {
    setAudits(audits.filter(a => a.id !== id));
    setAlert({ open: true, message: "Audit cancelled", severity: "warning" });
  };

  const handleOpenDetails = (audit) => {
    setSelectedAudit(audit);
    setOpenDetails(true);
  };

  const focusAreaOptions = [
    "Assessment",
    "IQA Process",
    "Trainer Qualifications",
    "Facilities",
    "Documentation",
    "Learner Support",
    "Certification"
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        EQA Audit Scheduling
      </Typography>

      {!isReadOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenCreate}
          >
            Schedule New Audit
          </Button>
        </Box>
      )}

      <Card elevation={3}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Audit Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Auditor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>{audit.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={audit.type} 
                        size="small" 
                        color={audit.type === "full" ? "primary" : "secondary"} 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(audit.startDate).toLocaleDateString()} - 
                      {new Date(audit.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig[audit.status]?.icon}
                        label={audit.status}
                        color={statusConfig[audit.status]?.color}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDetails(audit)}
                        color="primary"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      {!isReadOnly && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenEdit(audit)}
                            color="secondary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {audit.status !== 'completed' && (
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteAudit(audit.id)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Audit Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)} 
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit Details</DialogTitle>
        <DialogContent>
          {selectedAudit && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAudit.title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Audit Type:</Typography>
                  <Typography>{selectedAudit.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip
                    icon={statusConfig[selectedAudit.status]?.icon}
                    label={selectedAudit.status}
                    color={statusConfig[selectedAudit.status]?.color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Dates:</Typography>
                  <Typography>
                    {new Date(selectedAudit.startDate).toLocaleDateString()} - 
                    {new Date(selectedAudit.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Auditor:</Typography>
                  <Typography>{selectedAudit.auditor}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Focus Areas:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedAudit.focusAreas.map((area, index) => (
                  <Chip key={index} label={area} size="small" />
                ))}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Required Documents:
              </Typography>
              {selectedAudit.documents.length > 0 ? (
                <List dense>
                  {selectedAudit.documents.map((doc, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1,
                        '&:hover': { backgroundColor: theme.palette.action.hover }
                      }}
                    >
                      <Description sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {doc}
                      </Typography>
                      <IconButton size="small">
                        <Download fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No documents specified
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      {!isReadOnly && (
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentAudit?.id ? "Edit Audit" : "Schedule New Audit"}
          </DialogTitle>
          <DialogContent>
            {currentAudit && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Audit Title"
                  name="title"
                  value={currentAudit.title}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  select
                  fullWidth
                  label="Audit Type"
                  name="type"
                  value={currentAudit.type}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="partial">Partial Audit</MenuItem>
                  <MenuItem value="full">Full Audit</MenuItem>
                </TextField>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={currentAudit.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={currentAudit.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  fullWidth
                  label="Auditor/Team"
                  name="auditor"
                  value={currentAudit.auditor}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  select
                  fullWidth
                  label="Focus Areas"
                  name="focusAreas"
                  value={currentAudit.focusAreas}
                  onChange={(e) => {
                    setCurrentAudit(prev => ({
                      ...prev,
                      focusAreas: e.target.value
                    }));
                  }}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )
                  }}
                  sx={{ mb: 3 }}
                >
                  {focusAreaOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitAudit}
              variant="contained"
              color="primary"
              disabled={!currentAudit?.title || !currentAudit?.auditor}
            >
              {currentAudit?.id ? "Update" : "Schedule"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Alert */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          {alert.message}
        </Alert>
      )}
    </Box>
  );
};

export default AuditScheduler;