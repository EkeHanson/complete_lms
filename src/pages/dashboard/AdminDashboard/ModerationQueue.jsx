import React, { useState, useEffect } from 'react';
import {
  Flag as FlagIcon, Check as CheckIcon, Close as CloseIcon, Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Stack, TablePagination,
  Grid, LinearProgress, useMediaQuery, Chip,MenuItem 
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { moderationAPI } from '../../../config';
import './ModerationQueue.css';

const ModerationQueue = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [moderationItems, setModerationItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending'
  });

  const fetchModerationItems = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: rowsPerPage,
        ...(filters.search && { search: filters.search }),
        status: filters.status
      };
      const response = await moderationAPI.getModerationQueue(params);
      setModerationItems(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
        page: pagination.page
      });
    } catch (error) {
      setError(error.message);
      enqueueSnackbar('Failed to load moderation queue', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationItems();
  }, [pagination.page, rowsPerPage, filters]);

  const handleOpenDialog = (item) => {
    setCurrentItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleModerate = async (action) => {
    try {
      await moderationAPI.moderateItem(currentItem.id, {
        action,
        moderation_notes: currentItem.moderation_notes
      });
      enqueueSnackbar(`Content ${action} successfully`, { variant: 'success' });
      fetchModerationItems();
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar('Error moderating content', { variant: 'error' });
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ search: '', status: 'pending' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="mq-container">
      <h1 className="mq-title">Moderation Queue</h1>

      <div className="mq-filter-container">
        <div className="mq-filter-grid">
          <div className="mq-filter-field">
            <div className="mq-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="mq-filter-field">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="mq-filter-field mq-filter-field-right">
            <button className="mq-btn mq-btn-reset" onClick={resetFilters}>
              <RefreshIcon />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mq-loading">
          <div className="mq-progress"></div>
        </div>
      ) : error ? (
        <div className="mq-error">{error}</div>
      ) : moderationItems.length === 0 ? (
        <div className="mq-no-data">No items in moderation queue</div>
      ) : (
        <div className="mq-table-container">
          <table className="mq-table">
            <thead>
              <tr>
                <th><span>Content Type</span></th>
                <th><span>Content</span></th>
                <th><span>Reported By</span></th>
                <th><span>Reason</span></th>
                <th><span>Status</span></th>
                <th><span>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {moderationItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.content_type}</td>
                  <td>{item.content_snippet}</td>
                  <td>{item.reported_by.email}</td>
                  <td>{item.reason}</td>
                  <td>
                    <span className={`mq-status ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mq-action-btns">
                      <button
                        className="mq-btn mq-btn-action"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <FlagIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={pagination.count}
        rowsPerPage={rowsPerPage}
        page={pagination.page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <div className="mq-dialog" style={{ display: openDialog ? 'block' : 'none' }}>
        <div className="mq-dialog-backdrop" onClick={handleCloseDialog}></div>
        <div className="mq-dialog-content">
          <div className="mq-dialog-header">
            <h3>Moderate Content</h3>
            <button className="mq-dialog-close" onClick={handleCloseDialog}>
              <CloseIcon />
            </button>
          </div>
          <div className="mq-dialog-body">
            <h4>Content Details</h4>
            <p>
              Type: {currentItem?.content_type}<br />
              Reported By: {currentItem?.reported_by.email}<br />
              Reason: {currentItem?.reason}
            </p>
            <div className="mq-form-field">
              <label>Content</label>
              <textarea
                rows="4"
                value={currentItem?.content || ''}
                disabled
              ></textarea>
            </div>
            <div className="mq-form-field">
              <label>Moderation Notes</label>
              <textarea
                rows="2"
                value={currentItem?.moderation_notes || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, moderation_notes: e.target.value })}
              ></textarea>
            </div>
          </div>
          <div className="mq-dialog-actions">
            <button className="mq-btn mq-btn-cancel" onClick={handleCloseDialog}>
              Cancel
            </button>
            <button
              className="mq-btn mq-btn-approve"
              onClick={() => handleModerate('approve')}
            >
              <CheckIcon />
              Approve
            </button>
            <button
              className="mq-btn mq-btn-reject"
              onClick={() => handleModerate('reject')}
            >
              <CloseIcon />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationQueue;