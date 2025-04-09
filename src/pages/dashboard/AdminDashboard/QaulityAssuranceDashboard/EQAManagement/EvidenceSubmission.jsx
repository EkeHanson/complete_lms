import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Pending,
  Error,
  Delete,
  Add,
  Visibility,
  Download
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const EvidenceSubmission = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    name: '',
    description: '',
    file: null
  });
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      name: 'Trainer Qualifications',
      description: 'Certificates for all active trainers',
      status: 'approved',
      date: '2023-05-15',
      files: ['trainer_certs.zip']
    },
    {
      id: 2,
      name: 'IQA Process Documentation',
      description: 'Internal quality assurance procedures',
      status: 'pending',
      date: '2023-06-20',
      files: ['iqa_policy.pdf', 'iqa_records.xlsx']
    },
    {
      id: 3,
      name: 'Learner Assessment Samples',
      description: 'Random sample of graded learner assessments',
      status: 'rejected',
      date: '2023-04-10',
      files: ['assessments_sample.zip']
    },
    {
      id: 4,
      name: 'Facility Standards Compliance',
      description: 'Photos and inspection reports',
      status: 'pending',
      date: '2023-06-25',
      files: ['facility_photos.zip', 'inspection_report.pdf']
    }
  ]);

  const statusIcons = {
    approved: <CheckCircle color="success" />,
    pending: <Pending color="warning" />,
    rejected: <Error color="error" />
  };

  const handleAddEvidence = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewEvidence({
      name: '',
      description: '',
      file: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvidence(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewEvidence(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmitEvidence = () => {
    // In a real app, this would upload to a server
    const newSubmission = {
      id: submissions.length + 1,
      name: newEvidence.name,
      description: newEvidence.description,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      files: [newEvidence.file?.name || 'evidence.pdf']
    };

    setSubmissions([...submissions, newSubmission]);
    handleDialogClose();
  };

  const handleDeleteSubmission = (id) => {
    setSubmissions(submissions.filter(sub => sub.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Evidence Submission Portal
      </Typography>

      <Grid container spacing={3}>
        {/* Submission Requirements */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Required Evidence
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Trainer Qualifications"
                    secondary="Certificates/credentials for all trainers"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Assessment Samples"
                    secondary="Random sample of graded assessments"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="IQA Records"
                    secondary="Internal quality assurance documentation"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Facility Standards"
                    secondary="Evidence of compliant facilities"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Submission Status */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Submissions
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleAddEvidence}
                >
                  Add Evidence
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Evidence</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.name}</TableCell>
                        <TableCell>{submission.description}</TableCell>
                        <TableCell>
                          <Chip
                            icon={statusIcons[submission.status]}
                            label={submission.status}
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              borderColor:
                                submission.status === 'approved' ? theme.palette.success.main :
                                submission.status === 'rejected' ? theme.palette.error.main :
                                theme.palette.warning.main
                            }}
                          />
                        </TableCell>
                        <TableCell>{submission.date}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <Download fontSize="small" />
                          </IconButton>
                          {submission.status === 'pending' && (
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteSubmission(submission.id)}
                            >
                              <Delete fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Evidence Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Evidence</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Evidence Name"
              name="name"
              value={newEvidence.name}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newEvidence.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            
            <Button
              component="label"
              variant="outlined"
              color="primary"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {newEvidence.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {newEvidence.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitEvidence}
            variant="contained"
            color="primary"
            disabled={!newEvidence.name || !newEvidence.file}
          >
            Submit Evidence
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenceSubmission;