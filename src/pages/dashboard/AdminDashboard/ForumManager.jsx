import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Forum as ForumIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Search as SearchIcon,
  Refresh as RefreshIcon, Close as CloseIcon
} from '@mui/icons-material';
import { TablePagination, Autocomplete, TextField, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { forumAPI, groupsAPI } from '../../../config';
import './ForumManager.css';

const ForumManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [forums, setForums] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentForum, setCurrentForum] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedForum, setExpandedForum] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    isActive: true
  });

  const fetchForums = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: rowsPerPage,
        ...(filters.search && { search: filters.search }),
        is_active: filters.isActive
      };
      const [forumsRes, groupsRes] = await Promise.all([
        forumAPI.getForums(params),
        groupsAPI.getGroups()
      ]);
      setForums(forumsRes.data.results || []);
      setGroups(groupsRes.data.results || []);
      setPagination({
        count: forumsRes.data.count || 0,
        next: forumsRes.data.next,
        previous: forumsRes.data.previous,
        page: pagination.page
      });
    } catch (error) {
      setError(error.message);
      enqueueSnackbar('Failed to load forums', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, [pagination.page, rowsPerPage, filters]);

  const handleOpenDialog = (forum = null) => {
    if (forum) {
      setCurrentForum(forum);
      setSelectedGroups(forum.allowed_groups || []);
    } else {
      setCurrentForum({ title: '', description: '', is_active: true });
      setSelectedGroups([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentForum(null);
    setSelectedGroups([]);
  };

  const handleSaveForum = async () => {
    try {
      const forumData = {
        ...currentForum,
        allowed_groups: selectedGroups.map(g => g.id)
      };
      const response = currentForum.id
        ? await forumAPI.updateForum(currentForum.id, forumData)
        : await forumAPI.createForum(forumData);
      enqueueSnackbar(currentForum.id ? 'Forum updated successfully!' : 'Forum created successfully!', { variant: 'success' });
      fetchForums();
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar('Error saving forum', { variant: 'error' });
    }
  };

  const handleDeleteForum = async (id) => {
    try {
      await forumAPI.deleteForum(id);
      enqueueSnackbar('Forum deleted successfully!', { variant: 'success' });
      fetchForums();
    } catch (error) {
      enqueueSnackbar('Error deleting forum', { variant: 'error' });
    }
  };

  const toggleExpandForum = (forumId) => {
    setExpandedForum(expandedForum === forumId ? null : forumId);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ search: '', isActive: true });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderMobileForumCards = () => (
    <div className="fm-mobile-cards">
      {forums.map((forum) => (
        <div key={forum.id} className="fm-card">
          <div className="fm-card-header">
            <div className="fm-card-title">
              <ForumIcon className={forum.is_active ? 'fm-icon-active' : 'fm-icon-inactive'} />
              <span>{forum.title}</span>
            </div>
            <button
              className="fm-expand-btn"
              onClick={() => toggleExpandForum(forum.id)}
            >
              {expandedForum === forum.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
          </div>
          <div className="fm-card-content">
            <div className="fm-card-meta">
              <span>Posts: {forum.post_count}</span>
              <span>Last activity: {forum.last_activity}</span>
            </div>
            <div className={`fm-collapse ${expandedForum === forum.id ? 'open' : ''}`}>
              <p>{forum.description}</p>
              <div className="fm-chip-container">
                <span>Allowed Groups:</span>
                {forum.allowed_groups.map((group, i) => (
                  <span key={i} className="fm-chip">{group.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="fm-card-actions">
            <button
              className="fm-btn fm-btn-edit"
              onClick={() => handleOpenDialog(forum)}
            >
              <EditIcon />
              Edit
            </button>
            <button
              className="fm-btn fm-btn-delete"
              onClick={() => handleDeleteForum(forum.id)}
            >
              <DeleteIcon />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDesktopForumTable = () => (
    <div className="fm-table-container">
      <table className="fm-table">
        <thead>
          <tr>
            <th><span>Title</span></th>
            <th><span>Description</span></th>
            <th><span>Posts</span></th>
            <th><span>Status</span></th>
            <th><span>Allowed Groups</span></th>
            <th><span>Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {forums.map((forum) => (
            <tr
              key={forum.id}
              className="fm-table-row"
              onClick={() => toggleExpandForum(forum.id)}
            >
              <td>{forum.title}</td>
              <td>{forum.description.substring(0, 100)}...</td>
              <td>{forum.post_count}</td>
              <td>
                <span className={`fm-status ${forum.is_active ? 'active' : 'inactive'}`}>
                  {forum.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="fm-chip-container">
                  {forum.allowed_groups.slice(0, 2).map((group, i) => (
                    <span key={i} className="fm-chip">{group.name}</span>
                  ))}
                  {forum.allowed_groups.length > 2 && (
                    <span className="fm-chip">+{forum.allowed_groups.length - 2}</span>
                  )}
                </div>
              </td>
              <td>
                <div className="fm-action-btns">
                  <button
                    className="fm-btn fm-btn-edit"
                    onClick={() => handleOpenDialog(forum)}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="fm-btn fm-btn-delete"
                    onClick={() => handleDeleteForum(forum.id)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fm-container">
      {error && (
        <div className="fm-alert fm-alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="fm-alert-close">
            <CloseIcon />
          </button>
        </div>
      )}

      <div className="fm-header">
        <h1>Forum Manager</h1>
        <button
          className="fm-btn fm-btn-primary"
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
          Create Forum
        </button>
      </div>

      <div className="fm-filters">
        <div className="fm-filter-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search forums..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <label className="fm-checkbox">
          <input
            type="checkbox"
            checked={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.checked)}
          />
          <span>Show Active Forums Only</span>
        </label>
        <button className="fm-btn fm-btn-refresh" onClick={resetFilters}>
          <RefreshIcon />
        </button>
      </div>

      {isLoading ? (
        <div className="fm-loading">
          <div className="fm-spinner"></div>
        </div>
      ) : forums.length === 0 ? (
        <div className="fm-no-data">No forums found</div>
      ) : window.innerWidth <= 600 ? (
        renderMobileForumCards()
      ) : (
        renderDesktopForumTable()
      )}

      <div className="fm-pagination">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.count}
          rowsPerPage={rowsPerPage}
          page={pagination.page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      <div className="fm-dialog" style={{ display: openDialog ? 'block' : 'none' }}>
        <div className="fm-dialog-backdrop" onClick={handleCloseDialog}></div>
        <div className="fm-dialog-content">
          <div className="fm-dialog-header">
            <h3>{currentForum?.id ? 'Edit Forum' : 'Create Forum'}</h3>
            <button className="fm-dialog-close" onClick={handleCloseDialog}>
              <CloseIcon />
            </button>
          </div>
          <div className="fm-dialog-body">
            <div className="fm-form-field">
              <label>Title</label>
              <input
                type="text"
                value={currentForum?.title || ''}
                onChange={(e) => setCurrentForum({ ...currentForum, title: e.target.value })}
              />
            </div>
            <div className="fm-form-field">
              <label>Description</label>
              <textarea
                rows="4"
                value={currentForum?.description || ''}
                onChange={(e) => setCurrentForum({ ...currentForum, description: e.target.value })}
              ></textarea>
            </div>
            <div className="fm-form-field">
              <label className="fm-checkbox">
                <input
                  type="checkbox"
                  checked={currentForum?.is_active || false}
                  onChange={(e) => setCurrentForum({ ...currentForum, is_active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="fm-form-field">
              <label>Select Groups</label>
              <Autocomplete
                multiple
                options={groups}
                getOptionLabel={(option) => option.name}
                value={selectedGroups}
                onChange={(event, newValue) => setSelectedGroups(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Allowed Groups"
                    placeholder="Select groups"
                    className="fm-autocomplete"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      className="fm-chip"
                    />
                  ))
                }
                className="fm-autocomplete"
              />
            </div>
          </div>
          <div className="fm-dialog-actions">
            <button className="fm-btn fm-btn-cancel" onClick={handleCloseDialog}>
              Cancel
            </button>
            <button
              className="fm-btn fm-btn-confirm"
              onClick={handleSaveForum}
              disabled={!currentForum?.title}
            >
              {currentForum?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumManager;