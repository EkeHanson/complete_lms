// config.js
import axios from 'axios';

// Environment variables for URLs (fallback to localhost for development)
//export const API_BASE_URL = 'https://complete-lms-api.onrender.com';
export const API_BASE_URL = 'http://localhost:9090';
export const CMVP_SITE_URL = 'http://localhost:3000';
export const CMVP_API_URL = 'http://localhost:9091';

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
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const isSuperAdmin = async () => {
  try {
    const response = await api.get('/api/token/validate/');
    return response.data.user.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

// Helper function to get CSRF token
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// Request interceptor to add CSRF token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    console.log('Request details:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      cookies: document.cookie,
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Consolidated response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response details:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      cookies: document.cookie,
    });
    return response;
  },
  async (error) => {
    console.log('Response error details:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      cookies: document.cookie,
    });
    const originalRequest = error.config;
    if (
      originalRequest.url.includes('/api/token/') ||
      originalRequest.url.includes('/api/logout/') ||
      window.location.pathname === '/login'
    ) {
      console.log('Skipping interceptor for token, logout, or login page');
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Attempting token refresh');
      try {
        const refreshResponse = await api.post('/api/token/refresh/', {}, { withCredentials: true });
        console.log('Refresh successful:', refreshResponse.data);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', {
          message: refreshError.message,
          response: refreshError.response?.data,
          status: refreshError.response?.status,
          cookies: document.cookie,
        });
        document.cookie = 'access_token=; Max-Age=0; path=/';
        document.cookie = 'refresh_token=; Max-Age=0; path=/';
        if (window.location.pathname !== '/login') {
          console.log('Redirecting to login due to refresh failure');
          window.location.href = '/login?session_expired=1';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/token/', credentials, { withCredentials: true }),
  logout: () => api.post('/api/logout/', {}, { headers: { 'X-CSRFToken': getCSRFToken() } }),
  refreshToken: () => api.post('/api/token/refresh/', {}, { withCredentials: true }),
  getCurrentUser: () => api.get('/api/token/validate/'),
  register: (userData) => api.post('/users/api/register/', userData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  verifyToken: () => api.get('/api/token/validate/'),
  changePassword: (data) => api.post('/users/api/change-password/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  resetPassword: (email) => api.post('/users/api/reset-password/', { email }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  confirmResetPassword: (data) => api.post('/users/api/reset-password/confirm/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
};

// User API
export const userAPI = {
  impersonateUser: (id) => api.post(`/api/users/${id}/impersonate/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getUsers: (params = {}) => api.get('/api/users/users/', { params }),
  getUser: (id) => api.get(`/api/users/users/${id}/`),
  createUser: (userData) => api.post('/api/users/register/', userData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateUser: (id, userData) => api.patch(`/api/users/users/${id}/`, userData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteUser: (id) => api.delete(`/api/users/users/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  fetchRoleStats: (params = {}) => api.get('/api/users/users/role_stats/', { params }),
  getUserActivities: (params = {}) => api.get('/api/users/user-activities/', { params }),
  getUserStats: () => api.get('/api/users/stats/'),
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/api/users/bulk_upload/', formData, {
      headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Roles API
export const rolesAPI = {
  getRoles: (params = {}) => api.get('/api/groups/roles/', { params }),
  getRole: (id) => api.get(`/api/groups/roles/${id}/`),
  createRole: (data) => api.post('/api/groups/roles/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateRole: (id, data) => api.patch(`/api/groups/roles/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteRole: (id) => api.delete(`/api/groups/roles/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  setDefaultRole: (id) => api.post(`/api/groups/roles/${id}/set_default/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getRolePermissions: (id) => api.get(`/api/groups/roles/${id}/permissions/`),
  updateRolePermissions: (id, permissions) => api.put(`/api/groups/roles/${id}/permissions/`, { permissions }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  validateRole: (data) => api.post('/api/groups/roles/validate/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
};

// Groups API
export const groupsAPI = {
  getGroups: (params = {}) => api.get('/api/groups/groups/', { params }),
  getGroup: (id) => api.get(`/api/groups/groups/${id}/`),
  createGroup: (data) => api.post('/api/groups/groups/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateGroup: (id, data) => api.patch(`/api/groups/groups/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteGroup: (id) => api.delete(`/api/groups/groups/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getGroupMembers: (groupId) => api.get(`/api/groups/groups/${groupId}/members/`),
  getGroupMembersByName: (name) => api.get(`/api/groups/groups/by-name/${name}/members/`),
  addGroupMember: (groupId, userId) => api.post(`/api/groups/groups/${groupId}/members/`, { user_id: userId }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  removeGroupMember: (groupId, userId) => api.delete(`/api/groups/groups/${groupId}/members/${userId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  updateGroupMembers: (groupId, data) => {
    const numericMemberIds = (data.members || []).map(id => Number(id));
    return api.post(`/api/groups/groups/${groupId}/update_members/`, { members: numericMemberIds }, {
      headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
    });
  },
};

// Activity API
export const activityAPI = {
  getActivities: (params = {}) => api.get('/activitylog/api/activities/', { params }),
  getActivity: (id) => api.get(`/activitylog/api/activities/${id}/`),
  getUserActivities: (userId) => api.get(`/activitylog/api/user-activities/${userId}/`),
};

// Messaging API
export const messagingAPI = {
  getMessages: (params = {}) => api.get('/messaging/api/messages/', { params }),
  getMessage: (id) => api.get(`/messaging/api/messages/${id}/`),
  createMessage: (data) => api.post('/messaging/api/messages/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateMessage: (id, data) => api.patch(`/messaging/api/messages/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteMessage: (id) => api.delete(`/messaging/api/messages/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  markAsRead: (id) => api.patch(`/messaging/api/messages/${id}/mark_as_read/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  forwardMessage: (id, data) => api.post(`/messaging/api/messages/${id}/forward/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  replyToMessage: (id, data) => api.post(`/messaging/api/messages/${id}/reply/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getMessageTypes: () => api.get('/messaging/api/message-types/'),
  createMessageType: (data) => api.post('/messaging/api/message-types/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateMessageType: (id, data) => api.patch(`/messaging/api/message-types/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteMessageType: (id) => api.delete(`/messaging/api/message-types/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  setDefaultMessageType: (id) => api.post(`/messaging/api/message-types/${id}/set_default/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getTotalMessages: () => api.get('/messaging/api/messages/stats/'),
  getUnreadCount: () => api.get('/messaging/api/messages/unread_count/'),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/attachments/', formData, {
      headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAttachment: (id) => api.delete(`/attachments/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
};

// Schedule API
export const scheduleAPI = {
  getSchedules: (params) => api.get('/schedule/api/schedules/', { params }),
  getSchedule: (id) => api.get(`/schedule/api/schedules/${id}/`),
  createSchedule: (data) => api.post('/schedule/api/schedules/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateSchedule: (id, data) => api.put(`/schedule/api/schedules/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteSchedule: (id) => api.delete(`/schedule/api/schedules/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  respondToSchedule: (id, response) => api.post(`/schedule/api/schedules/${id}/respond/`, { response_status: response }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getTotalSchedules: () => api.get('/schedule/api/schedules/stats/'),
  getUpcomingSchedules: () => api.get('/schedule/api/schedules/upcoming/'),
};

// Advert API
export const advertAPI = {
  createAdvertWithImage: (formData) => {
    return api.post('/adverts/api/adverts/', formData, {
      headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
    });
  },
  createAdvert: (advertData) => {
    return api.post('/adverts/api/adverts/', advertData, {
      headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
    });
  },
  updateAdvert: (id, advertData, isFormData = false) => {
    return api.put(`/adverts/api/adverts/${id}/`, advertData, {
      headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
  },
  deleteAdvert: (id) => api.delete(`/adverts/api/adverts/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  toggleAdvertStatus: (id, status) => api.patch(`/adverts/api/adverts/${id}/`, { status }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getAdvertStats: () => api.get('/adverts/api/adverts/stats/'),
  getAdverts: () => api.get('/adverts/api/adverts/'),
  getTargetStats: () => api.get('/adverts/api/adverts/target_stats/'),
};

// Courses API
export const coursesAPI = {
  getCategories: (params = {}) => api.get('/courses/categories/', { params }),
  getCategory: (id) => api.get(`/courses/categories/${id}/`),
  createCategory: (data) => api.post('/courses/categories/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateCategory: (id, data) => api.patch(`/courses/categories/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteCategory: (id) => api.delete(`/courses/categories/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getCourses: (params = {}) => api.get('/api/courses/courses/', { params }),
  getCourse: (id) => api.get(`/api/courses/courses/${id}/`),
  createCourse: (formData) => api.post('/api/courses/courses/', formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
  }),
  updateCourse: (id, formData) => api.patch(`/api/courses/courses/${id}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteCourse: (id) => api.delete(`/api/courses/courses/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getMostPopularCourse: () => api.get('/api/courses/courses/most_popular/'),
  getLeastPopularCourse: () => api.get('/api/courses/courses/least_popular/'),
  getModules: (courseId, params = {}) => api.get(`/api/courses/courses/${courseId}/modules/`, { params }),
  getModule: (courseId, moduleId) => api.get(`/api/courses/courses/${courseId}/modules/${moduleId}/`),
  createModule: (courseId, data) => api.post(`/api/courses/courses/${courseId}/modules/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateModule: (courseId, moduleId, data) => api.patch(`/api/courses/courses/${courseId}/modules/${moduleId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteModule: (courseId, moduleId) => api.delete(`/api/courses/courses/${courseId}/modules/${moduleId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getLessons: (courseId, moduleId, params = {}) => api.get(`/api/courses/courses/${courseId}/modules/${moduleId}/lessons/`, { params }),
  getLesson: (courseId, moduleId, lessonId) => api.get(`/api/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`),
  createLesson: (courseId, moduleId, formData) => api.post(`/api/courses/courses/${courseId}/modules/${moduleId}/lessons/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
  }),
  updateLesson: (courseId, moduleId, lessonId, formData) => api.patch(`/api/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
  }),
  deleteLesson: (courseId, moduleId, lessonId) => api.delete(`/api/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getResources: (courseId, params = {}) => api.get(`/api/courses/courses/${courseId}/resources/`, { params }),
  createResource: (courseId, formData) => api.post(`/api/courses/courses/${courseId}/resources/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
  }),
  updateResource: (courseId, resourceId, formData) => api.patch(`/api/courses/courses/${courseId}/resources/${resourceId}/`, formData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
  }),
  deleteResource: (courseId, resourceId) => api.delete(`/api/courses/courses/${courseId}/resources/${resourceId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getBadges: () => api.get('/courses/api/badges/'),
  createBadge: (data) => api.post('/courses/api/badges/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateBadge: (id, data) => api.put(`/courses/api/badges/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteBadge: (id) => api.delete(`/courses/api/badges/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getLeaderboard: (courseId) =>
    api.get(`/courses/api/user-points/leaderboard/${courseId ? `?course_id=${courseId}` : ''}`),
  updatePointsConfig: (courseId, config) => api.post(`/courses/api/courses/${courseId}/points-config/`, config, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  adminSingleEnroll: (courseId, data) => api.post(`/courses/enrollments/course/${courseId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  adminBulkEnrollCourse: (courseId, userIds) => api.post(`/courses/enrollments/course/${courseId}/bulk/`, { user_ids: userIds }, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  adminBulkEnroll: (enrollmentsData) => api.post('/courses/enrollments/admin_bulk_enroll/', enrollmentsData, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getAllEnrollments: () => api.get('/courses/enrollments/all_enrollments/'),
  selfEnroll: (courseId) => api.post(`/courses/enrollments/self-enroll/${courseId}/`, {}, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getEnrollments: (courseId = null) => {
    const url = courseId ? `/courses/enrollments/course/${courseId}/` : '/enrollments/';
    return api.get(url);
  },
  getUserEnrollments: (userId = null) => {
    const url = userId ? `/courses/enrollments/user_enrollments/${userId}/` : '/courses/enrollments/user_enrollments/';
    return api.get(url);
  },
  getCourseEnrollmentsAdmin: (courseId) => api.get(`/courses/enrollments/course-enrollments/${courseId}/`),
  deleteEnrollment: (id) => api.delete(`/courses/enrollments/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getRatings: (courseId = null) => {
    const url = courseId ? `/courses/ratings/course/${courseId}/` : '/courses/ratings/';
    return api.get(url);
  },
  submitRating: (courseId, data) => api.post(`/courses/ratings/course/${courseId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getLearningPaths: (params = {}) => api.get('/courses/learning-paths/', { params }),
  getLearningPath: (id) => api.get(`/courses/learning-paths/${id}/`),
  createLearningPath: (data) => api.post('/courses/learning-paths/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateLearningPath: (id, data) => api.patch(`/courses/learning-paths/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteLearningPath: (id) => api.delete(`/courses/learning-paths/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getCertificates: (courseId = null) => {
    const url = courseId ? `/courses/certificates/course/${courseId}/` : '/courses/certificates/';
    return api.get(url);
  },
  getFAQStats: () => api.get('/courses/faqs/stats/'),
  getFAQs: (courseId, params = {}) => api.get(`/courses/courses/${courseId}/faqs/`, { params }),
  createFAQ: (courseId, data) => api.post(`/courses/courses/${courseId}/faqs/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateFAQ: (courseId, faqId, data) => api.patch(`/courses/courses/${courseId}/faqs/${faqId}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteFAQ: (courseId, faqId) => api.delete(`/courses/courses/${courseId}/faqs/${faqId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  reorderFAQs: (courseId, data) => api.post(`/courses/courses/${courseId}/faqs/reorder/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
};

// Payment API
export const paymentAPI = {
  getPaymentConfig: () => api.get('/payments/payment-config'),
  createPaymentConfig: (data) => api.post('/payments/payment-config', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updatePaymentConfig: (data) => api.patch('/payments/payment-config/update', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deletePaymentConfig: () => api.delete('/payments/payment-config/delete', {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getSiteConfig: () => api.get('/payments/site-config'),
  createSiteConfig: (data) => api.post('/payments/site-config', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateSiteConfig: (data) => api.patch('/payments/site-config/update', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
};

// Forum API
export const forumAPI = {
  getForums: (params) => api.get('/forums/api/forums/', { params }),
  createForum: (data) => api.post('/forums/api/forums/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateForum: (id, data) => api.patch(`/forums/api/forums/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteForum: (id) => api.delete(`/forums/api/forums/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  getForumStats: () => api.get('/forums/api/forums/stats/'),
};

// Moderation API
export const moderationAPI = {
  getModerationQueue: (params) => api.get('/forums/api/queue/', { params }),
  moderateItem: (id, data) => api.patch(`/forums/api/queue/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  getPendingCount: () => api.get('/forums/api/queue/pending_count/'),
};

// Quality API
export const qualityAPI = {
  // Qualifications
  getQualifications: (params = {}) => api.get('/quality/api/qualifications/', { params }),
  createQualification: (data) => api.post('/quality/api/qualifications/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateQualification: (id, data) => api.patch(`/quality/api/qualifications/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteQualification: (id) => api.delete(`/quality/api/qualifications/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // Assessors
  getAssessors: (params = {}) => api.get('/quality/api/assessors/', { params }),
  createAssessor: (data) => api.post('/quality/api/assessors/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateAssessor: (id, data) => api.patch(`/quality/api/assessors/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteAssessor: (id) => api.delete(`/quality/api/assessors/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // IQAs
  getIQAs: (params = {}) => api.get('/quality/api/iqas/', { params }),
  createIQA: (data) => api.post('/quality/api/iqas/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateIQA: (id, data) => api.patch(`/quality/api/iqas/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteIQA: (id) => api.delete(`/quality/api/iqas/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // EQAs
  getEQAs: (params = {}) => api.get('/quality/api/eqas/', { params }),
  createEQA: (data) => api.post('/quality/api/eqas/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateEQA: (id, data) => api.patch(`/quality/api/eqas/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteEQA: (id) => api.delete(`/quality/api/eqas/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // Learners
  getLearners: (params = {}) => api.get('/quality/api/learners/', { params }),
  createLearner: (data) => api.post('/quality/api/learners/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateLearner: (id, data) => api.patch(`/quality/api/learners/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteLearner: (id) => api.delete(`/quality/api/learners/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // Assessments
  getAssessments: (params = {}) => api.get('/quality/api/assessments/', { params }),
  getAssessment: (id) => api.get(`/quality/api/assessments/${id}/`),
  createAssessment: (data) => api.post('/quality/api/assessments/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateAssessment: (id, data) => api.patch(`/quality/api/assessments/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteAssessment: (id) => api.delete(`/quality/api/assessments/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // IQA Samples
  getIQASamples: (params = {}) => api.get('/quality/api/iqasamples/', { params }),
  createIQASample: (data) => api.post('/quality/api/iqasamples/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateIQASample: (id, data) => api.patch(`/quality/api/iqasamples/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteIQASample: (id) => api.delete(`/quality/api/iqasamples/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // IQA Sampling Plans
  getIQASamplingPlans: (params = {}) => api.get('/quality/api/iqasamplingplans/', { params }),
  createIQASamplingPlan: (data) => api.post('/quality/api/iqasamplingplans/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateIQASamplingPlan: (id, data) => api.patch(`/quality/api/iqasamplingplans/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteIQASamplingPlan: (id) => api.delete(`/quality/api/iqasamplingplans/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // EQA Visits
  getEQAVisits: (params = {}) => api.get('/quality/api/eqavisits/', { params }),
  createEQAVisit: (data) => api.post('/quality/api/eqavisits/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateEQAVisit: (id, data) => api.patch(`/quality/api/eqavisits/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteEQAVisit: (id) => api.delete(`/quality/api/eqavisits/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // EQA Samples
  getEQASamples: (params = {}) => api.get('/quality/api/eqasamples/', { params }),
  createEQASample: (data) => api.post('/quality/api/eqasamples/', data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  updateEQASample: (id, data) => api.patch(`/quality/api/eqasamples/${id}/`, data, {
    headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'application/json' },
  }),
  deleteEQASample: (id) => api.delete(`/quality/api/eqasamples/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  }),
  // Dashboard
  getQualityDashboard: () => api.get('/quality/api/dashboard/'),
};

// Utility functions
export const setAuthTokens = () => {
  // No need to set tokens manually; backend sets HttpOnly cookies
};

export const clearAuthTokens = () => {
  // No need to clear tokens manually; handled by logout API
};

export const getAuthHeader = () => ({
  // No need for Authorization header; cookies are sent automatically
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
  forumAPI,
  moderationAPI,
  qualityAPI,
  setAuthTokens,
  clearAuthTokens,
  getAuthHeader,
};