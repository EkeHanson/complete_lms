import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Checkbox, Grid,
  IconButton, Tooltip, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, LinearProgress,
  Tab, Tabs, Card, CardContent, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Badge, Menu, Snackbar, Alert
} from '@mui/material';
import {
  Search, FilterList, FileCopy, BarChart, Refresh, 
  Visibility, Close, Assessment, Person, CalendarToday, 
  Check, Clear, ArrowBack, Download, Share,
  Warning, Error, CheckCircle, PieChart, Timeline
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Sample data
const assessmentData = [
  {
    id: 1,
    course: 'Health and Safety Level 2',
    trainer: 'John Smith',
    trainerAvatar: '/avatars/1.jpg',
    date: '2023-06-10',
    sampleSize: 5,
    sampled: 3,
    passRate: 80,
    status: 'completed',
    flagged: false,
    details: {
      totalLearners: 15,
      averageScore: 78,
      gradingCriteria: [
        { criterion: 'Knowledge', weight: 40, average: 82 },
        { criterion: 'Practical Skills', weight: 30, average: 75 },
        { criterion: 'Safety Awareness', weight: 30, average: 85 }
      ],
      sampledAssessments: [
        { id: 'A101', learner: 'Emma Watson', score: 85, passed: true, avatar: '/avatars/11.jpg' },
        { id: 'A102', learner: 'Daniel Radcliffe', score: 72, passed: true, avatar: '/avatars/12.jpg' },
        { id: 'A103', learner: 'Rupert Grint', score: 65, passed: false, avatar: '/avatars/13.jpg' }
      ],
      comments: [
        { user: 'Quality Auditor', date: '2023-06-11', text: 'Good overall performance, but practical skills need improvement' },
        { user: 'Trainer', date: '2023-06-12', text: 'Will conduct refresher session on manual handling techniques' }
      ]
    },
    analysis: {
      scoreDistribution: [
        { range: '90-100%', count: 2 },
        { range: '80-89%', count: 5 },
        { range: '70-79%', count: 4 },
        { range: '60-69%', count: 3 },
        { range: 'Below 60%', count: 1 }
      ],
      comparison: {
        previousAverage: 72,
        departmentAverage: 75,
        benchmark: 80
      },
      recommendations: [
        'Provide additional practical training',
        'Review assessment criteria for consistency',
        'Monitor learners with scores below 70%'
      ]
    }
  },
  {
    id: 2,
    course: 'First Aid at Work',
    trainer: 'Sarah Johnson',
    trainerAvatar: '/avatars/2.jpg',
    date: '2023-06-12',
    sampleSize: 8,
    sampled: 5,
    passRate: 60,
    status: 'completed',
    flagged: true,
    details: {
      totalLearners: 20,
      averageScore: 65,
      gradingCriteria: [
        { criterion: 'Theory', weight: 50, average: 70 },
        { criterion: 'Practical', weight: 50, average: 60 }
      ],
      sampledAssessments: [
        { id: 'A201', learner: 'Tom Hanks', score: 80, passed: true, avatar: '/avatars/21.jpg' },
        { id: 'A202', learner: 'Meryl Streep', score: 55, passed: false, avatar: '/avatars/22.jpg' },
        { id: 'A203', learner: 'Leonardo DiCaprio', score: 62, passed: false, avatar: '/avatars/23.jpg' }
      ],
      comments: [
        { user: 'Quality Auditor', date: '2023-06-13', text: 'Practical assessment scores significantly lower than theory' }
      ]
    },
    analysis: {
      scoreDistribution: [
        { range: '90-100%', count: 1 },
        { range: '80-89%', count: 3 },
        { range: '70-79%', count: 5 },
        { range: '60-69%', count: 6 },
        { range: 'Below 60%', count: 5 }
      ],
      comparison: {
        previousAverage: 68,
        departmentAverage: 70,
        benchmark: 75
      },
      recommendations: [
        'Review practical assessment criteria',
        'Provide additional hands-on practice sessions',
        'Consider trainer coaching'
      ]
    }
  }
];

const statusOptions = ['all', 'pending', 'in_progress', 'completed'];
const statusMap = {
  pending: { label: 'Pending', color: 'default' },
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Completed', color: 'success' }
};

const PassFailBadge = ({ passed }) => (
  passed ? (
    <Badge badgeContent={<Check fontSize="small" />} color="success" />
  ) : (
    <Badge badgeContent={<Clear fontSize="small" />} color="error" />
  )
);

export default function AssessmentSampling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [samplingPercentage, setSamplingPercentage] = useState(30);
  const [viewAssessment, setViewAssessment] = useState(null);
  const [analyzeAssessment, setAnalyzeAssessment] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredData = assessmentData.filter(assessment => {
    const matchesSearch = assessment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.trainer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSampling = () => {
    alert(`Sampling ${samplingPercentage}% of ${selected.length} selected assessments`);
  };

  const handleViewDetails = (assessment) => {
    setViewAssessment(assessment);
    setTabValue(0);
  };

  const handleAnalyze = (assessment) => {
    setAnalyzeAssessment(assessment);
    setTabValue(0);
  };

  const handleCloseDialog = () => {
    setViewAssessment(null);
    setAnalyzeAssessment(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportPDF = (contentId, fileName) => {
    const input = document.getElementById(contentId);
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
      setSnackbar({ open: true, message: 'PDF exported successfully', severity: 'success' });
    }).catch(err => {
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' });
      console.error('PDF export error:', err);
    });
  };

  const exportCSV = (data, fileName) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      const headers = Object.keys(data[0]);
      csvContent += headers.join(",") + "\r\n";
      
      // Add data
      data.forEach(item => {
        const row = headers.map(header => {
          // Handle nested objects
          if (typeof item[header] === 'object') {
            return JSON.stringify(item[header]);
          }
          return `"${item[header]}"`;
        }).join(",");
        csvContent += row + "\r\n";
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: 'CSV exported successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to export CSV', severity: 'error' });
      console.error('CSV export error:', err);
    }
  };

  const handleExportDetails = (format) => {
    handleExportClose();
    if (!viewAssessment) return;

    if (format === 'pdf') {
      exportPDF('details-content', `Assessment-Details-${viewAssessment.course.replace(/\s+/g, '-')}`);
    } else if (format === 'csv') {
      const csvData = [
        { 
          Course: viewAssessment.course,
          Trainer: viewAssessment.trainer,
          Date: viewAssessment.date,
          'Sample Size': `${viewAssessment.sampled}/${viewAssessment.sampleSize}`,
          'Pass Rate': `${viewAssessment.passRate}%`,
          'Average Score': `${viewAssessment.details.averageScore}%`
        },
        ...viewAssessment.details.sampledAssessments.map(item => ({
          'Learner ID': item.id,
          Learner: item.learner,
          Score: `${item.score}%`,
          Status: item.passed ? 'Passed' : 'Failed'
        }))
      ];
      exportCSV(csvData, `Assessment-Details-${viewAssessment.course.replace(/\s+/g, '-')}`);
    }
  };

  const handleExportAnalysis = (format) => {
    handleExportClose();
    if (!analyzeAssessment) return;

    if (format === 'pdf') {
      exportPDF('analysis-content', `Assessment-Analysis-${analyzeAssessment.course.replace(/\s+/g, '-')}`);
    } else if (format === 'csv') {
      const csvData = [
        { 
          Metric: 'Average Score', 
          Value: `${analyzeAssessment.details.averageScore}%`,
          Comparison: `Previous: ${analyzeAssessment.analysis.comparison.previousAverage}%`
        },
        { 
          Metric: 'Pass Rate', 
          Value: `${analyzeAssessment.passRate}%`,
          Comparison: `Department: ${analyzeAssessment.analysis.comparison.departmentAverage}%`
        },
        { 
          Metric: 'Benchmark', 
          Value: `${analyzeAssessment.analysis.comparison.benchmark}%`,
          Comparison: ''
        },
        ...analyzeAssessment.analysis.recommendations.map((rec, index) => ({
          Metric: `Recommendation ${index + 1}`,
          Value: rec,
          Comparison: ''
        }))
      ];
      exportCSV(csvData, `Assessment-Analysis-${analyzeAssessment.course.replace(/\s+/g, '-')}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Table View */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Assessment Sampling
      </Typography>
      
      {/* Search and Filter Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'all' ? 'All Statuses' : statusMap[option].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => alert('Advanced filters coming soon')}
          >
            Filters
          </Button>
        </Grid>
      </Grid>
      
      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          {selected.length > 0 ? `${selected.length} selected` : `${filteredData.length} assessments`}
        </Typography>
        
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <FormControl size="small" sx={{ width: 120, mr: 1 }}>
            <InputLabel>Sample %</InputLabel>
            <Select
              value={samplingPercentage}
              onChange={(e) => setSamplingPercentage(e.target.value)}
              label="Sample %"
            >
              {[10, 20, 30, 40, 50].map((percent) => (
                <MenuItem key={percent} value={percent}>{percent}%</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileCopy />}
            onClick={handleSampling}
            disabled={selected.length === 0}
          >
            Sample Selected
          </Button>
        </Box>
      </Box>
      
      {/* Assessments Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredData.length}
                  checked={filteredData.length > 0 && selected.length === filteredData.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Sample Size</TableCell>
              <TableCell align="center">Sampled</TableCell>
              <TableCell align="center">Pass Rate</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => {
              const isItemSelected = isSelected(row.id);
              return (
                <TableRow
                  key={row.id}
                  hover
                  selected={isItemSelected}
                  sx={row.flagged ? { backgroundColor: 'error.light' } : {}}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelect(row.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {row.flagged && <Warning color="error" sx={{ mr: 1 }} />}
                      {row.course}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={row.trainerAvatar} sx={{ width: 24, height: 24, mr: 1 }} />
                      {row.trainer}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.date}</TableCell>
                  <TableCell align="center">{row.sampleSize}</TableCell>
                  <TableCell align="center">
                    {row.sampled}/{row.sampleSize}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      color: row.passRate >= 70 ? 'success.main' : row.passRate >= 50 ? 'warning.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {row.passRate > 0 ? `${row.passRate}%` : '-'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusMap[row.status].label}
                      color={statusMap[row.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(row)}
                        color="primary"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Analyze">
                      <IconButton 
                        size="small" 
                        onClick={() => handleAnalyze(row)}
                        color="secondary"
                      >
                        <BarChart fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewAssessment}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white', mr: 1 }}>
              <ArrowBack />
            </IconButton>
            Assessment Details: {viewAssessment?.course}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {viewAssessment && (
            <Box id="details-content">
              {/* Header with key info */}
              <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={viewAssessment.trainerAvatar} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">Trainer</Typography>
                        <Typography variant="h6">{viewAssessment.trainer}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">Assessment Date</Typography>
                        <Typography>{viewAssessment.date}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1">Sample Size</Typography>
                        <Typography variant="h6">
                          {viewAssessment.sampled}/{viewAssessment.sampleSize}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">Pass Rate</Typography>
                        <Typography variant="h6" sx={{ 
                          color: viewAssessment.passRate >= 70 ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          {viewAssessment.passRate}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">Average Score</Typography>
                        <Typography variant="h6">
                          {viewAssessment.details.averageScore}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabs for different sections */}
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3, pt: 2 }}>
                <Tab label="Sampled Assessments" />
                <Tab label="Grading Criteria" />
                <Tab label="Comments" />
              </Tabs>
              <Divider />

              {/* Tab content */}
              <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Learner</TableCell>
                          <TableCell align="center">Score</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewAssessment.details.sampledAssessments.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={item.avatar} sx={{ width: 24, height: 24, mr: 2 }} />
                                {item.learner}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography fontWeight="bold">{item.score}%</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <PassFailBadge passed={item.passed} />
                            </TableCell>
                            <TableCell align="center">
                              <Button size="small" variant="outlined">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Grading Breakdown
                    </Typography>
                    {viewAssessment.details.gradingCriteria.map((criteria) => (
                      <Box key={criteria.criterion} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>
                            {criteria.criterion} ({criteria.weight}%)
                          </Typography>
                          <Typography>
                            Average: {criteria.average}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={criteria.average}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: criteria.average >= 70 ? 'success.main' : 
                                            criteria.average >= 50 ? 'warning.main' : 'error.main'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {tabValue === 2 && (
                  <List>
                    {viewAssessment.details.comments.map((comment, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>{comment.user.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={comment.user}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {comment.date}
                                </Typography>
                                {` — ${comment.text}`}
                              </>
                            }
                          />
                        </ListItem>
                        {index < viewAssessment.details.comments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            startIcon={<Download />}
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={handleExportClick}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExportDetails('pdf')}>Export as PDF</MenuItem>
            <MenuItem onClick={() => handleExportDetails('csv')}>Export as CSV</MenuItem>
          </Menu>
          <Button 
            startIcon={<Share />}
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setSnackbar({ open: true, message: 'Share functionality coming soon', severity: 'info' });
            }}
          >
            Share
          </Button>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analyze Dialog */}
      <Dialog
        open={!!analyzeAssessment}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white', mr: 1 }}>
              <ArrowBack />
            </IconButton>
            Analysis: {analyzeAssessment?.course}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {analyzeAssessment && (
            <Box id="analysis-content">
              {/* Summary Cards */}
              <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Average Score
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main' }}>
                          {analyzeAssessment.details.averageScore}%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.previousAverage ? (
                            <CheckCircle color="success" sx={{ mr: 0.5 }} />
                          ) : (
                            <Error color="error" sx={{ mr: 0.5 }} />
                          )}
                          <Typography variant="caption">
                            {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.previousAverage ? 
                              'Up from previous' : 'Down from previous'} ({analyzeAssessment.analysis.comparison.previousAverage}%)
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pass Rate
                        </Typography>
                        <Typography variant="h4" sx={{ color: analyzeAssessment.passRate >= 70 ? 'success.main' : 'error.main' }}>
                          {analyzeAssessment.passRate}%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Assessment color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {analyzeAssessment.sampled}/{analyzeAssessment.sampleSize} sampled
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Benchmark Comparison
                        </Typography>
                        <Typography variant="h4">
                          {analyzeAssessment.analysis.comparison.benchmark}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={analyzeAssessment.details.averageScore}
                          sx={{ 
                            height: 8,
                            mt: 2,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: analyzeAssessment.details.averageScore >= 
                                analyzeAssessment.analysis.comparison.benchmark ? 'success.main' : 'error.main'
                            }
                          }}
                        />
                        <Typography variant="caption" display="block" textAlign="right">
                          Your average: {analyzeAssessment.details.averageScore}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Department Comparison
                        </Typography>
                        <Typography variant="h4">
                          {analyzeAssessment.analysis.comparison.departmentAverage}%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.departmentAverage ? (
                            <CheckCircle color="success" sx={{ mr: 0.5 }} />
                          ) : (
                            <Error color="error" sx={{ mr: 0.5 }} />
                          )}
                          <Typography variant="caption">
                            {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.departmentAverage ? 
                              'Above' : 'Below'} department average
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Analysis Tabs */}
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3, pt: 2 }}>
                <Tab label="Score Distribution" icon={<PieChart fontSize="small" />} />
                <Tab label="Trend Analysis" icon={<Timeline fontSize="small" />} />
                <Tab label="Recommendations" icon={<CheckCircle fontSize="small" />} />
              </Tabs>
              <Divider />

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Score Distribution
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Score Ranges
                            </Typography>
                            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box sx={{ 
                                width: '100%', 
                                height: '80%', 
                                bgcolor: 'grey.100', 
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Typography color="text.secondary">
                                  Pie chart showing score distribution
                                </Typography>
                              </Box>
                            </Box>
                            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Score Range</TableCell>
                                    <TableCell align="right">Number of Learners</TableCell>
                                    <TableCell align="right">Percentage</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {analyzeAssessment.analysis.scoreDistribution.map((item) => (
                                    <TableRow key={item.range}>
                                      <TableCell>{item.range}</TableCell>
                                      <TableCell align="right">{item.count}</TableCell>
                                      <TableCell align="right">
                                        {Math.round((item.count / analyzeAssessment.details.totalLearners) * 100)}%
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Weakest Areas
                            </Typography>
                            <List>
                              {analyzeAssessment.details.gradingCriteria
                                .sort((a, b) => a.average - b.average)
                                .slice(0, 3)
                                .map((criteria, index) => (
                                  <ListItem key={index}>
                                    <ListItemAvatar>
                                      <Avatar sx={{ 
                                        bgcolor: criteria.average >= 70 ? 'success.light' : 
                                                criteria.average >= 50 ? 'warning.light' : 'error.light',
                                        color: criteria.average >= 70 ? 'success.dark' : 
                                              criteria.average >= 50 ? 'warning.dark' : 'error.dark'
                                      }}>
                                        {index + 1}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={criteria.criterion}
                                      secondary={`Average: ${criteria.average}% (Weight: ${criteria.weight}%)`}
                                    />
                                  </ListItem>
                                ))}
                            </List>
                            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                              * Lowest scoring criteria highlighted above
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Trend Analysis
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box sx={{ 
                            width: '100%', 
                            height: '80%', 
                            bgcolor: 'grey.100', 
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography color="text.secondary">
                              Line chart showing performance trends over time
                            </Typography>
                          </Box>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">Comparison to Previous</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.previousAverage ? (
                                <CheckCircle color="success" sx={{ mr: 1 }} />
                              ) : (
                                <Error color="error" sx={{ mr: 1 }} />
                              )}
                              <Typography>
                                {Math.abs(analyzeAssessment.details.averageScore - analyzeAssessment.analysis.comparison.previousAverage)}%
                                {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.previousAverage ? 
                                  ' improvement' : ' decline'} from previous assessment
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">Department Benchmark</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.departmentAverage ? (
                                <CheckCircle color="success" sx={{ mr: 1 }} />
                              ) : (
                                <Error color="error" sx={{ mr: 1 }} />
                              )}
                              <Typography>
                                {Math.abs(analyzeAssessment.details.averageScore - analyzeAssessment.analysis.comparison.departmentAverage)}%
                                {analyzeAssessment.details.averageScore > analyzeAssessment.analysis.comparison.departmentAverage ? 
                                  ' above' : ' below'} department average
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <List>
                          {analyzeAssessment.analysis.recommendations.map((rec, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={rec}
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Next Steps
                          </Typography>
                          <Typography>
                            Based on this analysis, we recommend prioritizing the first 2-3 recommendations
                            and scheduling a follow-up review in 2 weeks to assess progress.
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            startIcon={<Download />}
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={handleExportClick}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExportAnalysis('pdf')}>Export as PDF</MenuItem>
            <MenuItem onClick={() => handleExportAnalysis('csv')}>Export as CSV</MenuItem>
          </Menu>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>


        
      </Dialog>

      {/* Snackbar for export notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}