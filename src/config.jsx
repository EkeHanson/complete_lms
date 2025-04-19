
// import axios from 'axios';

// // Base API URL - switch between development and production as needed
// const API_BASE_URL = 'http://localhost:9090';
// // const API_BASE_URL = 'https://complete-lms-api.onrender.com';

// // Create base axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Request interceptor to add auth token to every request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token refresh and errors
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // If 401 error and we haven't already tried to refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         if (!refreshToken) throw error;
        
//         const response = await axios.post(`${API_BASE_URL}/users/api/token/refresh/`, {
//           refresh: refreshToken
//         });
        
//         const { access } = response.data;
//         localStorage.setItem('access_token', access);
//         originalRequest.headers.Authorization = `Bearer ${access}`;
//         return api(originalRequest);
//       } catch (err) {
//         // If refresh fails, clear tokens and redirect to login
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(err);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // Helper function to get CSRF token from cookies
// const getCSRFToken = () => {
//   const cookieValue = document.cookie
//     .split('; ')
//     .find(row => row.startsWith('csrftoken='))
//     ?.split('=')[1];
//   return cookieValue || '';
// };

// // API endpoints configuration
// export const userAPI = {
//   // User management
//   getUsers: (params = {}) => api.get('/users/api/users/', { params }),
//   getUser: (id) => api.get(`/users/api/users/${id}/`),
//   createUser: (userData) => api.post('/users/api/register/', userData),
//   updateUser: (id, userData) => api.patch(`/users/api/users/${id}/`, userData),
//   deleteUser: (id) => api.delete(`/users/api/users/${id}/`),
//   fetchRoleStats: (params = {}) => api.get('/users/api/users/role_stats/', { params }),
//   getUserActivities: (params = {}) => api.get('/users/api/user-activities/', { params }),
//   getUserStats: () => api.get('/users/api/users/stats/'),
  
//   // Bulk user upload
//   bulkUpload: (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post('/users/api/users/bulk_upload/', formData, {
//       headers: {
//         'X-CSRFToken': getCSRFToken(),
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//   }
// };

// export const authAPI = {
//   // Authentication
//   login: (credentials) => api.post('/users/api/token/', credentials),
//   logout: () => api.post('/users/api/logout/', { 
//     refresh: localStorage.getItem('refresh_token') 
//   }),
//   refreshToken: (refreshToken) => api.post('/users/api/token/refresh/', {
//     refresh: refreshToken
//   }),
//   getCurrentUser: () => api.get('/users/api/profile/'),
//   register: (userData) => api.post('/users/api/register/', userData),
//   verifyToken: (token) => api.post('/users/api/token/verify/', { token }),
//   changePassword: (data) => api.post('/users/api/change-password/', data),
//   resetPassword: (email) => api.post('/users/api/reset-password/', { email }),
//   confirmResetPassword: (data) => api.post('/users/api/reset-password/confirm/', data)
// };

// export const rolesAPI = {
//   getRoles: (params = {}) => api.get('/groups/api/roles/', { params }),
//   getRole: (id) => api.get(`/groups/api/roles/${id}/`),
//   createRole: (data) => api.post('/groups/api/roles/', data),
//   updateRole: (id, data) => api.patch(`/groups/api/roles/${id}/`, data),
//   deleteRole: (id) => api.delete(`/groups/api/roles/${id}/`),
//   setDefaultRole: (id) => api.post(`/groups/api/roles/${id}/set_default/`, {}),
//   getRolePermissions: (id) => api.get(`/groups/api/roles/${id}/permissions/`),
//   updateRolePermissions: (id, permissions) => api.put(
//     `/groups/api/roles/${id}/permissions/`,
//     { permissions }
//   ),
//   validateRole: (data) => api.post('/groups/api/roles/validate/', data)
// };

// export const groupsAPI = {
//   getGroups: (params = {}) => api.get('/groups/api/groups/', { params }),
//   getGroup: (id) => api.get(`/groups/api/groups/${id}/`),
//   createGroup: (data) => api.post('/groups/api/groups/', data),
//   updateGroup: (id, data) => api.patch(`/groups/api/groups/${id}/`, data),
//   deleteGroup: (id) => api.delete(`/groups/api/groups/${id}/`),
//   getGroupMembers: (groupId) => api.get(`/groups/api/groups/${groupId}/members/`),
//   addGroupMember: (groupId, userId) => api.post(
//     `/groups/api/groups/${groupId}/members/`,
//     { user_id: userId }
//   ),
//   removeGroupMember: (groupId, userId) => api.delete(
//     `/groups/api/groups/${groupId}/members/${userId}/`
//   ),


//   updateGroupMembers: (groupId, data) => {
//     const numericMemberIds = (data.members || []).map(id => Number(id));
//     return api.post(
//       `/groups/api/groups/${groupId}/update_members/`,
//       { members: numericMemberIds },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRFToken': getCSRFToken()
//         }
//       }
//     );
//   }
// };

// export const activityAPI = {
//   getActivities: (params = {}) => api.get('/activitylog/api/activities/', { params }),
//   getActivity: (id) => api.get(`/activitylog/api/activities/${id}/`),
//   getUserActivities: (userId) => api.get(`/activitylog/api/user-activities/${userId}/`)
// };

// // Utility functions
// export const setAuthTokens = (access, refresh) => {
//   localStorage.setItem('access_token', access);
//   localStorage.setItem('refresh_token', refresh);
// };

// export const clearAuthTokens = () => {
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('refresh_token');
// };

// export const getAuthHeader = () => ({
//   Authorization: `Bearer ${localStorage.getItem('access_token')}`
// });


// export const messagingAPI = {
//   getMessages: (params = {}) => api.get('/messaging/api/messages/', { params }),
//   getMessage: (id) => api.get(`/messaging/api/messages//${id}/`),
//   createMessage: (data) => api.post('/messaging/api/messages/', data),
//   updateMessage: (id, data) => api.patch(`/messaging/api/messages/${id}/`, data),
//   deleteMessage: (id) => api.delete(`/messaging/api/messages/${id}/`),
//   markAsRead: (id) => api.patch(`/messaging/api/messages/${id}/mark_as_read/`),
//   forwardMessage: (id, data) => api.post(`/messaging/api/messages/${id}/forward/`, data),
//   replyToMessage: (id, data) => api.post(`/messaging/api/messages/${id}/reply/`, data),
//   getUnreadCount: () => api.get('/messaging/api/messages/unread_count/'),
  

//   getMessageTypes: () => api.get('/messaging/api/message-types'),
//   createMessageType: (data) => api.post('/messaging/api/message-types/', data),
//   updateMessageType: (id, data) => api.patch(`/messaging/api/message-types/${id}/`, data),
//   deleteMessageType: (id) => api.delete(`/messaging/api/message-types/${id}/`),
//   setDefaultMessageType: (id) => api.post(`/message-types/${id}/set_default/`),
  
  
//   // Attachment methods
//   uploadAttachment: (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post('/attachments/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//   },
//   deleteAttachment: (id) => api.delete(`/attachments/${id}/`)
// };

// export const scheduleAPI = {
//   getSchedules: (params) => api.get('/schedule/api/schedules/', { params }),
//   getSchedule: (id) => api.get(`/schedule/api/schedules/${id}/`),
//   createSchedule: (data) => api.post('/schedule/api/schedules/', data),
//   updateSchedule: (id, data) => api.put(`/schedule/api/schedules/${id}/`, data),
//   deleteSchedule: (id) => api.delete(`/schedule/api/schedules/${id}/`),
//   respondToSchedule: (id, response) => api.post(`/schedule/api/schedules/${id}/respond/`, { response_status: response }),
//   getUpcomingSchedules: () => api.get('/schedule/api/schedules/'),
// };

// // Add this to your existing config file (likely where userAPI, scheduleAPI, etc. are defined)

// // Add this to your existing config file (likely where userAPI, scheduleAPI, etc. are defined)

// export const advertAPI = {
//   // Advert management
//   getAdverts: (params = {}) => api.get('/adverts/api/adverts/', { params }),
//   getAdvert: (id) => api.get(`/adverts/api/adverts/${id}/`),
//   createAdvert: (advertData) => api.post('/adverts/api/adverts/', advertData, {
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRFToken': getCSRFToken()
//     }
//   }),
//   updateAdvert: (id, advertData) => api.patch(`/adverts/api/adverts/${id}/`, advertData, {
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRFToken': getCSRFToken()
//     }
//   }),
//   deleteAdvert: (id) => api.delete(`/adverts/api/adverts/${id}/`),
//   toggleAdvertStatus: (id, status) => api.patch(`/adverts/api/adverts/${id}/status/`, { status }),
  
//   // Image management
//   uploadAdvertImages: (id, files) => {
//     const formData = new FormData();
//     files.forEach(file => formData.append('images', file));
//     return api.post(`/adverts/api/adverts/${id}/upload_images/`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         'X-CSRFToken': getCSRFToken()
//       }
//     });
//   },
//   deleteAdvertImage: (advertId, imageId) => api.delete(`/adverts/api/adverts/${advertId}/images/${imageId}/`),
  
//   // Activity feed
//   getAdvertActivities: (id, params = {}) => api.get(`/adverts/api/adverts/${id}/activities/`, { params }),
  
//   // Statistics
//   getAdvertStats: () => api.get('/adverts/api/adverts/stats/'),
//   getTargetStats: () => api.get('/adverts/api/adverts/target_stats/'),
  
//   // Batch operations
//   bulkUpdateAdverts: (data) => api.post('/adverts/api/adverts/bulk_update/', data),
//   bulkDeleteAdverts: (ids) => api.post('/adverts/api/adverts/bulk_delete/', { ids })
// };

// export default {
//   API_BASE_URL, advertAPI,
//   api,messagingAPI,scheduleAPI,
//   userAPI,  authAPI,  rolesAPI,
//   groupsAPI,
//   activityAPI,
//   setAuthTokens,
//   clearAuthTokens,
//   getAuthHeader
// };

import axios from 'axios';

// Base API URL - switch between development and production as needed
const API_BASE_URL = 'http://localhost:9090';
// const API_BASE_URL = 'https://complete-lms-api.onrender.com';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw error;
        
        const response = await axios.post(`${API_BASE_URL}/users/api/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get CSRF token from cookies
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// API endpoints configuration
export const userAPI = {
  getUsers: (params = {}) => api.get('/users/api/users/', { params }),
  getUser: (id) => api.get(`/users/api/users/${id}/`),
  createUser: (userData) => api.post('/users/api/register/', userData),
  updateUser: (id, userData) => api.patch(`/users/api/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/users/api/users/${id}/`),
  fetchRoleStats: (params = {}) => api.get('/users/api/users/role_stats/', { params }),
  getUserActivities: (params = {}) => api.get('/users/api/user-activities/', { params }),
  getUserStats: () => api.get('/users/api/users/stats/'),
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/api/users/bulk_upload/', formData, {
      headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const authAPI = {
  login: (credentials) => api.post('/users/api/token/', credentials),
  logout: () => api.post('/users/api/logout/', { 
    refresh: localStorage.getItem('refresh_token') 
  }),
  refreshToken: (refreshToken) => api.post('/users/api/token/refresh/', {
    refresh: refreshToken
  }),
  getCurrentUser: () => api.get('/users/api/profile/'),
  register: (userData) => api.post('/users/api/register/', userData),
  verifyToken: (token) => api.post('/users/api/token/verify/', { token }),
  changePassword: (data) => api.post('/users/api/change-password/', data),
  resetPassword: (email) => api.post('/users/api/reset-password/', { email }),
  confirmResetPassword: (data) => api.post('/users/api/reset-password/confirm/', data)
};

export const rolesAPI = {
  getRoles: (params = {}) => api.get('/groups/api/roles/', { params }),
  getRole: (id) => api.get(`/groups/api/roles/${id}/`),
  createRole: (data) => api.post('/groups/api/roles/', data),
  updateRole: (id, data) => api.patch(`/groups/api/roles/${id}/`, data),
  deleteRole: (id) => api.delete(`/groups/api/roles/${id}/`),
  setDefaultRole: (id) => api.post(`/groups/api/roles/${id}/set_default/`, {}),
  getRolePermissions: (id) => api.get(`/groups/api/roles/${id}/permissions/`),
  updateRolePermissions: (id, permissions) => api.put(
    `/groups/api/roles/${id}/permissions/`,
    { permissions }
  ),
  validateRole: (data) => api.post('/groups/api/roles/validate/', data)
};

export const groupsAPI = {
  getGroups: (params = {}) => api.get('/groups/api/groups/', { params }),
  getGroup: (id) => api.get(`/groups/api/groups/${id}/`),
  createGroup: (data) => api.post('/groups/api/groups/', data),
  updateGroup: (id, data) => api.patch(`/groups/api/groups/${id}/`, data),
  deleteGroup: (id) => api.delete(`/groups/api/groups/${id}/`),
  getGroupMembers: (groupId) => api.get(`/groups/api/groups/${groupId}/members/`),
  addGroupMember: (groupId, userId) => api.post(
    `/groups/api/groups/${groupId}/members/`,
    { user_id: userId }
  ),
  removeGroupMember: (groupId, userId) => api.delete(
    `/groups/api/groups/${groupId}/members/${userId}/`
  ),
  updateGroupMembers: (groupId, data) => {
    const numericMemberIds = (data.members || []).map(id => Number(id));
    return api.post(
      `/groups/api/groups/${groupId}/update_members/`,
      { members: numericMemberIds },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        }
      }
    );
  }
};

export const activityAPI = {
  getActivities: (params = {}) => api.get('/activitylog/api/activities/', { params }),
  getActivity: (id) => api.get(`/activitylog/api/activities/${id}/`),
  getUserActivities: (userId) => api.get(`/activitylog/api/user-activities/${userId}/`)
};

export const messagingAPI = {
  getMessages: (params = {}) => api.get('/messaging/api/messages/', { params }),
  getMessage: (id) => api.get(`/messaging/api/messages//${id}/`),
  createMessage: (data) => api.post('/messaging/api/messages/', data),
  updateMessage: (id, data) => api.patch(`/messaging/api/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/messaging/api/messages/${id}/`),
  markAsRead: (id) => api.patch(`/messaging/api/messages/${id}/mark_as_read/`),
  forwardMessage: (id, data) => api.post(`/messaging/api/messages/${id}/forward/`, data),
  replyToMessage: (id, data) => api.post(`/messaging/api/messages/${id}/reply/`, data),
  getUnreadCount: () => api.get('/messaging/api/messages/unread_count/'),
  getMessageTypes: () => api.get('/messaging/api/message-types'),
  createMessageType: (data) => api.post('/messaging/api/message-types/', data),
  updateMessageType: (id, data) => api.patch(`/messaging/api/message-types/${id}/`, data),
  deleteMessageType: (id) => api.delete(`/messaging/api/message-types/${id}/`),
  setDefaultMessageType: (id) => api.post(`/message-types/${id}/set_default/`),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteAttachment: (id) => api.delete(`/attachments/${id}/`)
};

export const scheduleAPI = {
  getSchedules: (params) => api.get('/schedule/api/schedules/', { params }),
  getSchedule: (id) => api.get(`/schedule/api/schedules/${id}/`),
  createSchedule: (data) => api.post('/schedule/api/schedules/', data),
  updateSchedule: (id, data) => api.put(`/schedule/api/schedules/${id}/`, data),
  deleteSchedule: (id) => api.delete(`/schedule/api/schedules/${id}/`),
  respondToSchedule: (id, response) => api.post(`/schedule/api/schedules/${id}/respond/`, { response_status: response }),
  getUpcomingSchedules: () => api.get('/schedule/api/schedules/'),
};

export const advertAPI = {
  createAdvertWithImage: (formData) => {
    return api.post('/adverts/api/adverts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': getCSRFToken()
      }
    });
  },
  
  createAdvert: (advertData) => {
    return api.post('/adverts/api/adverts/', advertData, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      }
    });
  },
  
  updateAdvert: (id, advertData, isFormData = false) => {
    return api.put(`/adverts/api/adverts/${id}/`, advertData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        'X-CSRFToken': getCSRFToken()
      }
    });
  },
  
  deleteAdvert: (id) => api.delete(`/adverts/api/adverts/${id}/`),
  toggleAdvertStatus: (id, status) => api.patch(`/adverts/api/adverts/${id}/`, { status }),
  getAdvertStats: () => api.get('/adverts/api/adverts/stats/'),
  getAdverts: () => api.get('/adverts/api/adverts/'),
  getTargetStats: () => api.get('/adverts/api/adverts/target_stats/'),
};

// Utility functions
export const setAuthTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`
});

export default {
  API_BASE_URL,
  api,
  userAPI,
  authAPI,
  rolesAPI,
  groupsAPI,
  activityAPI,
  messagingAPI,
  scheduleAPI,
  advertAPI,
  setAuthTokens,
  clearAuthTokens,
  getAuthHeader
};