import React, { useState } from 'react';
import {
  Box,  Container,  Typography,  Grid,  Paper,  Table,
  TableBody,  TableCell,  TableContainer,  TableHead,
  TableRow,  TablePagination,  Avatar,  Chip,  TextField,  MenuItem,
  Divider,  IconButton,  useTheme,  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,  PersonAdd as PersonAddIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon,  Lock as SuspendedIcon,
  Schedule as PendingIcon,  Search as SearchIcon,
  FilterList as FilterIcon,  Refresh as RefreshIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const AdminUserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Mock data - replace with API calls
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2023-06-15T14:30:00Z',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      signupDate: '2023-01-10',
      loginAttempts: 0
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'vendor',
      status: 'active',
      lastLogin: '2023-06-14T09:15:00Z',
      ip: '203.0.113.42',
      device: 'Safari on Mac',
      signupDate: '2023-02-15',
      loginAttempts: 0
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael@example.com',
      role: 'customer',
      status: 'pending',
      lastLogin: null,
      ip: null,
      device: null,
      signupDate: '2023-06-01',
      loginAttempts: 0
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily@example.com',
      role: 'customer',
      status: 'suspended',
      lastLogin: '2023-06-10T18:45:00Z',
      ip: '198.51.100.15',
      device: 'Firefox on Windows',
      signupDate: '2023-03-22',
      loginAttempts: 5
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'vendor',
      status: 'active',
      lastLogin: '2023-06-15T11:20:00Z',
      ip: '203.0.113.75',
      device: 'Chrome on Android',
      signupDate: '2023-04-05',
      loginAttempts: 0
    }
  ]);

  // Stats data
  const stats = [
    { 
      title: 'Total Users', 
      value: '1,248', 
      icon: <PeopleIcon fontSize="large" />,
      change: '+12% from last month'
    },
    { 
      title: 'Active Users', 
      value: '843', 
      icon: <ActiveIcon fontSize="large" />,
      change: 'Active in last 30 days'
    },
    { 
      title: 'New Signups', 
      value: '128', 
      icon: <PersonAddIcon fontSize="large" />,
      change: 'This month'
    },
    { 
      title: 'Suspicious Activity', 
      value: '23', 
      icon: <WarningIcon fontSize="large" />,
      change: 'Failed login attempts'
    }
  ];

  // Filters state
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    dateFrom: null,
    dateTo: null
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filters change
  };

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    return (
      (filters.role === 'all' || user.role === filters.role) &&
      (filters.status === 'all' || user.status === filters.status) &&
      (filters.search === '' || 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.dateFrom || new Date(user.signupDate) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(user.signupDate) <= new Date(filters.dateTo))
    );
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status chip component
  const StatusChip = ({ status }) => {
    const statusMap = {
      active: { color: 'success', icon: <ActiveIcon fontSize="small" /> },
      pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
      suspended: { color: 'error', icon: <SuspendedIcon fontSize="small" /> }
    };
    
    return (
      <Chip
        icon={statusMap[status]?.icon}
        label={status}
        color={statusMap[status]?.color || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  // Role chip component
  const RoleChip = ({ role }) => {
    const roleMap = {
      admin: { color: 'primary', label: 'Admin' },
      vendor: { color: 'secondary', label: 'Vendor' },
      customer: { color: 'default', label: 'Customer' }
    };
    
    return (
      <Chip
        label={roleMap[role]?.label || role}
        color={roleMap[role]?.color || 'default'}
        size="small"
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          User Management
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {stat.title}
                  </Typography>
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.main
                  }}>
                    {stat.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.change}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Filters Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Role"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
              <DatePicker
                label="From"
                value={filters.dateFrom}
                onChange={(newValue) => handleFilterChange('dateFrom', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
              <DatePicker
                label="To"
                value={filters.dateTo}
                onChange={(newValue) => handleFilterChange('dateTo', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
              <IconButton>
                <RefreshIcon />
              </IconButton>
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>

        {/* Users Table */}
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Signup Date</TableCell>
                  <TableCell>Login Attempts</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              mr: 2,
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.main
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <RoleChip role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={user.status} />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <>
                            <Typography variant="body2">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.ip} • {user.device}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Never logged in
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.signupDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.loginAttempts > 0 ? (
                          <Chip 
                            label={user.loginAttempts} 
                            color="error" 
                            size="small" 
                            variant="outlined" 
                          />
                        ) : (
                          <Typography variant="body2">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* User Roles & Permissions Summary */}
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            User Roles & Permissions Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Administrators
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  5 users • Full system access
                </Typography>
                <Typography variant="caption">
                  Can manage all users, listings, and system settings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Vendors
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  342 users • Can post and manage listings
                </Typography>
                <Typography variant="caption">
                  Can create listings, manage bookings, and view earnings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Customers
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  901 users • Can browse and book items
                </Typography>
                <Typography variant="caption">
                  Can search listings, make bookings, and leave reviews
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminUserManagement;