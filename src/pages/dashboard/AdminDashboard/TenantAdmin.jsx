import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Box, Button, Card, CardContent, TextField,
  Modal, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Divider, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupIcon from '@mui/icons-material/Group';
import { API_BASE_URL } from '../../../config';
import TenantDetails from './TenantDetails';
import './TenantAdmin.css';

// Axios request interceptor for debugging
axios.interceptors.request.use((config) => {
 // console.log('Axios request payload:', config.data);
  return config;
}, (error) => Promise.reject(error));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Something went wrong: {this.state.error?.message || 'Unknown error'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => this.setState({ hasError: false, error: null })}
            sx={{ marginTop: '16px' }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const TenantAdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [tenantForm, setTenantForm] = useState({ name: '', domain: '', secondary_domain: '' });
  const [adminForm, setAdminForm] = useState({
    email_prefix: '', email_domain: '', password: '', first_name: '', last_name: '', tenant_schema: '',
  });
  const [bulkFile, setBulkFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, tenant: false, admin: false, bulk: false, delete: {}, edit: {}, users: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalOpen, setModalOpen] = useState({ tenant: false, admin: false, bulk: false, edit: null, details: null, users: null });

  // // Debug logging for state changes
  // useEffect(() => {
  //   console.log('modalOpen state:', modalOpen);
  //   console.log('loading state:', loading);
  //   console.log('adminForm state:', adminForm);
  //   console.log('tenantForm state:', tenantForm);
  // }, [modalOpen, loading, adminForm, tenantForm]);

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tenant/tenants/all/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        const tenantList = Array.isArray(response.data)
          ? response.data
          : response.data.results || (response.data && typeof response.data === 'object' ? [response.data] : []);
        //console.log('Fetched tenants:', tenantList);
        setTenants(tenantList);
      } catch (err) {
        setError(err.response?.status === 403 ? 'You do not have permission to view all tenants' : 'Failed to fetch tenants');
        setTenants([]);
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };
    fetchTenants();
  }, []);

  // Fetch users for a tenant
  const fetchTenantUsers = async (tenantId) => {
    setLoading((prev) => ({ ...prev, users: true }));
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tenant-users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: { tenant_id: tenantId },
      });
      setUsers(response.data.data || []);
      setSuccess(`Retrieved ${response.data.data?.length || 0} users for tenant`);
    } catch (err) {
      setError(err.response?.status === 403
        ? 'You do not have permission to view tenant users'
        : err.response?.data?.message || 'Failed to fetch tenant users');
      setUsers([]);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const handleTenantChange = (e) => {
    setTenantForm({ ...tenantForm, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tenant_schema') {
      const selectedTenant = tenants.find((t) => t.schema_name === value);
      const primaryDomain = selectedTenant?.domains?.find((d) => d.is_primary)?.domain || '';
      setAdminForm({
        ...adminForm,
        tenant_schema: value,
        email_domain: primaryDomain,
        email_prefix: '',
      });
    } else {
      setAdminForm({ ...adminForm, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const validateTenantData = () => {
    const nameRegex = /^[a-zA-Z0-9\s'-]+$/;
    const domainRegex = /^[a-zA-Z0-9\-\.]+$/;
    const schemaRegex = /^[a-z0-9_]+$/;

    if (!tenantForm.name || !nameRegex.test(tenantForm.name)) {
      setError('Tenant name must contain only letters, numbers, spaces, apostrophes, or hyphens.');
      return false;
    }
    if (!tenantForm.domain || !domainRegex.test(tenantForm.domain)) {
      setError('Primary domain must contain only letters, numbers, hyphens, or dots.');
      return false;
    }
    const schema_name = tenantForm.name.toLowerCase().replace(/[\s-]+/g, '_');
    if (!schemaRegex.test(schema_name)) {
      setError('Generated schema name must contain only lowercase letters, numbers, or underscores.');
      return false;
    }
    if (tenantForm.secondary_domain && !domainRegex.test(tenantForm.secondary_domain)) {
      setError('Secondary domain must contain only letters, numbers, hyphens, or dots.');
      return false;
    }
    return true;
  };

  const createTenant = async () => {
    setLoading((prev) => ({ ...prev, tenant: true }));
    setError(null);
    setSuccess(null);

    if (!validateTenantData()) {
      setLoading((prev) => ({ ...prev, tenant: false }));
      return;
    }

    const schema_name = tenantForm.name.toLowerCase().replace(/[\s-]+/g, '_');
    const payload = {
      name: tenantForm.name,
      schema_name,
      domains: [
        { domain: tenantForm.domain, is_primary: true },
        ...(tenantForm.secondary_domain ? [{ domain: tenantForm.secondary_domain, is_primary: false }] : []),
      ],
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/tenant/tenants/create_with_domains/`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      setSuccess('Tenant created successfully!');
      setTenantForm({ name: '', domain: '', secondary_domain: '' });
      setTenants([...tenants, response.data]);
      setModalOpen((prev) => ({ ...prev, tenant: false }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        Object.entries(err.response?.data || {})
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ') ||
        'Failed to create tenant';
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, tenant: false }));
    }
  };

  const createAdmin = async () => {
    setLoading((prev) => ({ ...prev, admin: true }));
    setError(null);
    setSuccess(null);

    if (!adminForm.tenant_schema) {
      setError('Please select a tenant schema');
      setLoading((prev) => ({ ...prev, admin: false }));
      return;
    }

    if (!adminForm.email_domain) {
      setError('No primary domain found for the selected tenant');
      setLoading((prev) => ({ ...prev, admin: false }));
      return;
    }

    const email = `${adminForm.email_prefix}@${adminForm.email_domain}`;
    const payload = {
      email,
      password: adminForm.password,
      first_name: adminForm.first_name,
      last_name: adminForm.last_name,
      role: 'admin',
      tenant_schema: adminForm.tenant_schema,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/users/admin/create/`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      setSuccess('Admin user created successfully!');
      setAdminForm({
        email_prefix: '',
        email_domain: '',
        password: '',
        first_name: '',
        last_name: '',
        tenant_schema: '',
      });
      setModalOpen((prev) => ({ ...prev, admin: false }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).join(', ') ||
        'Failed to create admin user';
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, admin: false }));
    }
  };

  const deleteTenant = async (tenantId) => {
    setLoading((prev) => ({ ...prev, delete: { ...prev.delete, [tenantId]: true } }));
    setError(null);
    setSuccess(null);

    try {
      await axios.delete(`${API_BASE_URL}/api/tenant/tenants/${tenantId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      setSuccess('Tenant deleted successfully!');
      setTenants(tenants.filter((tenant) => tenant.id !== tenantId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete tenant');
    } finally {
      setLoading((prev) => ({ ...prev, delete: { ...prev.delete, [tenantId]: false } }));
    }
  };

  const editTenant = async (tenantId) => {
    if (!tenantId) {
      setError('Invalid tenant ID');
      return;
    }
    setLoading((prev) => ({ ...prev, edit: { ...prev.edit, [tenantId]: true } }));
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: tenantForm.name,
        domains: [
          { domain: tenantForm.domain, is_primary: true },
          ...(tenantForm.secondary_domain ? [{ domain: tenantForm.secondary_domain, is_primary: false }] : []),
        ],
      };
      await axios.put(
        `${API_BASE_URL}/api/tenant/tenants/${tenantId}/`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      setSuccess('Tenant updated successfully!');
      setTenants(tenants.map((tenant) => (tenant.id === tenantId ? { ...tenant, ...payload, domains: payload.domains } : tenant)));
      setModalOpen((prev) => ({ ...prev, edit: null }));
      setTenantForm({ name: '', domain: '', secondary_domain: '' });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        Object.entries(err.response?.data || {})
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ') ||
        'Failed to update tenant';
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, edit: { ...prev.edit, [tenantId]: false } }));
    }
  };

  const bulkUploadUsers = async () => {
    if (!bulkFile) {
      setError('No file selected for upload');
      return;
    }

    setLoading((prev) => ({ ...prev, bulk: true }));
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/bulk_upload/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(`Created ${response.data.created_count} users successfully!`);
      setBulkFile(null);
      setModalOpen((prev) => ({ ...prev, bulk: false }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload users');
    } finally {
      setLoading((prev) => ({ ...prev, bulk: false }));
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    borderRadius: '8px',
  };

  return (
    <ErrorBoundary>
      <Box className="admin-dashboard">
        <AppBar position="static" className="admin-appbar">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Tenant Admin Dashboard</Typography>
          </Toolbar>
        </AppBar>
        <Box className="dashboard-content">
          <Box className="sidebar">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen((prev) => ({ ...prev, tenant: true }))}
              className="sidebar-button"
            >
              Create Tenant
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setModalOpen((prev) => ({ ...prev, admin: true }))}
              className="sidebar-button"
            >
              Create Admin
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => setModalOpen((prev) => ({ ...prev, bulk: true }))}
              className="sidebar-button"
            >
              Bulk Upload
            </Button>
          </Box>
          <Box className="main-panel">
            <Card className="tenant-card">
              <CardContent>
                <Typography variant="h6" className="card-title">Tenants</Typography>
                {loading.fetch ? (
                  <CircularProgress />
                ) : tenants.length === 0 ? (
                  <Typography>No tenants found</Typography>
                ) : (
                  <Table className="tenant-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Schema</TableCell>
                        <TableCell>Domains</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell>{tenant.name}</TableCell>
                          <TableCell>{tenant.schema_name}</TableCell>
                          <TableCell>{tenant.domains?.map((d) => d.domain).join(', ') || 'No domains'}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => setModalOpen((prev) => ({ ...prev, details: tenant }))}>
                              <InfoIcon />
                            </IconButton>
                            <IconButton onClick={() => {
                              console.log('Editing tenant:', tenant);
                              setTenantForm({
                                name: tenant.name,
                                domain: tenant.domains?.find((d) => d.is_primary)?.domain || '',
                                secondary_domain: tenant.domains?.find((d) => !d.is_primary)?.domain || '',
                              });
                              setModalOpen((prev) => ({ ...prev, edit: tenant.id }));
                            }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => deleteTenant(tenant.id)}
                              disabled={loading.delete[tenant.id]}
                            >
                              {loading.delete[tenant.id] ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setModalOpen((prev) => ({ ...prev, users: tenant }));
                                fetchTenantUsers(tenant.id);
                              }}
                              disabled={loading.users}
                            >
                              {loading.users ? <CircularProgress size={20} /> : <GroupIcon />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Create Tenant Modal */}
        <Modal
          open={modalOpen.tenant}
          onClose={() => {
            setModalOpen((prev) => ({ ...prev, tenant: false }));
            setTenantForm({ name: '', domain: '', secondary_domain: '' });
          }}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" className="modal-title">Create Tenant</Typography>
            <TextField
              fullWidth
              label="Tenant Name"
              name="name"
              value={tenantForm.name}
              onChange={handleTenantChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Primary Domain"
              name="domain"
              value={tenantForm.domain}
              onChange={handleTenantChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Secondary Domain (Optional)"
              name="secondary_domain"
              value={tenantForm.secondary_domain}
              onChange={handleTenantChange}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={createTenant}
              disabled={
                loading.tenant ||
                !tenantForm.name ||
                !tenantForm.domain ||
                (tenantForm.secondary_domain && !/^[a-zA-Z0-9\-\.]+$/.test(tenantForm.secondary_domain))
              }
              startIcon={loading.tenant ? <CircularProgress size={20} /> : <AddIcon />}
              className="modal-button"
            >
              Create
            </Button>
          </Box>
        </Modal>

        {/* Create Admin Modal */}
        <Modal open={modalOpen.admin} onClose={() => setModalOpen((prev) => ({ ...prev, admin: false }))}>
          <Box sx={modalStyle}>
            <Typography variant="h6" className="modal-title">Create Admin User</Typography>
            <TextField
              fullWidth
              label="Tenant Schema"
              name="tenant_schema"
              value={adminForm.tenant_schema}
              onChange={handleAdminChange}
              select
              SelectProps={{ native: true }}
              margin="normal"
            >
              <option value="">Select a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.schema_name}>{tenant.schema_name}</option>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Email Username"
              name="email_prefix"
              value={adminForm.email_prefix}
              onChange={handleAdminChange}
              margin="normal"
              InputProps={{
                endAdornment: adminForm.email_domain ? (
                  <InputAdornment position="end">@{adminForm.email_domain}</InputAdornment>
                ) : null,
              }}
              disabled={!adminForm.tenant_schema}
              className="email-input"
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              name="password"
              value={adminForm.password}
              onChange={handleAdminChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={adminForm.first_name}
              onChange={handleAdminChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={adminForm.last_name}
              onChange={handleAdminChange}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={createAdmin}
              disabled={loading.admin || !adminForm.email_prefix || !adminForm.password || !adminForm.tenant_schema}
              startIcon={loading.admin ? <CircularProgress size={20} /> : <PersonAddIcon />}
              className="modal-button"
            >
              Create
            </Button>
          </Box>
        </Modal>

        {/* Bulk Upload Modal */}
        <Modal open={modalOpen.bulk} onClose={() => setModalOpen((prev) => ({ ...prev, bulk: false }))}>
          <Box sx={modalStyle}>
            <Typography variant="h6" className="modal-title">Bulk User Upload</Typography>
            <Box sx={{ marginBottom: '16px' }}>
              <input type="file" accept=".csv" onChange={handleFileChange} />
            </Box>
            <Button
              variant="contained"
              onClick={bulkUploadUsers}
              disabled={loading.bulk || !bulkFile}
              startIcon={loading.bulk ? <CircularProgress /> : <UploadFileIcon />}
              className="modal-button"
            >
              Upload
            </Button>
          </Box>
        </Modal>

        {/* Edit Tenant Modal */}
        <Modal
          open={modalOpen.edit !== null && modalOpen.edit !== undefined}
          onClose={() => {
            setModalOpen((prev) => ({ ...prev, edit: null }));
            setTenantForm({ name: '', domain: '', secondary_domain: '' });
          }}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" className="modal-title">Edit Tenant</Typography>
            <TextField
              fullWidth
              label="Tenant Name"
              name="name"
              value={tenantForm.name}
              onChange={handleTenantChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Primary Domain"
              name="domain"
              value={tenantForm.domain}
              onChange={handleTenantChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Secondary Domain (Optional)"
              name="secondary_domain"
              value={tenantForm.secondary_domain}
              onChange={handleTenantChange}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={() => editTenant(modalOpen.edit)}
              disabled={
                !modalOpen.edit ||
                loading.edit[modalOpen.edit] ||
                !tenantForm.name ||
                !tenantForm.domain ||
                (tenantForm.secondary_domain && !/^[a-zA-Z0-9\-\.]+$/.test(tenantForm.secondary_domain))
              }
              startIcon={loading.edit[modalOpen.edit] ? <CircularProgress size={20} /> : <EditIcon />}
              className="modal-button"
            >
              Update
            </Button>
          </Box>
        </Modal>

        {/* Tenant Users Modal */}
        <Modal
          open={!!modalOpen.users}
          onClose={() => setModalOpen((prev) => ({ ...prev, users: null }))}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" className="modal-title">
              Users for Tenant: {modalOpen.users?.name || 'Unknown'}
            </Typography>
            {loading.users ? (
              <CircularProgress />
            ) : users.length === 0 ? (
              <Typography>No users found for this tenant</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>{user.last_login || 'Never'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button
              variant="contained"
              onClick={() => setModalOpen((prev) => ({ ...prev, users: null }))}
              sx={{ marginTop: '16px' }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        {/* Tenant Details Modal */}
        <TenantDetails
          open={!!modalOpen.details}
          tenant={modalOpen.details}
          onClose={() => setModalOpen((prev) => ({ ...prev, details: null }))}
        />

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
};

export default TenantAdminDashboard;