// src/services/messagingAPI.js
import api from '../config';

export const messagingAPI = {
  getMessages: (params) => api.get('/messages/', { params }),
  getMessage: (id) => api.get(`/messages/${id}/`),
  createMessage: (data) => api.post('/messages/', data),
  updateMessage: (id, data) => api.patch(`/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}/`),
  forwardMessage: (id, data) => api.post(`/messages/${id}/forward/`, data),
  replyToMessage: (id, data) => api.post(`/messages/${id}/reply/`, data),
  markAsRead: (id) => api.patch(`/messages/${id}/mark_as_read/`),
  getUnreadCount: () => api.get('/messages/unread_count/'),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const userAPI = {
  getUsers: () => api.get('/users/'),
  searchUsers: (query) => api.get('/users/', { params: { search: query } })
};

export const groupAPI = {
  getGroups: () => api.get('/groups/')
};