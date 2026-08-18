import axios from 'axios';

// Route via Spring Cloud Gateway on port 9000 to AUTHENTICATION service
const API_BASE_URL = 'http://localhost:9000/AUTHENTICATION';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dca_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service Endpoints (Login & Admin Creation)
export const authService = {
  login: async (name, password) => {
    const response = await api.post('/api/authenticate', { name, password });
    return response.data; // { token: '...' }
  },

  registerAdmin: async (adminData) => {
    const response = await api.post('/api/register', adminData);
    return response.data;
  },

  getSelf: async () => {
    const response = await api.get('/api/admin');
    return response.data; // UserDTO
  },
};

// Admin Management Service Endpoints
export const adminService = {
  updateSelf: async (id, userDTO) => {
    const response = await api.put(`/api/admin/${id}`, userDTO);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/api/admin/create', employeeData);
    return response.data;
  },

  getEmployees: async (startPage = 0, pageSize = 10) => {
    const response = await api.get(`/api/admin/employee`, {
      params: { startPage, pageSize },
    });
    return response.data; // Page<UserDTO>
  },

  toggleEmployeeStatus: async (id) => {
    const response = await api.patch(`/api/admin/employee/${id}`);
    return response.data;
  },

  updateEmployee: async (id, userDTO) => {
    const response = await api.put(`/api/admin/employee/${id}`, userDTO);
    return response.data;
  },
};

// Manager Management Service Endpoints
export const managerService = {
  getSelf: async () => {
    const response = await api.get('/api/manager');
    return response.data;
  },

  updateSelf: async (id, userDTO) => {
    const response = await api.put(`/api/manager/${id}`, userDTO);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/api/manager/create', employeeData);
    return response.data;
  },

  getEmployees: async (startPage = 0, pageSize = 10) => {
    const response = await api.get(`/api/manager/employee`, {
      params: { startPage, pageSize },
    });
    return response.data;
  },

  toggleEmployeeStatus: async (id) => {
    const response = await api.patch(`/api/manager/employee/${id}`);
    return response.data;
  },

  updateEmployee: async (id, userDTO) => {
    const response = await api.put(`/api/manager/employee/${id}`, userDTO);
    return response.data;
  },
};

// Agent Management Service Endpoints
export const agentService = {
  getSelf: async () => {
    const response = await api.get('/api/agent');
    return response.data;
  },

  updateSelf: async (id, userDTO) => {
    const response = await api.put(`/api/agent/${id}`, userDTO);
    return response.data;
  },
};

const ORCH_API_BASE_URL = 'http://localhost:9000/ORCHESTRATION';

const orchApi = axios.create({
  baseURL: ORCH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

orchApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dca_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const orchestrationService = {
  createCustomer: async (customerData) => {
    const response = await orchApi.post('/api/debt/customer', customerData);
    return response.data;
  },
  getCustomers: async (pageStart = 0, pageSize = 100) => {
    const response = await orchApi.get('/api/debt/customer', { params: { pageStart, pageSize } });
    return response.data;
  },
  createDebt: async (debtData) => {
    const response = await orchApi.post('/api/debt', debtData);
    return response.data;
  },
  getDebts: async (pageStart = 0, pageSize = 100) => {
    const response = await orchApi.get('/api/debt', { params: { pageStart, pageSize } });
    return response.data;
  },
  bulkIngestion: async (file) => {
    const formData = new FormData();
    formData.append('multipartFile', file);
    const response = await orchApi.post('/api/debt/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
