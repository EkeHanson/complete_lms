import axios from 'axios';

// export const API_BASE_URL = 'http://localhost:9090';
// export const CMVP_SITE_URL = 'http://localhost:3000';
// export const CMVP_API_URL = 'http://localhost:3000';

export const API_BASE_URL = 'https://complete-lms-api.onrender.com';
export const CMVP_SITE_URL = 'https://cmvp.net';
export const CMVP_API_URL =  'https://test.api.cmvp.net';

// Payment Methods Configuration
export const paymentMethods = [
  {
    name: 'Paystack',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' },
    ],
  },
  {
    name: 'Paypal',
    fields: [
      { label: 'Sandbox Client ID', key: 'sandboxClientId' },
      { label: 'Sandbox Secret Key', key: 'sandboxSecretKey' },
    ],
  },
  {
    name: 'Remita',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' },
    ],
  },
  {
    name: 'Stripe',
    fields: [
      { label: 'Publishable Key', key: 'publishableKey' },
      { label: 'Secret Key', key: 'secretKey' },
    ],
  },
  {
    name: 'Flutterwave',
    fields: [
      { label: 'Public Key', key: 'publicKey' },
      { label: 'Secret Key', key: 'secretKey' },
    ],
  },
];

// Supported Currencies
export const currencies = ['USD', 'NGN', 'EUR', 'GBP', 'KES', 'GHS'];

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

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
    return api.post('/users/api/users/bulk_upload/', { headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' } });
  }
};

export const authAPI = {
  login: (credentials) => api.post('/users/api/token/', credentials),
  logout: () => api.post('/users/api/logout/', { refresh: localStorage.getItem('refresh_token') }),
  refreshToken: (refreshToken) => api.post('/users/api/token/refresh/', { refresh: refreshToken }),
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
  updateRolePermissions: (id, permissions) => api.put(`/groups/api/roles/${id}/permissions/`, { permissions }),
  validateRole: (data) => api.post('/groups/api/roles/validate/', data)
};

export const groupsAPI = {
  getGroups: (params = {}) => api.get('/groups/api/groups/', { params }),
  getGroup: (id) => api.get(`/groups/api/groups/${id}/`),
  createGroup: (data) => api.post('/groups/api/groups/', data),
  updateGroup: (id, data) => api.patch(`/groups/api/groups/${id}/`, data),
  deleteGroup: (id) => api.delete(`/groups/api/groups/${id}/`),
  getGroupMembers: (groupId) => api.get(`/groups/api/groups/${groupId}/members/`),
  getGroupMembersByName: (name) => api.get(`/groups/api/groups/by-name/${name}/members/`),
  addGroupMember: (groupId, userId) => api.post(`/groups/api/groups/${groupId}/members/`, { user_id: userId }),
  removeGroupMember: (groupId, userId) => api.delete(`/groups/api/groups/${groupId}/members/${userId}/`),
  updateGroupMembers: (groupId, data) => {
    const numericMemberIds = (data.members || []).map(id => Number(id));
    return api.post(`/groups/api/groups/${groupId}/update_members/`, { members: numericMemberIds }, {
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() }
    });
  }
};

export const activityAPI = {
  getActivities: (params = {}) => api.get('/activitylog/api/activities/', { params }),
  getActivity: (id) => api.get(`/activitylog/api/activities/${id}/`),
  getUserActivities: (userId) => api.get(`/activitylog/api/user-activities/${userId}/`)
};

export const messagingAPI = {
  getMessages: (params = {}) => api.get('/messaging/api/messages/', { params }),
  getMessage: (id) => api.get(`/messaging/api/messages/${id}/`),
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
    return api.post('/attachments/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      headers: { 'Content-Type': 'multipart/form-data', 'X-CSRFToken': getCSRFToken() }
    });
  },
  createAdvert: (advertData) => {
    return api.post('/adverts/api/adverts/', advertData, {
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() }
    });
  },
  updateAdvert: (id, advertData, isFormData = false) => {
    return api.put(`/adverts/api/adverts/${id}/`, advertData, {
      headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json', 'X-CSRFToken': getCSRFToken() }
    });
  },
  deleteAdvert: (id) => api.delete(`/adverts/api/adverts/${id}/`),
  toggleAdvertStatus: (id, status) => api.patch(`/adverts/api/adverts/${id}/`, { status }),
  getAdvertStats: () => api.get('/adverts/api/adverts/stats/'),
  getAdverts: () => api.get('/adverts/api/adverts/'),
  getTargetStats: () => api.get('/adverts/api/adverts/target_stats/'),
};

export const coursesAPI = {
  getCategories: (params = {}) => api.get('/courses/categories/', { params }),
  getCategory: (id) => api.get(`/courses/categories/${id}/`),
  createCategory: (data) => api.post('/courses/categories/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  updateCategory: (id, data) => api.patch(`/courses/categories/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  deleteCategory: (id) => api.delete(`/courses/categories/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getCourses: (params = {}) => api.get('/courses/courses/', { params }),
  getCourse: (id) => api.get(`/courses/courses/${id}/`),
  createCourse: (formData) => api.post('/courses/courses/', formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  updateCourse: (id, formData) => api.patch(`/courses/courses/${id}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  deleteCourse: (id) => api.delete(`/courses/courses/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getModules: (courseId, params = {}) => api.get(`/courses/courses/${courseId}/modules/`, { params }),
  getModule: (courseId, moduleId) => api.get(`/courses/courses/${courseId}/modules/${moduleId}/`),
  createModule: (courseId, data) => api.post(`/courses/courses/${courseId}/modules/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  updateModule: (courseId, moduleId, data) => api.patch(`/courses/courses/${courseId}/modules/${moduleId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  deleteModule: (courseId, moduleId) => api.delete(`/courses/courses/${courseId}/modules/${moduleId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getLessons: (courseId, moduleId, params = {}) => api.get(`/courses/courses/${courseId}/modules/${moduleId}/lessons/`, { params }),
  getLesson: (courseId, moduleId, lessonId) => api.get(`/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`),
  createLesson: (courseId, moduleId, formData) => api.post(`/courses/courses/${courseId}/modules/${moduleId}/lessons/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  updateLesson: (courseId, moduleId, lessonId, formData) => api.patch(`/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  deleteLesson: (courseId, moduleId, lessonId) => api.delete(`/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getResources: (courseId, params = {}) => api.get(`/courses/courses/${courseId}/resources/`, { params }),
  createResource: (courseId, formData) => api.post(`/courses/courses/${courseId}/resources/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  updateResource: (courseId, resourceId, formData) => api.patch(`/courses/courses/${courseId}/resources/${resourceId}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' }
  }),
  deleteResource: (courseId, resourceId) => api.delete(`/courses/courses/${courseId}/resources/${resourceId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getEnrollments: (courseId = null) => {
    const url = courseId ? `/courses/enrollments/course/${courseId}/` : '/courses/enrollments/';
    return api.get(url);
  },
  enrollCourse: (courseId) => api.post(`/courses/enrollments/course/${courseId}/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  getRatings: (courseId = null) => {
    const url = courseId ? `/courses/ratings/course/${courseId}/` : '/courses/ratings/';
    return api.get(url);
  },
  submitRating: (courseId, data) => api.post(`/courses/ratings/course/${courseId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  getLearningPaths: (params = {}) => api.get('/courses/learning-paths/', { params }),
  getLearningPath: (id) => api.get(`/courses/learning-paths/${id}/`),
  createLearningPath: (data) => api.post('/courses/learning-paths/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  updateLearningPath: (id, data) => api.patch(`/courses/learning-paths/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  deleteLearningPath: (id) => api.delete(`/courses/learning-paths/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getCertificates: (courseId = null) => {
    const url = courseId ? `/courses/certificates/course/${courseId}/` : '/courses/certificates/';
    return api.get(url);
  }
};

export const paymentAPI = {
  getPaymentConfig: () => api.get('/payments/payment-config'),
  createPaymentConfig: (data) => api.post('/payments/payment-config', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  updatePaymentConfig: (data) => api.patch('/payments/payment-config/update', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  deletePaymentConfig: () => api.delete('/payments/payment-config/delete', {
    headers: { 'X-CSRFToken': getCSRFToken() }
  }),
  getSiteConfig: () => api.get('/payments/site-config'),
  createSiteConfig: (data) => api.post('/payments/site-config', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  }),
  updateSiteConfig: (data) => api.patch('/payments/site-config/update', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' }
  })
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
  CMVP_SITE_URL,
  CMVP_API_URL,
  paymentMethods,
  currencies,
  api,
  userAPI,
  authAPI,
  rolesAPI,
  groupsAPI,
  activityAPI,
  messagingAPI,
  scheduleAPI,
  advertAPI,
  coursesAPI,
  paymentAPI,
  setAuthTokens,
  clearAuthTokens,
  getAuthHeader,
};