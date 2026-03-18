import api from './api';

const billingService = {
  getInvoices: () => api.get('/billing'),
  createInvoice: (data) => api.post('/billing', data),
  getInvoiceDetails: (id) => api.get(`/billing/${id}`),
};

export default billingService;
