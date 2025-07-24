import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  People as PeopleIcon, Search as SearchIcon, Close as CloseIcon,
  Check as CheckIcon, Group as GroupIcon, AdminPanelSettings as AdminIcon,
  School as InstructorIcon, Person as LearnerIcon, Security as SuperAdminIcon
} from '@mui/icons-material';
import { groupsAPI, rolesAPI, userAPI } from '../../../config';
import './UserGroupsManagement.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ugm-alert ugm-alert-error">
          <span>Something went wrong: {this.state.error?.message || 'Unknown error'}</span>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const DialogContent = ({ type, data, setData, roles, users, loading, searchInput, setSearchInput, userPagination, setUserPagination, toggleMember, formErrors }) => {
  const isGroup = type === 'group';
  return (
    <div className="ugm-dialog-content">
      <div className="ugm-form-grid">
        <div className="ugm-form-field">
          <label>{isGroup ? 'Group Name' : 'Role Name'}</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            disabled={data.is_system}
          />
          {formErrors.name && (
            <span className="ugm-text-error">{formErrors.name}</span>
          )}
          {data.is_system && (
            <span className="ugm-helper-text">
              System {isGroup ? 'group' : 'role'} cannot be renamed
              {data.name === 'All Instructors' ? ' (used for course instructor assignments)' : ''}
            </span>
          )}
        </div>
        {isGroup ? (
          <>
            <div className="ugm-form-field">
              <label>Status</label>
              <select
                value={data.is_active}
                onChange={(e) => setData({ ...data, is_active: e.target.value === 'true' })}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
            <div className="ugm-form-field">
              <label>Role</label>
              <select
                value={data.role?.id || ''}
                onChange={(e) => {
                  const selectedRole = roles.find((r) => r.id === parseInt(e.target.value));
                  setData({ ...data, role: selectedRole });
                }}
                required
                disabled={data.is_system}
              >
                <option value="">Select a role</option>
                {roles.sort((a, b) => {
                  if (a.is_system && !b.is_system) return -1;
                  if (!a.is_system && b.is_system) return 1;
                  return a.name.localeCompare(b.name);
                }).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code}) {role.is_system ? '[System]' : ''}
                  </option>
                ))}
              </select>
              {formErrors.role_id && (
                <span className="ugm-text-error">{formErrors.role_id}</span>
              )}
              {data.is_system && (
                <span className="ugm-helper-text">System group role cannot be changed</span>
              )}
            </div>
          </>
        ) : (
          <div className="ugm-form-field">
            <label>Code</label>
            <input
              type="text"
              value={data.code}
              onChange={(e) => setData({ ...data, code: e.target.value })}
              required
              disabled={data.is_system}
            />
            {formErrors.code && (
              <span className="ugm-text-error">{formErrors.code}</span>
            )}
            <span className="ugm-helper-text">
              {data.is_system ? 'System role code cannot be modified' : 'Short identifier (e.g., admin, instructor)'}
            </span>
          </div>
        )}
        <div className="ugm-form-field ugm-form-field-full">
          <label>Description</label>
          <textarea
            rows="2"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          ></textarea>
          {formErrors.description && (
            <span className="ugm-text-error">{formErrors.description}</span>
          )}
        </div>
        {!isGroup && (
          <div className="ugm-form-field ugm-form-field-full">
            <label className="ugm-checkbox">
              <input
                type="checkbox"
                checked={data.is_default}
                onChange={(e) => setData({ ...data, is_default: e.target.checked })}
                disabled={data.is_system && data.code === 'learners'}
              />
              <span>
                Set as default role for new users
                {data.is_system && data.code === 'learners' ? ' (System Default)' : ''}
              </span>
            </label>
            {formErrors.is_default && (
              <span className="ugm-text-error">{formErrors.is_default}</span>
            )}
          </div>
        )}
        {isGroup && (
          <div className="ugm-form-field ugm-form-field-full">
            <label>Group Members ({data.members?.length || 0})</label>
            {data.members?.length > 0 && (
              <span className="ugm-helper-text">
                Note: Adding users to this group will update their role to {data.role?.name || 'the selected role'}.
              </span>
            )}
            <div className="ugm-search-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            {loading.users ? (
              <div className="ugm-members-loading">
                <div className="ugm-spinner-small"></div>
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="ugm-members-list">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`ugm-member-item ${data.members?.includes(user.id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(user.id)}
                    >
                      <div className="ugm-member-info">
                        <div className="ugm-avatar">{user.first_name?.charAt(0)}</div>
                        <div>
                          <span>{user.first_name} {user.last_name}</span>
                          <span className="ugm-text-secondary">{user.email}</span>
                          <span className="ugm-text-secondary">Role: {user.role || 'None'}</span>
                        </div>
                      </div>
                      {data.members?.includes(user.id) && <CheckIcon />}
                    </div>
                  ))}
                </div>
                <div className="ugm-pagination">
                  <div className="ugm-items-per-page">
                    <span>Items per page:</span>
                    <select
                      value={userPagination.pageSize}
                      onChange={(e) => setUserPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), currentPage: 1 }))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
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
            {formErrors.members && (
              <span className="ugm-text-error">{formErrors.members}</span>
            )}
          </div>
        )}
        {!isGroup && (
          <div className="ugm-form-field ugm-form-field-full">
            <h4>Permissions</h4>
            <div className="ugm-permissions">
              {PERMISSION_OPTIONS.map((permission) => (
                <label key={permission.value} className="ugm-checkbox">
                  <input
                    type="checkbox"
                    checked={data.permissions?.includes(permission.value) || false}
                    onChange={(e) => {
                      const newPermissions = e.target.checked
                        ? [...(data.permissions || []), permission.value]
                        : (data.permissions || []).filter(p => p !== permission.value);
                      setData({ ...data, permissions: newPermissions });
                    }}
                    disabled={data.is_system}
                  />
                  <span>{permission.label}</span>
                </label>
              ))}
            </div>
            {formErrors.permissions && (
              <span className="ugm-text-error">{formErrors.permissions}</span>
            )}
            {data.is_system && (
              <span className="ugm-helper-text">System role permissions cannot be modified</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const UserGroupsManagement = () => {
  const [membersDialogError, setMembersDialogError] = useState(null);
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
  const [formErrors, setFormErrors] = useState({});
  const [userPagination, setUserPagination] = useState({
    count: 0,
    currentPage: 1,
    pageSize: 10
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersSearchInput, setMembersSearchInput] = useState('');
  const [membersSearchTerm, setMembersSearchTerm] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [membersPagination, setMembersPagination] = useState({
    count: 0,
    currentPage: 1,
    pageSize: 10
  });
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    name: '',
    description: '',
    role: null,
    is_active: true,
    members: [],
    is_system: false
  });
  const [currentRole, setCurrentRole] = useState({
    id: null,
    name: '',
    code: '',
    description: '',
    permissions: [],
    is_default: false,
    is_system: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMembersSearchTerm(membersSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [membersSearchInput]);

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

  const fetchAvailableUsers = async (groupId, search = '') => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const params = {
        page: membersPagination.currentPage,
        page_size: membersPagination.pageSize,
        ...(search && { search })
      };
      const response = await userAPI.getUsers(params);
      setUsers(response.data?.results || []);
      setMembersPagination(prev => ({
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
        // Sanitize groups data
      const sanitizedGroups = (groupsResponse.data || []).map(group => {
        let role = group.role;
        
        // Handle both object and ID cases
        if (role && typeof role !== 'object') {
          role = rolesResponse.data.find(r => r.id === role) || null;
        } else if (role && (!role.id || !role.name)) {
          role = null;
        }
        
        return {
          ...group,
          role
        };
      });
        setGroups(sanitizedGroups);
        setRoles(rolesResponse.data || []);
        if (!sanitizedGroups.some(g => g.name === 'All Instructors' && g.is_system)) {
          setSuccessMessage('System roles and groups for instructors and learners created.');
        }
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

  useEffect(() => {
    if (openMembersDialog) {
      fetchAvailableUsers(currentGroupId, membersSearchTerm);
    }
  }, [membersSearchTerm, membersPagination.currentPage, membersPagination.pageSize, currentGroupId, openMembersDialog]);

  // useEffect(() => {
  //   console.log('Groups:', groups);
  //   groups.forEach(group => {
  //     if (!group.role || typeof group.role !== 'object' || !group.role.id || !group.role.name || !group.role.code) {
  //       console.warn(`Invalid role for group ${group.name}:`, group.role);
  //     }
  //   });
  // }, [groups]);

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
          : [],
        is_system: group.is_system || false
      });
    } else {
      setCurrentGroup({
        id: null,
        name: '',
        description: '',
        role: null,
        is_active: true,
        members: [],
        is_system: false
      });
    }
    setSelectedUsers([]);
    setSearchInput('');
    setFormErrors({});
    setOpenGroupDialog(true);
  };

  const handleSaveGroup = async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setFormErrors({});
      if (!currentGroup.name) throw new Error('Group name is required');
      if (!currentGroup.role?.id) throw new Error('Role is required');
      const groupData = {
        name: currentGroup.name,
        description: currentGroup.description,
        is_active: currentGroup.is_active
      };
      if (!currentGroup.is_system) {
        groupData.role_id = parseInt(currentGroup.role.id);
      }
      let response;
      if (currentGroup.id) {
        response = await groupsAPI.updateGroup(currentGroup.id, groupData);
        const memberIds = Array.isArray(currentGroup.members) ? currentGroup.members.map(id => Number(id)) : [];
        await groupsAPI.updateGroupMembers(response.data.id, { members: memberIds });
        const updatedGroup = await groupsAPI.getGroup(response.data.id);
        setGroups(groups.map(g => g.id === currentGroup.id ? updatedGroup.data : g));
        await fetchUsers(searchTerm);
        setSuccessMessage('Group updated successfully');
      } else {
        groupData.is_system = currentGroup.is_system; // Only include for new groups
        response = await groupsAPI.createGroup(groupData);
        if (currentGroup.members?.length > 0) {
          const memberIds = Array.isArray(currentGroup.members) ? currentGroup.members.map(id => Number(id)) : [];
          await groupsAPI.updateGroupMembers(response.data.id, { members: memberIds });
        }
        const newGroup = await groupsAPI.getGroup(response.data.id);
        setGroups([...groups, newGroup.data]);
        await fetchUsers(searchTerm);
        setSuccessMessage('Group created successfully');
      }
      setOpenGroupDialog(false);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            formattedErrors[key] = serverErrors[key].map(error => error.string || error).join(', ');
          } else {
            formattedErrors[key] = serverErrors[key];
          }
        });
        setFormErrors(formattedErrors);
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save group');
      }
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
        is_default: role.is_default || false,
        is_system: role.is_system || false
      });
    } else {
      setCurrentRole({
        id: null,
        name: '',
        code: '',
        description: '',
        permissions: [],
        is_default: false,
        is_system: false
      });
    }
    setFormErrors({});
    setOpenRoleDialog(true);
  };

  const handleSaveRole = async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setFormErrors({});
      if (!currentRole.name) throw new Error('Role name is required');
      if (!currentRole.code) throw new Error('Role code is required');
      const roleData = {
        name: currentRole.name,
        code: currentRole.code,
        description: currentRole.description,
        permissions: Array.isArray(currentRole.permissions) ? currentRole.permissions : [],
        is_default: currentRole.is_default,
        is_system: currentRole.is_system
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
      if (err.response?.status === 400 && err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            formattedErrors[key] = serverErrors[key].map(error => error.string || error).join(', ');
          } else {
            formattedErrors[key] = serverErrors[key];
          }
        });
        setFormErrors(formattedErrors);
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save role');
      }
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

  const handleOpenMembersDialog = async (groupId) => {
    try {
      setLoadingMembers(true);
      setCurrentGroupId(groupId);
      setMembersDialogError(null); // Clear previous errors
      const response = await groupsAPI.getGroupMembers(groupId);
      setCurrentGroupMembers(response.data || []);
      await fetchAvailableUsers(groupId, membersSearchTerm);
      setOpenMembersDialog(true);
    } catch (err) {
      setMembersDialogError(err.response?.data?.detail || err.message || 'Failed to fetch group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setLoadingMembers(true);
      setMembersDialogError(null); // Clear previous errors
      await groupsAPI.addGroupMember(currentGroupId, userId);
      const response = await groupsAPI.getGroupMembers(currentGroupId);
      setCurrentGroupMembers(response.data || []);
      const updatedGroup = await groupsAPI.getGroup(currentGroupId);
      setGroups(groups.map(g => g.id === currentGroupId ? updatedGroup.data : g));
      await fetchUsers(searchTerm);
      setSuccessMessage('User added to group successfully');
    } catch (err) {
      setMembersDialogError(err.response?.data?.detail || err.message || 'Failed to add user to group');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setLoadingMembers(true);
      setMembersDialogError(null); // Clear previous errors
      await groupsAPI.removeGroupMember(currentGroupId, userId);
      const response = await groupsAPI.getGroupMembers(currentGroupId);
      setCurrentGroupMembers(response.data || []);
      const updatedGroup = await groupsAPI.getGroup(currentGroupId);
      setGroups(groups.map(g => g.id === currentGroupId ? updatedGroup.data : g));
      await fetchUsers(searchTerm);
      setSuccessMessage('User removed from group successfully');
    } catch (err) {
      setMembersDialogError(err.response?.data?.detail || err.message || 'Failed to remove user from group');
    } finally {
      setLoadingMembers(false);
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

  // const getRoleIcon = (roleCode) => {
  //   switch (roleCode) {
  //     case 'superadmin': return <SuperAdminIcon className="role-icon" />;
  //     case 'admin': return <AdminIcon className="role-icon" />;
  //     case 'instructors': return <InstructorIcon className="role-icon" />;
  //     case 'learners': return <LearnerIcon className="role-icon" />;
  //     default: return <PeopleIcon className="role-icon" />;
  //   }
  // };

    const getRoleIcon = (roleCode) => {
    if (!roleCode) return <PeopleIcon className="role-icon" />;
    
    switch (roleCode.toLowerCase()) {
      case 'superadmin': return <SuperAdminIcon className="role-icon" />;
      case 'admin': return <AdminIcon className="role-icon" />;
      case 'instructors': return <InstructorIcon className="role-icon" />;
      case 'learners': return <LearnerIcon className="role-icon" />;
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

  return (
    <div className="ugm-container">
      {loading.main && groups.length === 0 && roles.length === 0 ? (
        <div className="ugm-container ugm-loading">
          <div className="ugm-spinner"></div>
        </div>
      ) : (
        <>
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
            <ErrorBoundary>
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
                              <span>{role.name} {role.is_system ? '[System]' : ''}</span>
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
                                disabled={role.is_system || role.is_default}
                                title={role.is_system ? 'System roles cannot be deleted' : role.is_default ? 'Default role cannot be deleted' : ''}
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
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
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
                              <span className={group.is_system ? 'ugm-system-group' : ''}>
                                {group.name} {group.is_system ? '[System]' : ''}
                              </span>
                            </td>
                            <td>
                              <span className="ugm-text-secondary">{group.description || 'No description'}</span>
                            </td>
                            {/* <td>
                              <div className="ugm-table-cell">
                                {group.role && typeof group.role === 'object' && group.role.name && group.role.code ? (
                                  <>
                                    {getRoleIcon(group.role.code)}
                                    <span>{group.role.name}</span>
                                  </>
                                ) : (
                                  <span>No role assigned</span>
                                )}
                              </div>
                            </td> */}
                              <td>
                                <div className="ugm-table-cell">
                                  {group.role?.name ? (
                                    <>
                                      {getRoleIcon(group?.role?.code || '')}
                                      <span>{group?.role?.name}</span>
                                    </>
                                  ) : (
                                    <span>No role assigned</span>
                                  )}
                                </div>
                              </td>
                              <td>
                              <span className={`ugm-status ${group.is_active ? 'active' : 'inactive'}`}>
                                {group.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td onClick={() => handleOpenMembersDialog(group.id)} style={{ cursor: 'pointer' }}>
                              <div className="ugm-member-container">

                                {group.memberships?.slice(0, 3).map(membership => {
                                  // Pass membership.user.id instead of membership.user
                                  const user = getUserById(membership.user.id);
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
                                  disabled={group.is_system}
                                  title={group.is_system ? 'System groups cannot be deleted' : ''}
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
            </ErrorBoundary>
          )}

          {openRoleDialog && (
            <div className="ugm-role-dialog">
              <div className="ugm-dialog-backdrop" onClick={() => setOpenRoleDialog(false)}></div>
              <div className="ugm-dialog">
                <div className="ugm-dialog-header">
                  <h3>{currentRole.id ? 'Edit Role' : 'Create New Role'}</h3>
                  <button className="ugm-dialog-close" onClick={() => setOpenRoleDialog(false)}>
                    <CloseIcon />
                  </button>
                </div>
                <DialogContent
                  type="role"
                  data={currentRole}
                  setData={setCurrentRole}
                  roles={roles}
                  users={users}
                  loading={loading}
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  userPagination={userPagination}
                  setUserPagination={setUserPagination}
                  toggleMember={toggleMember}
                  formErrors={formErrors}
                />
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
          )}

          {openGroupDialog && (
            <div className="ugm-group-dialog">
              <div className="ugm-dialog-backdrop" onClick={() => setOpenGroupDialog(false)}></div>
              <div className="ugm-dialog">
                <div className="ugm-dialog-header">
                  <h3>{currentGroup.id ? 'Edit Group' : 'Create New Group'}</h3>
                  <button className="ugm-dialog-close" onClick={() => setOpenGroupDialog(false)}>
                    <CloseIcon />
                  </button>
                </div>
                <DialogContent
                  type="group"
                  data={currentGroup}
                  setData={setCurrentGroup}
                  roles={roles}
                  users={users}
                  loading={loading}
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  userPagination={userPagination}
                  setUserPagination={setUserPagination}
                  toggleMember={toggleMember}
                  formErrors={formErrors}
                />
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
          )}

          {openMembersDialog && (
            <div className="ugm-members-dialog">
              <div className="ugm-dialog-backdrop" onClick={() => setOpenMembersDialog(false)}></div>
              <div className="ugm-dialog">
                <div className="ugm-dialog-header">
                  <h3>Manage Members for {groups.find(g => g.id === currentGroupId)?.name || 'Group'}</h3>
                  <button className="ugm-dialog-close" onClick={() => setOpenMembersDialog(false)}>
                    <CloseIcon />
                  </button>
                </div>
                {membersDialogError && (
                  <div className="ugm-alert ugm-alert-error">
                    <span>{membersDialogError}</span>
                    <button onClick={() => setMembersDialogError(null)} className="ugm-alert-close">
                      <CloseIcon />
                    </button>
                  </div>
                )}
                <div className="ugm-dialog-content">
                  <div className="ugm-search-input">
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search users to add..."
                      value={membersSearchInput}
                      onChange={(e) => setMembersSearchInput(e.target.value)}
                    />
                  </div>
                  {loading.users || loadingMembers ? (
                    <div className="ugm-members-loading">
                      <div className="ugm-spinner-small"></div>
                    </div>
                  ) : (
                    <>
                      <h4>Current Members ({currentGroupMembers.length})</h4>
                      {currentGroupMembers.length > 0 ? (
                        <div className="ugm-members-list">
                          {currentGroupMembers.map(membership => {
                            const user = getUserById(membership.user);
                            return user ? (
                              <div key={user.id} className="ugm-member-item">
                                <div className="ugm-member-info">
                                  <div className="ugm-avatar">{user.first_name?.charAt(0)}</div>
                                  <div>
                                    <span>{user.first_name} {user.last_name}</span>
                                    <span className="ugm-text-secondary">{user.email}</span>
                                    {/* <span className="ugm-text-secondary">Role: {membership.role || 'None'}</span> */}
                                    <span  className="ugm-text-secondary">Role: {typeof membership.role === 'object' ? membership.role.name : (membership.role || 'None')}</span>

                                  </div>
                                </div>
                                <button
                                  className="ugm-btn ugm-btn-delete"
                                  onClick={() => handleRemoveMember(user.id)}
                                  title="Remove member"
                                >
                                  <DeleteIcon />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <div className="ugm-no-data">No members in this group</div>
                      )}
                      <h4>Add New Members</h4>
                      {users.length > 0 ? (
                        <div className="ugm-members-list">
                          {users
                            .filter(user => !currentGroupMembers.some(m => m.user === user.id))
                            .map(user => (
                              <div key={user.id} className="ugm-member-item">
                                <div className="ugm-member-info">
                                  <div className="ugm-avatar">{user.first_name?.charAt(0)}</div>
                                  <div>
                                    <span>{user.first_name} {user.last_name}</span>
                                    <span className="ugm-text-secondary">{user.email}</span>
                                    <span className="ugm-text-secondary">Role: {user.role || 'None'}</span>
                                  </div>
                                </div>
                                <button
                                  className="ugm-btn ugm-btn-primary"
                                  onClick={() => handleAddMember(user.id)}
                                  title="Add member"
                                >
                                  <AddIcon />
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="ugm-no-data">No users available to add</div>
                      )}
                      <div className="ugm-pagination">
                        <div className="ugm-items-per-page">
                          <span>Items per page:</span>
                          <select
                            value={membersPagination.pageSize}
                            onChange={(e) => setMembersPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), currentPage: 1 }))}
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                          </select>
                        </div>
                        <div className="ugm-page-navigation">
                          <span>
                            {((membersPagination.currentPage - 1) * membersPagination.pageSize + 1)}-
                            {Math.min(membersPagination.currentPage * membersPagination.pageSize, membersPagination.count)} of {membersPagination.count}
                          </span>
                          <div className="ugm-page-btns">
                            <button
                              onClick={() => setMembersPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                              disabled={membersPagination.currentPage === 1}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </button>
                            <button
                              onClick={() => setMembersPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                              disabled={membersPagination.currentPage * membersPagination.pageSize >= membersPagination.count}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="ugm-dialog-actions">
                  <button className="ugm-btn ugm-btn-cancel" onClick={() => setOpenMembersDialog(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserGroupsManagement;