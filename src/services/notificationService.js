import api from './api';

const notificationService = {
  getNotifications: () => api.get('/notifications'),
  createNotification: (data) => api.post('/notifications', data),
  updateNotification: (id, data) => api.put(`/notifications/${id}`, data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  sendStaffMessage: (data) => api.post('/notifications/message', data),
};

export default notificationService;
