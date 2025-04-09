import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const QualityStandards = () => {
  const theme = useTheme();
  const [standards, setStandards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStandard, setCurrentStandard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    complianceLevel: 'required',
    applicableTo: 'all'
  });

  // Sample data - in a real app this would come from an API
  useEffect(() => {
    const sampleStandards = [
      {
        id: 1,
        name: 'Assessment Fairness',
        description: 'All assessments must be graded fairly and consistently',
        category: 'Assessment',
        complianceLevel: 'required',
        applicableTo: 'all',
        lastUpdated: '2023-05-15'
      },
      {
        id: 2,
        name: 'Trainer Qualifications',
        description: 'All trainers must hold current certifications',
        category: 'Trainer',
        complianceLevel: 'required',
        applicableTo: 'instructors',
        lastUpdated: '2023-04-20'
      },
      {
        id: 3,
        name: 'Content Review Cycle',
        description: 'All course content must be reviewed annually',
        category: 'Content',
        complianceLevel: 'recommended',
        applicableTo: 'content',
        lastUpdated: '2023-03-10'
      }
    ];
    setStandards(sampleStandards);
  }, []);

  const handleOpenDialog = (standard = null) => {
    if (standard) {
      setCurrentStandard(standard);
      setFormData({
        name: standard.name,
        description: standard.description,
        category: standard.category,
        complianceLevel: standard.complianceLevel,
        applicableTo: standard.applicableTo
      });
    } else {
      setCurrentStandard(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        complianceLevel: 'required',
        applicableTo: 'all'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStandard) {
      // Update existing standard
      setStandards(prev => prev.map(std => 
        std.id === currentStandard.id ? { ...std, ...formData, lastUpdated: new Date().toISOString().split('T')[0] } : std
      ));
    } else {
      // Add new standard
      const newStandard = {
        id: standards.length + 1,
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setStandards(prev => [...prev, newStandard]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setStandards(prev => prev.filter(std => std.id !== id));
  };

  const getComplianceColor = (level) => {
    switch (level) {
      case 'required': return 'success';
      case 'recommended': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Quality Standards Configuration"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Standard
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Standard Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Compliance</TableCell>
                      <TableCell>Applicable To</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standards.map((standard) => (
                      <TableRow key={standard.id}>
                        <TableCell>{standard.name}</TableCell>
                        <TableCell>{standard.description}</TableCell>
                        <TableCell>
                          <Chip label={standard.category} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={standard.complianceLevel === 'required' ? <CheckCircleIcon /> : <WarningIcon />}
                            label={standard.complianceLevel}
                            color={getComplianceColor(standard.complianceLevel)}
                          />
                        </TableCell>
                        <TableCell>{standard.applicableTo}</TableCell>
                        <TableCell>{standard.lastUpdated}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenDialog(standard)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(standard.id)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentStandard ? 'Edit Quality Standard' : 'Add New Quality Standard'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Standard Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Compliance Level</InputLabel>
                  <Select
                    name="complianceLevel"
                    value={formData.complianceLevel}
                    onChange={handleInputChange}
                    label="Compliance Level"
                    required
                  >
                    <MenuItem value="required">Required</MenuItem>
                    <MenuItem value="recommended">Recommended</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Applicable To</InputLabel>
                  <Select
                    name="applicableTo"
                    value={formData.applicableTo}
                    onChange={handleInputChange}
                    label="Applicable To"
                    required
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="instructors">Instructors</MenuItem>
                    <MenuItem value="content">Content</MenuItem>
                    <MenuItem value="assessments">Assessments</MenuItem>
                    <MenuItem value="processes">Processes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentStandard ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default QualityStandards;