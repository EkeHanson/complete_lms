import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,  Typography,  Grid,  Paper,  Divider,  LinearProgress,
  Chip,  List,  ListItem,  ListItemText,  ListItemIcon,  Table,
  TableBody,  TableCell,
  TableContainer,  TableHead,  TableRow,  IconButton,
  Tooltip,  useTheme,  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,  Warning as WarningIcon,
  Error as ErrorIcon,  Info as InfoIcon,  CheckCircle as CheckIcon,  Storage as DatabaseIcon,
  Api as ApiIcon,  Memory as MemoryIcon,
  DiscFull as StorageIcon,  Speed as CpuIcon,
  Timeline as TimelineIcon,  NotificationsActive as AlertsIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

// Mock data - replace with actual API calls
const mockData = {
  uptime: {
    percentage: 99.98,
    history: [
      { day: 'Mon', uptime: 100 },
      { day: 'Tue', uptime: 100 },
      { day: 'Wed', uptime: 99.9 },
      { day: 'Thu', uptime: 100 },
      { day: 'Fri', uptime: 99.8 },
      { day: 'Sat', uptime: 100 },
      { day: 'Sun', uptime: 100 }
    ]
  },
  responseTimes: {
    average: 142,
    history: [
      { hour: '00:00', time: 120 },
      { hour: '04:00', time: 110 },
      { hour: '08:00', time: 150 },
      { hour: '12:00', time: 180 },
      { hour: '16:00', time: 160 },
      { hour: '20:00', time: 130 }
    ]
  },
  database: {
    size: '245 GB',
    growth: '12 GB/week',
    tables: 42,
    issues: 2
  },
  errors: [
    { id: 1, type: 'warning', message: 'High CPU usage detected', timestamp: '2023-06-15 14:30', service: 'API Server' },
    { id: 2, type: 'error', message: 'Payment gateway timeout', timestamp: '2023-06-15 11:15', service: 'Payment Service' },
    { id: 3, type: 'info', message: 'Scheduled maintenance completed', timestamp: '2023-06-14 03:00', service: 'System' },
    { id: 4, type: 'warning', message: 'Database connection pool 80% full', timestamp: '2023-06-13 09:45', service: 'Database' }
  ],
  resources: {
    cpu: 65,
    memory: 78,
    storage: 45
  },
  thirdParty: [
    { name: 'Stripe API', status: 'operational', responseTime: 120 },
    { name: 'Google Maps', status: 'degraded', responseTime: 320 },
    { name: 'Twilio SMS', status: 'operational', responseTime: 180 },
    { name: 'AWS S3', status: 'operational', responseTime: 90 }
  ]
};

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockData);

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(mockData); // In real app, replace with actual data fetch
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();
    // Set up polling in real app
    // const interval = setInterval(refreshData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'outage': return 'error';
      default: return 'info';
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <InfoIcon color="info" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          System Performance & Health
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={refreshData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* System Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Server Uptime */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">Server Uptime</Typography>
              <CheckIcon color="success" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {data.uptime.percentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 7 days availability
            </Typography>
            <Box sx={{ height: 100, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.uptime.history}>
                  <Line 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Response Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">Avg Response Time</Typography>
              <TimelineIcon color="info" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {data.responseTimes.average}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API response latency
            </Typography>
            <Box sx={{ height: 100, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.responseTimes.history}>
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke={theme.palette.info.main} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Database Health */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">Database Health</Typography>
              <DatabaseIcon color={data.database.issues > 0 ? "warning" : "success"} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {data.database.size}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {data.database.tables} tables • {data.database.growth}
            </Typography>
            <Chip 
              label={`${data.database.issues} issues`} 
              size="small" 
              color={data.database.issues > 0 ? "warning" : "success"} 
              variant="outlined"
            />
          </Paper>
        </Grid>

        {/* System Resources */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">System Resources</Typography>
              <MemoryIcon color="info" />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  <CpuIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  CPU
                </Typography>
                <Typography variant="body2">{data.resources.cpu}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.resources.cpu} 
                color={data.resources.cpu > 80 ? "error" : data.resources.cpu > 60 ? "warning" : "primary"}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  <MemoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Memory
                </Typography>
                <Typography variant="body2">{data.resources.memory}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.resources.memory} 
                color={data.resources.memory > 80 ? "error" : data.resources.memory > 60 ? "warning" : "primary"}
              />
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  <StorageIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Storage
                </Typography>
                <Typography variant="body2">{data.resources.storage}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.resources.storage} 
                color={data.resources.storage > 80 ? "error" : data.resources.storage > 60 ? "warning" : "primary"}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Error Logs & Third-party Status */}
      <Grid container spacing={3}>
        {/* Error Logs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AlertsIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Error Logs & Alerts</Typography>
            </Box>
            <List dense>
              {data.errors.map((error) => (
                <ListItem key={error.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <ListItemIcon>
                    {getErrorIcon(error.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={error.message}
                    secondary={`${error.timestamp} • ${error.service}`}
                    primaryTypographyProps={{ 
                      color: error.type === 'error' ? 'error' : error.type === 'warning' ? 'text.primary' : 'text.secondary',
                      fontWeight: error.type === 'error' ? 600 : 'normal'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Third-party API Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ApiIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Third-party API Status</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.thirdParty.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={service.status} 
                          size="small" 
                          color={getStatusColor(service.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{service.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;