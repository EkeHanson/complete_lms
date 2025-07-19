import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  People as PeopleIcon, Search as SearchIcon, Close as CloseIcon,
  Check as CheckIcon, Group as GroupIcon, AdminPanelSettings as AdminIcon,
  School as InstructorIcon, Person as LearnerIcon, Security as SuperAdminIcon
} from '@mui/icons-material';
import { groupsAPI, rolesAPI, userAPI } from '../../../config';
import './UserGroupsManagement.css';

const PERMISSION_OPTIONS = [
  { value: 'create_content', label: 'Create Content' },
  { value: 'edit_content', label: 'Edit Content' },
  { value: 'delete_content', label: 'Delete Content' },
  { value: 'view_content', label: 'View Content' },
  { value: 'grade_assignments', label: 'Grade Assignments' },
  { value: 'manage_courses', label: 'Manage Courses' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'view_reports', label: 'View Reports' },
];

const UserGroupsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState({
    main: true,
    dialog: false,
    action: false,
    users: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userPagination, setUserPagination] = useState({
    count: 0,
    currentPage: 1,
    pageSize: 10
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    name: '',
    description: '',
    role: null,
    is_active: true,
    members: []
  });
  const [currentRole, setCurrentRole] = useState({
    id: null,
    name: '',
    code: '',
    description: '',
    permissions: [],
    is_default: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = async (search = '') => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const params = {
        page: userPagination.currentPage,
        page_size: userPagination.pageSize,
        ...(search && { search })
      };
      const response = await userAPI.getUsers(params);
      setUsers(response.data?.results || []);
      setUserPagination(prev => ({
        ...prev,
        count: response.data?.count || 0
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, main: true }));
        const [groupsResponse, rolesResponse] = await Promise.all([
          groupsAPI.getGroups(),
          rolesAPI.getRoles()
        ]);
        setGroups(groupsResponse.data?.results || []);
        setRoles(rolesResponse.data?.results || []);
        await fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(prev => ({ ...prev, main: false }));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers(searchTerm);
  }, [searchTerm, userPagination.currentPage, userPagination.pageSize]);

  const handleOpenGroupDialog = (group = null) => {
    if (group) {
      const groupRole = roles.find(r => r.id === (group.role?.id || group.role));
      setCurrentGroup({
        id: group.id,
        name: group.name || '',
        description: group.description || '',
        role: groupRole || null,
        is_active: group.is_active !== undefined ? group.is_active : true,
        members: Array.isArray(group.memberships)
          ? group.memberships.map(m => m.user?.id).filter(Boolean)
          : []
      });
    } else {
      setCurrentGroup({
        id: null,
        name: '',
        description: '',
        role: null,
        is_active: true,
        members: []
      });
    }
    setSelectedUsers([]); // Reset selected users when opening dialog
    setOpenGroupDialog(true);
  };

  const handleSaveGroup = async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      if (!currentGroup.name) throw new Error('Group name is required');
      if (!currentGroup.role?.id && !currentGroup.role) throw new Error('Please select a role');
      const groupData = {
        name: currentGroup.name,
        description: currentGroup.description,
        role_id: currentGroup.role?.id,
        is_active: currentGroup.is_active
      };
      let response;
      if (currentGroup.id) {
        response = await groupsAPI.updateGroup(currentGroup.id, groupData);
        const memberIds = Array.isArray(currentGroup.members) ? currentGroup.members.map(id => Number(id)) : [];
        await groupsAPI.updateGroupMembers(response.data.id, { members: memberIds });
        const updatedGroup = await groupsAPI.getGroup(response.data.id);
        setGroups(groups.map(g => g.id === currentGroup.id ? updatedGroup.data : g));
      } else {
        response = await groupsAPI.createGroup(groupData);
        if (currentGroup.members?.length > 0) {
          const memberIds = Array.isArray(currentGroup.members) ? currentGroup.members.map(id => Number(id)) : [];
          await groupsAPI.updateGroupMembers(response.data.id, { members: memberIds });
        }
        const newGroup = await groupsAPI.getGroup(response.data.id);
        setGroups([...groups, newGroup.data]);
      }
      setSuccessMessage(currentGroup.id ? 'Group updated successfully' : 'Group created successfully');
      setOpenGroupDialog(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save group');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await groupsAPI.deleteGroup(id);
      setGroups(groups.filter(g => g.id !== id));
      setSuccessMessage('Group deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete group');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleOpenRoleDialog = (role = null) => {
    if (role) {
      setCurrentRole({
        id: role.id,
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
        is_default: role.is_default || false
      });
    } else {
      setCurrentRole({
        id: null,
        name: '',
        code: '',
        description: '',
        permissions: [],
        is_default: false
      });
    }
    setOpenRoleDialog(true);
  };

  const handleSaveRole = async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const roleData = {
        name: currentRole.name,
        code: currentRole.code,
        description: currentRole.description,
        permissions: Array.isArray(currentRole.permissions) ? currentRole.permissions : [],
        is_default: currentRole.is_default
      };
      let response;
      if (currentRole.id) {
        response = await rolesAPI.updateRole(currentRole.id, roleData);
        setRoles(roles.map(r => r.id === currentRole.id ? response.data : r));
        setSuccessMessage('Role updated successfully');
      } else {
        response = await rolesAPI.createRole(roleData);
        setRoles([...roles, response.data]);
        setSuccessMessage('Role created successfully');
      }
      setOpenRoleDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save role');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await rolesAPI.deleteRole(id);
      setRoles(roles.filter(r => r.id !== id));
      setSuccessMessage('Role deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete role');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const toggleMember = (userId) => {
    setCurrentGroup(prev => {
      const members = Array.isArray(prev.members) ? [...prev.members] : [];
      const isMember = members.includes(userId);
      return {
        ...prev,
        members: isMember 
          ? members.filter(id => id !== userId)
          : [...members, userId]
      };
    });
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setError('No users selected for deletion');
      return;
    }
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await userAPI.bulkDelete({ ids: selectedUsers });
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      setSuccessMessage(`Successfully deleted ${selectedUsers.length} user(s)`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete users');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const getRoleIcon = (roleCode) => {
    switch (roleCode) {
      case 'superadmin': return <SuperAdminIcon className="role-icon" />;
      case 'admin': return <AdminIcon className="role-icon" />;
      case 'instructor': return <InstructorIcon className="role-icon" />;
      case 'learner': return <LearnerIcon className="role-icon" />;
      default: return <PeopleIcon className="role-icon" />;
    }
  };

  const filteredGroups = groups.filter(group => {
    const name = group.name || '';
    const description = group.description || '';
    const roleName = group.role?.name || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredRoles = roles.filter(role => {
    return (
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getUserById = (idOrUser) => {
    if (typeof idOrUser === 'object' && idOrUser !== null) {
      return idOrUser;
    }
    return users.find(user => user?.id === idOrUser);
  };

  if (loading.main && groups.length === 0 && roles.length === 0) {
    return (
      <div className="ugm-container ugm-loading">
        <div className="ugm-spinner"></div>
      </div>
    );
  }

  return (
    <div className="ugm-container">
      {successMessage && (
        <div className="ugm-alert ugm-alert-success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ugm-alert-close">
            <CloseIcon />
          </button>
        </div>
      )}
      {error && (
        <div className="ugm-alert ugm-alert-error">
          <span>{typeof error === 'string' ? error : JSON.stringify(error, null, 2)}</span>
          <button onClick={() => setError(null)} className="ugm-alert-close">
            <CloseIcon />
          </button>
        </div>
      )}

      <div className="ugm-header">
        <h1>Roles & Groups Management</h1>
        <button
          className="ugm-btn ugm-btn-primary"
          onClick={() => tabValue === 0 ? handleOpenRoleDialog() : handleOpenGroupDialog()}
          disabled={loading.main}
        >
          <AddIcon />
          New {tabValue === 0 ? 'Role' : 'Group'}
        </button>
      </div>

      <div className="ugm-tabs">
        <button
          className={`ugm-tab ${tabValue === 0 ? 'active' : ''}`}
          onClick={() => setTabValue(0)}
        >
          Roles
        </button>
        <button
          className={`ugm-tab ${tabValue === 1 ? 'active' : ''}`}
          onClick={() => setTabValue(1)}
        >
          Groups
        </button>
      </div>

      <div className="ugm-search">
        <div className="ugm-search-input">
          <SearchIcon />
          <input
            type="text"
            placeholder={`Search ${tabValue === 0 ? 'roles' : 'groups'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {tabValue === 0 ? (
        <div className="ugm-table-container">
          <table className="ugm-table">
            <thead>
              <tr>
                <th><span>Role Name</span></th>
                <th><span>Code</span></th>
                <th><span>Description</span></th>
                <th><span>Default</span></th>
                <th><span>Permissions</span></th>
                <th><span>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="ugm-table-cell">
                        {getRoleIcon(role.code)}
                        <span>{role.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ugm-chip">{role.code}</span>
                    </td>
                    <td>
                      <span className="ugm-text-secondary">{role.description || 'No description'}</span>
                    </td>
                    <td>
                      <span className={`ugm-status ${role.is_default ? 'active' : 'inactive'}`}>
                        {role.is_default ? 'Default' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="ugm-chip-container">
                        {role.permissions?.slice(0, 3).map((perm, i) => (
                          <span key={i} className="ugm-chip">{perm}</span>
                        ))}
                        {role.permissions?.length > 3 && (
                          <span className="ugm-chip">+{role.permissions.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="ugm-action-btns">
                        <button
                          className="ugm-btn ugm-btn-edit"
                          onClick={() => handleOpenRoleDialog(role)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="ugm-btn ugm-btn-delete"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.is_default}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="ugm-no-data">
                    {roles.length === 0 ? 'No roles available' : 'No roles found matching your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ugm-table-container">
          <table className="ugm-table">
            <thead>
              <tr>
                <th><span>Group Name</span></th>
                <th><span>Description</span></th>
                <th><span>Role</span></th>
                <th><span>Status</span></th>
                <th><span>Members</span></th>
                <th><span>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <span>{group.name}</span>
                    </td>
                    <td>
                      <span className="ugm-text-secondary">{group.description || 'No description'}</span>
                    </td>
                    <td>
                      <div className="ugm-table-cell">
                        {group.role && getRoleIcon(group.role.code)}
                        <span>{group.role?.name || 'No role assigned'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ugm-status ${group.is_active ? 'active' : 'inactive'}`}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="ugm-member-container">
                        {group.memberships?.slice(0, 3).map(membership => {
                          const user = getUserById(membership.user);
                          return user ? (
                            <div key={user.id} className="ugm-avatar" title={`${user.first_name} ${user.last_name}`}>
                              {user.first_name?.charAt(0)}
                            </div>
                          ) : null;
                        })}
                        {group.memberships?.length > 3 && (
                          <div className="ugm-avatar ugm-avatar-more">
                            +{group.memberships.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="ugm-action-btns">
                        <button
                          className="ugm-btn ugm-btn-edit"
                          onClick={() => handleOpenGroupDialog(group)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="ugm-btn ugm-btn-delete"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="ugm-no-data">
                    {groups.length === 0 ? 'No groups available' : 'No groups found matching your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="ugm-role-dialog" style={{ display: openRoleDialog ? 'block' : 'none' }}>
        <div className="ugm-dialog-backdrop" onClick={() => setOpenRoleDialog(false)}></div>
        <div className="ugm-dialog">
          <div className="ugm-dialog-header">
            <h3>{currentRole.id ? 'Edit Role' : 'Create New Role'}</h3>
            <button className="ugm-dialog-close" onClick={() => setOpenRoleDialog(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="ugm-dialog-content">
            <div className="ugm-form-grid">
              <div className="ugm-form-field">
                <label>Role Name</label>
                <input
                  type="text"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  required
                />
              </div>
              <div className="ugm-form-field">
                <label>Code</label>
                <input
                  type="text"
                  value={currentRole.code}
                  onChange={(e) => setCurrentRole({ ...currentRole, code: e.target.value })}
                  required
                />
                <span className="ugm-helper-text">Short identifier (e.g., admin, instructor)</span>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                ></textarea>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <label className="ugm-checkbox">
                  <input
                    type="checkbox"
                    checked={currentRole.is_default}
                    onChange={(e) => setCurrentRole({ ...currentRole, is_default: e.target.checked })}
                  />
                  <span>Set as default role for new users</span>
                </label>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <h4>Permissions</h4>
                <div className="ugm-permissions">
                  {PERMISSION_OPTIONS.map((permission) => (
                    <label key={permission.value} className="ugm-checkbox">
                      <input
                        type="checkbox"
                        checked={currentRole.permissions?.includes(permission.value) || false}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...(currentRole.permissions || []), permission.value]
                            : (currentRole.permissions || []).filter(p => p !== permission.value);
                          setCurrentRole({ ...currentRole, permissions: newPermissions });
                        }}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="ugm-dialog-actions">
            <button className="ugm-btn ugm-btn-cancel" onClick={() => setOpenRoleDialog(false)}>
              Cancel
            </button>
            <button
              className="ugm-btn ugm-btn-confirm"
              onClick={handleSaveRole}
              disabled={!currentRole.name || !currentRole.code || loading.action}
            >
              {loading.action ? <div className="ugm-spinner-small"></div> : (currentRole.id ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </div>
      </div>

      <div className="ugm-group-dialog" style={{ display: openGroupDialog ? 'block' : 'none' }}>
        <div className="ugm-dialog-backdrop" onClick={() => setOpenGroupDialog(false)}></div>
        <div className="ugm-dialog ugm-dialog-wide">
          <div className="ugm-dialog-header">
            <h3>{currentGroup.id ? 'Edit Group' : 'Create New Group'}</h3>
            <button className="ugm-dialog-close" onClick={() => setOpenGroupDialog(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="ugm-dialog-content">
            <div className="ugm-form-grid">
              <div className="ugm-form-field">
                <label>Group Name</label>
                <input
                  type="text"
                  value={currentGroup.name}
                  onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
                  required
                />
              </div>
              <div className="ugm-form-field">
                <label>Status</label>
                <select
                  value={currentGroup.is_active}
                  onChange={(e) => setCurrentGroup({ ...currentGroup, is_active: e.target.value === 'true' })}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={currentGroup.description}
                  onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })}
                ></textarea>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <label>Role</label>
                <select
                  value={currentGroup.role?.id || ''}
                  onChange={(e) => {
                    const selectedRole = roles.find((r) => r.id === parseInt(e.target.value));
                    setCurrentGroup({ ...currentGroup, role: selectedRole });
                  }}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="ugm-form-field ugm-form-field-full">
                <h4>Group Members ({currentGroup.members?.length || 0})</h4>
                <div className="ugm-members-controls">
                  <div className="ugm-search-input">
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <div className="ugm-members-actions">
                    <label className="ugm-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAllUsers}
                      />
                      <span>Select All</span>
                    </label>
                    <button
                      className="ugm-btn ugm-btn-delete"
                      onClick={handleBulkDelete}
                      disabled={selectedUsers.length === 0 || loading.action}
                    >
                      <DeleteIcon />
                      Delete Selected ({selectedUsers.length})
                    </button>
                  </div>
                </div>
                {loading.users ? (
                  <div className="ugm-members-loading">
                    <div className="ugm-spinner"></div>
                  </div>
                ) : users.length > 0 ? (
                  <>
                    <div className="ugm-members-list">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`ugm-member-item ${currentGroup.members?.includes(user.id) ? 'selected' : ''}`}
                        >
                          <div className="ugm-member-selection">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                            />
                          </div>
                          <div
                            className="ugm-member-content"
                            onClick={() => toggleMember(user.id)}
                          >
                            <div className="ugm-member-info">
                              <div className="ugm-avatar">{user.first_name?.charAt(0)}</div>
                              <div>
                                <span>{user.first_name} {user.last_name}</span>
                                <span className="ugm-text-secondary">{user.email}</span>
                              </div>
                            </div>
                            {currentGroup.members?.includes(user.id) && <CheckIcon />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="ugm-pagination">
                      <div className="ugm-items-per-page">
                        <span>Items per page:</span>
                        <select
                          value={userPagination.pageSize}
                          onChange={(e) => {
                            setUserPagination(prev => ({
                              ...prev,
                              pageSize: parseInt(e.target.value, 10),
                              currentPage: 1
                            }));
                          }}
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                      <div className="ugm-page-navigation">
                        <span>
                          {((userPagination.currentPage - 1) * userPagination.pageSize + 1)}-
                          {Math.min(userPagination.currentPage * userPagination.pageSize, userPagination.count)} of {userPagination.count}
                        </span>
                        <div className="ugm-page-btns">
                          <button
                            onClick={() => setUserPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={userPagination.currentPage === 1}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={() => setUserPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={userPagination.currentPage * userPagination.pageSize >= userPagination.count}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ugm-no-data">No users found</div>
                )}
              </div>
            </div>
          </div>
          <div className="ugm-dialog-actions">
            <button className="ugm-btn ugm-btn-cancel" onClick={() => setOpenGroupDialog(false)}>
              Cancel
            </button>
            <button
              className="ugm-btn ugm-btn-confirm"
              onClick={handleSaveGroup}
              disabled={!currentGroup.name || !currentGroup.role || loading.action}
            >
              {loading.action ? <div className="ugm-spinner-small"></div> : (currentGroup.id ? 'Update Group' : 'Create Group')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGroupsManagement;