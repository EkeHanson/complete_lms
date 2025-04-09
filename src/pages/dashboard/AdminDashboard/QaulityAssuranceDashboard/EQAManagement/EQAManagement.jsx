import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer, // Added this import
  Chip,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  AssignmentTurnedIn as AccreditationIcon,
  CloudUpload as EvidenceIcon,
  Feedback as FeedbackIcon,
  Gavel as ComplianceIcon,
  Event as DeadlineIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import AccreditationStatus from './AccreditationStatus';
import EvidenceSubmission from './EvidenceSubmission';
import EQAFeedback from './EQAFeedback';
import ComplianceChecks from './ComplianceChecks';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`eqa-tabpanel-${index}`}
      aria-labelledby={`eqa-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function EQAManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sample data for EQA requirements
  const eqaRequirements = [
    { id: 1, name: 'Trainer Qualifications', status: 'Complete', deadline: '2023-07-01' },
    { id: 2, name: 'Assessment Samples', status: 'Pending', deadline: '2023-07-15' },
    { id: 3, name: 'IQA Records', status: 'In Progress', deadline: '2023-07-10' },
    { id: 4, name: 'Facility Standards', status: 'Not Started', deadline: '2023-08-01' },
  ];

  // Sample audit history
  const auditHistory = [
    { id: 1, date: '2023-05-15', type: 'Full Audit', result: 'Passed with conditions' },
    { id: 2, date: '2022-11-20', type: 'Spot Check', result: 'Passed' },
    { id: 3, date: '2022-05-10', type: 'Full Audit', result: 'Passed' },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="External Quality Assurance"
              subheader="Manage accreditation and external audits"
              action={
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  size="small"
                >
                  New EQA Submission
                </Button>
              }
            />
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                size="small"
                placeholder="Search EQA records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button startIcon={<FilterIcon />}>Filters</Button>
            </Box>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Accreditation" icon={<AccreditationIcon fontSize="small" />} />
              <Tab label="Evidence" icon={<EvidenceIcon fontSize="small" />} />
              <Tab label="Feedback" icon={<FeedbackIcon fontSize="small" />} />
              <Tab label="Compliance" icon={<ComplianceIcon fontSize="small" />} />
            </Tabs>
            <Divider />
            <TabPanel value={tabValue} index={0}>
              <AccreditationStatus />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <EvidenceSubmission />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <EQAFeedback />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <ComplianceChecks />
            </TabPanel>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="EQA Requirements" 
              action={
                <Badge badgeContent={2} color="error">
                  <DeadlineIcon color="action" />
                </Badge>
              }
            />
            <Divider />
            <CardContent>
              <List dense>
                {eqaRequirements.map((req) => (
                  <ListItem key={req.id} secondaryAction={
                    <Chip 
                      label={req.status}
                      size="small"
                      color={
                        req.status === 'Complete' ? 'success' :
                        req.status === 'Pending' ? 'error' :
                        req.status === 'In Progress' ? 'warning' : 'default'
                      }
                    />
                  }>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: 
                          req.status === 'Complete' ? 'success.light' :
                          req.status === 'Pending' ? 'error.light' :
                          req.status === 'In Progress' ? 'warning.light' : 'grey.300',
                        color: 'common.white'
                      }}>
                        {req.status === 'Complete' ? <CompleteIcon /> :
                         req.status === 'Pending' ? <WarningIcon /> : req.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={req.name}
                      secondary={`Due: ${req.deadline}`}
                    />
                  </ListItem>
                ))}
              </List>
              <LinearProgress 
                variant="determinate" 
                value={45} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                45% of requirements completed
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Audit History" />
            <Divider />
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditHistory.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>{audit.date}</TableCell>
                      <TableCell>{audit.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={audit.result}
                          size="small"
                          color={
                            audit.result.includes('Passed') ? 'success' : 'warning'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="EQA Contacts" />
            <Divider />
            <CardContent>
              <Button 
                variant="contained" 
                fullWidth
                sx={{ mb: 2 }}
              >
                Contact Accreditor
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
              >
                Request Support
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EQAManagement;