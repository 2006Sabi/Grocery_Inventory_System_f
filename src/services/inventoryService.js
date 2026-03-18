import api from './api';

const inventoryService = {
  getLogs: () => api.get('/inventory/logs'),
  updateStock: (productId, data) => api.post(`/inventory/update/${productId}`, data),
  getLowStock: () => api.get('/products/low-stock'),
  getExpiryAlerts: () => api.get('/products/expiry-priority'),
  getReorderSuggestions: () => api.get('/products/manual-reorder'),
  getReorders: () => api.get('/reorders'),
  createReorder: (data) => api.post('/reorders', data),
  updateReorder: (id, data) => api.put(`/reorders/${id}`, data),
  updateReorderStatus: (id, status) => api.put(`/reorders/${id}/status`, { status }),
  deleteReorder: (id) => api.delete(`/reorders/${id}`),
};


export default inventoryService;
