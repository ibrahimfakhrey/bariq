import axios from 'axios';

// API Base URL - uses Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          if (response.data.success) {
            localStorage.setItem('access_token', response.data.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Admin login
  adminLogin: (email, password) =>
    api.post('/auth/admin/login', { email, password }),

  // Merchant login
  merchantLogin: (email, password) =>
    api.post('/auth/merchant/login', { email, password }),

  // Customer login with username/password
  customerLogin: (username, password) =>
    api.post('/auth/customer/login', { username, password }),

  // Customer Nafath initiate (for registration)
  nafathInitiate: (nationalId) =>
    api.post('/auth/nafath/initiate', { national_id: nationalId }),

  // Customer Nafath verify
  nafathVerify: (sessionId, nationalId) =>
    api.post('/auth/nafath/verify', { session_id: sessionId, national_id: nationalId }),

  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),

  // Logout
  logout: () => api.post('/auth/logout'),
};

// Customer API
export const customerAPI = {
  // Profile
  getProfile: () => api.get('/customers/me'),
  updateProfile: (data) => api.put('/customers/me', data),

  // Credit
  getCreditDetails: () => api.get('/customers/me/credit'),
  requestCreditIncrease: (amount, reason) =>
    api.post('/customers/me/credit/request-increase', { requested_amount: amount, reason }),

  // Transactions
  getTransactions: (params) => api.get('/customers/me/transactions', { params }),
  getTransaction: (id) => api.get(`/customers/me/transactions/${id}`),
  confirmTransaction: (id) => api.post(`/customers/me/transactions/${id}/confirm`),
  getPendingTransactions: () => api.get('/customers/me/transactions', { params: { status: 'pending' } }),

  // Payments
  getDebt: () => api.get('/customers/me/debt'),
  getPayments: (params) => api.get('/customers/me/payments', { params }),
  makePayment: (transactionId, amount, method) =>
    api.post('/customers/me/payments', { transaction_id: transactionId, amount, payment_method: method }),

  // Notifications
  getNotifications: (params) => api.get('/customers/me/notifications', { params }),
  markNotificationRead: (id) => api.put(`/customers/me/notifications/${id}/read`),
};

// Merchant API
export const merchantAPI = {
  // Profile
  getProfile: () => api.get('/merchants/me'),
  updateProfile: (data) => api.put('/merchants/me', data),
  updateBankAccount: (data) => api.put('/merchants/me/bank', data),

  // Dashboard / Reports
  getDashboard: () => api.get('/merchants/me/reports/summary'),
  getDashboardStats: () => api.get('/merchants/me/reports/summary'),

  // Branches
  getBranches: () => api.get('/merchants/me/branches'),
  getBranch: (id) => api.get(`/merchants/me/branches/${id}`),
  addBranch: (data) => api.post('/merchants/me/branches', data),
  createBranch: (data) => api.post('/merchants/me/branches', data),
  updateBranch: (id, data) => api.put(`/merchants/me/branches/${id}`, data),

  // Staff
  getStaff: (params) => api.get('/merchants/me/staff', { params }),
  addStaff: (data) => api.post('/merchants/me/staff', data),
  createStaff: (data) => api.post('/merchants/me/staff', data),
  updateStaff: (id, data) => api.put(`/merchants/me/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/merchants/me/staff/${id}`),

  // Customer lookup (by Bariq ID)
  lookupCustomer: (bariqId) => api.get(`/merchants/customers/lookup/${bariqId}`),
  checkCustomerCredit: (bariqId, amount) =>
    api.post('/merchants/customers/check-credit', { bariq_id: bariqId, amount }),

  // Transactions
  getTransactions: (params) => api.get('/merchants/me/transactions', { params }),
  getTransaction: (id) => api.get(`/merchants/me/transactions/${id}`),
  createTransaction: (data) => api.post('/merchants/me/transactions', data),
  cancelTransaction: (id, reason) =>
    api.post(`/merchants/me/transactions/${id}/cancel`, { reason }),

  // Returns
  getReturns: (params) => api.get('/merchants/me/returns', { params }),
  processReturn: (transactionId, data) =>
    api.post(`/merchants/me/transactions/${transactionId}/return`, data),

  // Settlements
  getSettlements: (params) => api.get('/merchants/me/settlements', { params }),
  getSettlement: (id) => api.get(`/merchants/me/settlements/${id}`),
  getSettlementStats: () => api.get('/merchants/me/settlements/stats'),
};

// Public API
export const publicAPI = {
  getCities: () => api.get('/public/cities'),
  getBusinessTypes: () => api.get('/public/business-types'),
  getReturnReasons: () => api.get('/public/return-reasons'),
};

export default api;
