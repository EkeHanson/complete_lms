import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Button, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { API_BASE_URL } from '../../../config';
import './TenantDetails.css';

const TenantDetails = ({ open, tenant, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && tenant) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'X-Tenant-Schema': tenant.schema_name,
            },
          });
          setUsers(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (err) {
          setError(err.response?.data?.detail || 'Failed to fetch users');
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open, tenant]);

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
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Typography variant="h6" className="modal-title">Tenant Details: {tenant?.name}</Typography>
          <Button onClick={onClose} startIcon={<CloseIcon />} />
        </Box>
        <Divider />
        {tenant && (
          <Box className="details-section">
            <Typography variant="subtitle1">General Information</Typography>
            <Box className="details-grid">
              <Typography><strong>Name:</strong> {tenant.name}</Typography>
              <Typography><strong>Schema:</strong> {tenant.schema_name}</Typography>
              <Typography><strong>Created At:</strong> {new Date(tenant.created_at).toLocaleDateString()}</Typography>
              <Typography><strong>Domains:</strong> {tenant.domains?.map((d) => d.domain).join(', ') || 'No domains'}</Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ marginTop: '16px' }}>Users</Typography>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : users.length === 0 ? (
              <Typography>No users found for this tenant</Typography>
            ) : (
              <Table className="user-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default TenantDetails;