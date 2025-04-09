import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  Avatar,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Restore as RestoreIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DocumentIcon
} from '@mui/icons-material';

const AuditTrail = () => {
  const theme = useTheme();
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Sample data - in a real app this would come from an API
  useEffect(() => {
    const sampleLogs = [
      {
        id: 1,
        action: 'Standard Updated',
        description: 'Updated "Assessment Fairness" standard',
        entity: 'Quality Standard',
        entityId: 1,
        user: { name: 'Admin User', email: 'admin@example.com' },
        timestamp: '2023-06-15T14:30:22Z',
        status: 'completed',
        details: { changes: [{ field: 'description', old: 'Old description', new: 'New description' }] }
      },
      {
        id: 2,
        action: 'IQA Performed',
        description: 'Conducted internal quality check on course "Advanced React"',
        entity: 'Course',
        entityId: 42,
        user: { name: 'Quality Officer', email: 'qa@example.com' },
        timestamp: '2023-06-14T09:15:10Z',
        status: 'completed',
        details: { findings: 'Minor issues found', resolution: 'Issues addressed' }
      },
      {
        id: 3,
        action: 'EQA Submission',
        description: 'Submitted evidence for external quality assurance',
        entity: 'Accreditation',
        entityId: 2023,
        user: { name: 'Compliance Manager', email: 'compliance@example.com' },
        timestamp: '2023-06-12T16:45:33Z',
        status: 'pending',
        details: { documents: ['report.pdf', 'evidence.zip'] }
      },
      {
        id: 4,
        action: 'Standard Created',
        description: 'Created new standard "Content Review Cycle"',
        entity: 'Quality Standard',
        entityId: 3,
        user: { name: 'Admin User', email: 'admin@example.com' },
        timestamp: '2023-06-10T11:20:05Z',
        status: 'completed',
        details: { standard: { name: 'Content Review Cycle', category: 'Content' } }
      },
      {
        id: 5,
        action: 'Audit Started',
        description: 'Initiated quarterly quality audit',
        entity: 'Audit',
        entityId: 'Q2-2023',
        user: { name: 'Audit Team', email: 'audit@example.com' },
        timestamp: '2023-06-08T08:00:00Z',
        status: 'in-progress',
        details: { scope: 'All training courses', deadline: '2023-06-30' }
      }
    ];
    setAuditLogs(sampleLogs);
    setFilteredLogs(sampleLogs);
  }, []);

  useEffect(() => {
    const filtered = auditLogs.filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [searchTerm, auditLogs]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setFilteredLogs(auditLogs);
    } else if (newValue === 1) {
      setFilteredLogs(auditLogs.filter(log => log.entity === 'Quality Standard'));
    } else if (newValue === 2) {
      setFilteredLogs(auditLogs.filter(log => log.entity === 'Course'));
    } else if (newValue === 3) {
      setFilteredLogs(auditLogs.filter(log => log.entity === 'Accreditation'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Quality Assurance Audit Trail"
              subheader="Complete history of all quality-related activities"
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search audit logs..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Tooltip title="Filter">
                    <IconButton>
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export">
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ mb: 3 }}
              >
                <Tab label="All Activities" />
                <Tab label="Standards" />
                <Tab label="Courses" />
                <Tab label="Accreditation" />
              </Tabs>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{log.action}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.entity} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">{log.user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(log.timestamp)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            color={getStatusColor(log.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Revert">
                            <IconButton size="small">
                              <RestoreIcon fontSize="small" />
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
    </Box>
  );
};

export default AuditTrail;