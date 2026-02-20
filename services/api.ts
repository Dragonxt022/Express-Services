import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Autenticação
export const authService = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Usuários
export const usersService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`),
};

// Empresas
export const companiesService = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  getByCategory: (categoryId, params) => api.get(`/companies/category/${categoryId}`, { params }),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Serviços
export const servicesService = {
  getAll: (params) => api.get('/services', { params }),
  search: (params) => api.get('/services/search', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByCompany: (companyId, params) => api.get(`/services/company/${companyId}`, { params }),
  getByCategory: (categoryId, params) => api.get(`/services/category/${categoryId}`, { params }),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Agendamentos
export const appointmentsService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getByCustomer: (customerId, params) => api.get(`/appointments/customer/${customerId}`, { params }),
  getByCompany: (companyId, params) => api.get(`/appointments/company/${companyId}`, { params }),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Pedidos
export const ordersService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByCustomer: (customerId, params) => api.get(`/orders/customer/${customerId}`, { params }),
  getByCompany: (companyId, params) => api.get(`/orders/company/${companyId}`, { params }),
  create: (data) => api.post('/orders', data),
  checkout: (data) => api.post('/orders/checkout', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Profissionais
export const teamMembersService = {
  getAll: (params) => api.get('/team-members', { params }),
  getById: (id) => api.get(`/team-members/${id}`),
  getByCompany: (companyId, params) => api.get(`/team-members/company/${companyId}`, { params }),
  create: (data) => api.post('/team-members', data),
  update: (id, data) => api.put(`/team-members/${id}`, data),
  updateStatus: (id, status) => api.patch(`/team-members/${id}/status`, { status }),
  delete: (id) => api.delete(`/team-members/${id}`),
};

// Ofertas Relâmpago
export const flashOffersService = {
  getAll: (params) => api.get('/flash-offers', { params }),
  getById: (id) => api.get(`/flash-offers/${id}`),
  getByCompany: (companyId, params) => api.get(`/flash-offers/company/${companyId}`, { params }),
  create: (data) => api.post('/flash-offers', data),
  update: (id, data) => api.put(`/flash-offers/${id}`, data),
  delete: (id) => api.delete(`/flash-offers/${id}`),
};

export default api;
