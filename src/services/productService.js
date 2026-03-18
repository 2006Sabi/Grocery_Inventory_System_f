import api from './api';

const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  searchByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  toggleAutoReorder: (id) => api.put(`/products/${id}/toggle-reorder`),
  getManualReorder: () => api.get('/products/manual-reorder'),
};

export default productService;
