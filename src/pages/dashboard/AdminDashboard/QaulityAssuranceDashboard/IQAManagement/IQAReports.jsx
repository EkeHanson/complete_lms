import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  IconButton,
  useTheme,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Assessment as ReportIcon,
  BarChart as ChartIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const IQAReports = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('monthly');
  const [timePeriod, setTimePeriod] = useState('last-30');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sample report data
  const summaryData = {
    totalAssessments: 124,
    completedAssessments: 98,
    pendingAssessments: 26,
    complianceRate: 89,
    averageScore: 82,
    observationsCompleted: 45,
    feedbackItems: 32
  };

  const recentActivities = [
    {
      id: 1,
      type: 'Assessment',
      course: 'React Advanced',
      trainer: 'John Smith',
      date: '2023-05-15',
      status: 'Completed',
      icon: <CompleteIcon color="success" />
    },
    {
      id: 2,
      type: 'Observation',
      course: 'Node.js Fundamentals',
      trainer: 'Sarah Johnson',
      date: '2023-05-14',
      status: 'Pending Review',
      icon: <WarningIcon color="warning" />
    },
    {
      id: 3,
      type: 'Feedback',
      course: 'Database Design',
      trainer: 'Michael Brown',
      date: '2023-05-12',
      status: 'Action Required',
      icon: <ErrorIcon color="error" />
    },
    {
      id: 4,
      type: 'Assessment',
      course: 'UI/UX Principles',
      trainer: 'Emily Davis',
      date: '2023-05-10',
      status: 'Completed',
      icon: <CompleteIcon color="success" />
    }
  ];

  const complianceData = [
    { standard: 'Assessment Quality', compliance: 92, target: 90 },
    { standard: 'Trainer Competency', compliance: 88, target: 85 },
    { standard: 'Content Accuracy', compliance: 95, target: 90 },
    { standard: 'Learner Feedback', compliance: 82, target: 80 },
    { standard: 'Documentation', compliance: 90, target: 85 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        IQA Reports & Analytics
      </Typography>

      {/* Report Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3
            }
          }}
        >
          <Tab label="Summary" />
          <Tab label="Compliance" />
          <Tab label="Detailed Reports" />
          <Tab label="Trend Analysis" />
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="last-30">Last 30 Days</MenuItem>
              <MenuItem value="last-90">Last 90 Days</MenuItem>
              <MenuItem value="ytd">Year to Date</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Assessments
                </Typography>
                <Typography variant="h4" component="div">
                  {summaryData.totalAssessments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {summaryData.completedAssessments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {summaryData.pendingAssessments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Compliance Rate
                </Typography>
                <Typography variant="h4" component="div">
                  {summaryData.complianceRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Recent IQA Activities"
                action={
                  <IconButton>
                    <FilterIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <List>
                  {recentActivities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        secondaryAction={
                          <Typography variant="body2" color="text.secondary">
                            {activity.date}
                          </Typography>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${activity.type} - ${activity.course}`}
                          secondary={`By ${activity.trainer}`}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Quick Stats" />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Assessment Score
                  </Typography>
                  <Typography variant="h4">
                    {summaryData.averageScore}/100
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Observations Completed
                  </Typography>
                  <Typography variant="h4">
                    {summaryData.observationsCompleted}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Feedback Items
                  </Typography>
                  <Typography variant="h4">
                    {summaryData.feedbackItems}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardHeader
            title="Compliance Report"
            subheader="Against Quality Standards"
            action={
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export Compliance Report
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Quality Standard</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Compliance (%)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Target (%)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Variance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complianceData.map((row) => (
                    <TableRow key={row.standard}>
                      <TableCell>{row.standard}</TableCell>
                      <TableCell align="right">{row.compliance}</TableCell>
                      <TableCell align="right">{row.target}</TableCell>
                      <TableCell align="right">
                        {row.compliance - row.target > 0 ? '+' : ''}
                        {row.compliance - row.target}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.compliance >= row.target ? 'Met' : 'Below Target'}
                          color={row.compliance >= row.target ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardHeader
            title="Detailed IQA Reports"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<DateIcon />}>
                  Select Date Range
                </Button>
                <Button variant="contained" startIcon={<DownloadIcon />}>
                  Generate Report
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select parameters to generate detailed IQA reports. Reports can be filtered by trainer, 
              course, assessment type, and date range.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Trainer</InputLabel>
                  <Select label="Select Trainer">
                    <MenuItem value="all">All Trainers</MenuItem>
                    <MenuItem value="john-smith">John Smith</MenuItem>
                    <MenuItem value="sarah-johnson">Sarah Johnson</MenuItem>
                    <MenuItem value="michael-brown">Michael Brown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Course</InputLabel>
                  <Select label="Select Course">
                    <MenuItem value="all">All Courses</MenuItem>
                    <MenuItem value="react-advanced">React Advanced</MenuItem>
                    <MenuItem value="node-fundamentals">Node.js Fundamentals</MenuItem>
                    <MenuItem value="database-design">Database Design</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<AssessmentIcon />}
                sx={{ px: 4 }}
              >
                Generate Custom Report
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && (
        <Card>
          <CardHeader
            title="Trend Analysis"
            subheader="Performance Over Time"
          />
          <CardContent>
            <Box sx={{ 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: theme.palette.grey[100],
              borderRadius: 1
            }}>
              <Typography color="text.secondary">
                [Trend charts and graphs would be displayed here]
              </Typography>
            </Box>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Key Observations
                </Typography>
                <Typography>
                  • Assessment quality has improved by 8% over the last quarter
                </Typography>
                <Typography>
                  • Trainer observations show consistent delivery standards
                </Typography>
                <Typography>
                  • Learner feedback scores have stabilized at 82% satisfaction
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <Typography>
                  • Continue monthly sampling of assessments
                </Typography>
                <Typography>
                  • Provide additional training on documentation standards
                </Typography>
                <Typography>
                  • Review feedback from learners requesting more practical examples
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default IQAReports;