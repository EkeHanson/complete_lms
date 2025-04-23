import React, { useState, useEffect } from 'react';
import {
  Box,Typography,Grid,Card,CardContent,CardHeader,Divider,Table,TableBody,TableCell,
  TableContainer,TableHead,TableRow,Paper,TextField,IconButton,Tooltip,Chip,Avatar,
  Tabs,Tab,Button,Dialog,DialogTitle,DialogContent,DialogActions} from '@mui/material';
  
import {Search as SearchIcon,Download as DownloadIcon,Visibility as VisibilityIcon,
  Restore as RestoreIcon,CalendarToday as CalendarIcon,Person as PersonIcon,
  Description as DocumentIcon, FilterAlt as FilterIcon} from '@mui/icons-material';

// Mock API service (replace with real API calls)
const fetchAuditLogs = async () => {
  return [
    {
      id: 1,
      action: 'Standard Updated',
      description: 'Updated "Assessment Fairness" standard to v2.1',
      entity: 'Quality Standard',
      entityId: 'QS-101',
      user: { name: 'Admin User', avatar: 'A', role: 'Quality Manager' },
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'completed',
      changes: [
        { field: 'description', old: 'Old description text', new: 'New description text' },
        { field: 'review_frequency', old: 'Annual', new: 'Quarterly' }
      ],
      relatedTo: { type: 'IQA', id: 'IQA-2023-045' }
    },
    {
      id: 2,
      action: 'Sampling Completed',
      description: 'Performed risk-based sampling for course "Advanced React"',
      entity: 'Course',
      entityId: 'CRS-205',
      user: { name: 'QA Officer', avatar: 'Q', role: 'IQA Lead' },
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'completed',
      sampleSize: '35%',
      riskLevel: 'Medium',
      findings: '2 inconsistencies found',
      relatedTo: { type: 'EQA', id: 'EQA-2023-Q2' }
    },
    {
      id: 3,
      action: 'EQA Evidence Submitted',
      description: 'Uploaded compliance documents for Ofqual review',
      entity: 'Accreditation',
      entityId: 'OFQUAL-2023',
      user: { name: 'Compliance Officer', avatar: 'C', role: 'EQA Manager' },
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      status: 'pending',
      documents: ['compliance_report.pdf', 'sampling_evidence.zip'],
      deadline: '2023-12-15'
    }
  ];
};

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    userRole: null
  });

  useEffect(() => {
    const loadData = async () => {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
      setFilteredLogs(logs);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = auditLogs.filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (tabValue === 1) filtered = filtered.filter(log => log.entity === 'Quality Standard');
    if (tabValue === 2) filtered = filtered.filter(log => log.entity === 'Course');
    if (tabValue === 3) filtered = filtered.filter(log => log.entity === 'Accreditation');

    setFilteredLogs(filtered);
  }, [searchTerm, auditLogs, tabValue, filters]);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleExport = () => {
    // In a real app, this would generate a CSV/PDF
    console.log('Exporting audit trail...');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    const statusMap = {
      completed: { color: 'success', label: 'Completed' },
      pending: { color: 'warning', label: 'Pending' },
      'in-progress': { color: 'info', label: 'In Progress' }
    };
    return (
      <Chip
        label={statusMap[status]?.label || status}
        color={statusMap[status]?.color || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Quality Assurance Audit Trail"
              subheader="Track all quality-related activities across IQA and EQA processes"
              action={
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Search logs..."
                    InputProps={{
                      startAdornment: (
                        <SearchIcon color="action" />
                      ),
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Tooltip title="Advanced Filters">
                    <IconButton>
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="All Activities" />
                <Tab label="Standards" />
                <Tab label="Courses" />
                <Tab label="Accreditation" />
              </Tabs>

              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="15%">Action</TableCell>
                      <TableCell width="30%">Description</TableCell>
                      <TableCell width="10%">Entity</TableCell>
                      <TableCell width="15%">User</TableCell>
                      <TableCell width="15%">Timestamp</TableCell>
                      <TableCell width="10%">Status</TableCell>
                      <TableCell width="5%" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{log.action}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>
                          <Chip label={log.entity} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                              {log.user.avatar}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{log.user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.user.role}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(log.timestamp)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(log.status)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(log)}>
                              <VisibilityIcon fontSize="small" />
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

      {/* Audit Log Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedLog && (
          <>
            <DialogTitle>
              {selectedLog.action} - {selectedLog.entity} {selectedLog.entityId}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Details</Typography>
                  <Typography variant="body2" paragraph>{selectedLog.description}</Typography>
                  
                  <Box mt={2}>
                    <Typography variant="subtitle2">User Information</Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                        {selectedLog.user.avatar}
                      </Avatar>
                      <Box>
                        <Typography>{selectedLog.user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedLog.user.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Metadata</Typography>
                  <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                    <Box>
                      <Typography variant="subtitle2">Status</Typography>
                      {getStatusChip(selectedLog.status)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Timestamp</Typography>
                      <Typography>{formatDate(selectedLog.timestamp)}</Typography>
                    </Box>
                    {selectedLog.relatedTo && (
                      <Box gridColumn="span 2">
                        <Typography variant="subtitle2">Related To</Typography>
                        <Chip 
                          label={`${selectedLog.relatedTo.type}: ${selectedLog.relatedTo.id}`}
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>

                  {selectedLog.changes && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>Changes Made</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Field</TableCell>
                              <TableCell>Old Value</TableCell>
                              <TableCell>New Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedLog.changes.map((change, index) => (
                              <TableRow key={index}>
                                <TableCell>{change.field}</TableCell>
                                <TableCell sx={{ color: 'error.main' }}>{change.old}</TableCell>
                                <TableCell sx={{ color: 'success.main' }}>{change.new}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button variant="contained" color="primary">
                View Related Documents
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AuditTrail;