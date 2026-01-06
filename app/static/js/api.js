/**
 * Bariq Al-Yusr API Helper
 * Handles all API calls with authentication
 */

const API_BASE = '/api/v1';

// Token management
const TokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  getUserType: () => localStorage.getItem('user_type'),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  
  setUser: (user, userType) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user_type', userType);
  },
  
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
  },
  
  isAuthenticated: () => {
    return !!TokenManager.getAccessToken() && !!TokenManager.getUser();
  }
};

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const token = TokenManager.getAccessToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    // Handle 401 - try to refresh token (skip for login endpoints)
    const isLoginEndpoint = endpoint.includes('/login');
    if (response.status === 401 && !options._retry && !isLoginEndpoint) {
      const refreshed = await refreshToken();
      if (refreshed) {
        options._retry = true;
        return apiRequest(endpoint, options);
      } else {
        // Refresh failed, logout
        const userType = TokenManager.getUserType();
        TokenManager.clear();
        // Redirect based on user type
        if (userType === 'admin') {
          window.location.href = '/panel/login';
        } else if (userType === 'merchant') {
          window.location.href = '/merchant/login';
        } else {
          window.location.href = '/login';
        }
        return null;
      }
    }
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
}

// Refresh token
async function refreshToken() {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('access_token', data.data.access_token);
        return true;
      }
    }
  } catch (error) {
    console.error('Refresh token error:', error);
  }
  
  return false;
}

// API Methods
const API = {
  // Auth
  auth: {
    customerLogin: (username, password) => 
      apiRequest('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    
    merchantLogin: (email, password) =>
      apiRequest('/auth/merchant/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    adminLogin: (email, password) =>
      apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  },
  
  // Customer
  customer: {
    getProfile: () => apiRequest('/customers/me'),
    updateProfile: (data) => 
      apiRequest('/customers/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    getCredit: () => apiRequest('/customers/me/credit'),
    getDebt: () => apiRequest('/customers/me/debt'),
    
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/customers/me/transactions${query ? '?' + query : ''}`);
    },
    
    confirmTransaction: (id) =>
      apiRequest(`/customers/me/transactions/${id}/confirm`, { method: 'POST' }),

    rejectTransaction: (id, reason) =>
      apiRequest(`/customers/me/transactions/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    changePassword: (currentPassword, newPassword) =>
      apiRequest('/customers/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }),

    getPayments: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/customers/me/payments${query ? '?' + query : ''}`);
    },
    
    makePayment: (transactionId, amount, method) =>
      apiRequest('/customers/me/payments', {
        method: 'POST',
        body: JSON.stringify({ transaction_id: transactionId, amount, payment_method: method }),
      }),
  },
  
  // Merchant
  merchant: {
    getProfile: () => apiRequest('/merchants/me'),
    getDashboard: () => apiRequest('/merchants/me/reports/summary'),

    lookupCustomer: (bariqId) => apiRequest(`/merchants/customers/lookup/${bariqId}`),

    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/transactions${query ? '?' + query : ''}`);
    },

    createTransaction: (data) =>
      apiRequest('/merchants/me/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Regions
    getRegions: () => apiRequest('/merchants/me/regions'),
    createRegion: (data) =>
      apiRequest('/merchants/me/regions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRegion: (id, data) =>
      apiRequest(`/merchants/me/regions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteRegion: (id) =>
      apiRequest(`/merchants/me/regions/${id}`, { method: 'DELETE' }),

    // Branches
    getBranches: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/branches${query ? '?' + query : ''}`);
    },
    createBranch: (data) =>
      apiRequest('/merchants/me/branches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateBranch: (id, data) =>
      apiRequest(`/merchants/me/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Staff
    getStaff: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/staff${query ? '?' + query : ''}`);
    },
    getStaffMember: (id) => apiRequest(`/merchants/me/staff/${id}`),
    addStaff: (data) =>
      apiRequest('/merchants/me/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStaff: (id, data) =>
      apiRequest(`/merchants/me/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getStaffHierarchy: () => apiRequest('/merchants/me/staff/hierarchy'),

    // Settlements
    getSettlements: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/settlements${query ? '?' + query : ''}`);
    },
    getSettlementDetails: (id) => apiRequest(`/merchants/me/settlements/${id}`),

    // Reports
    getReports: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/reports/detailed${query ? '?' + query : ''}`);
    },
    getTransactionReports: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/reports/transactions${query ? '?' + query : ''}`);
    },
    getStaffPerformance: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/reports/staff-performance${query ? '?' + query : ''}`);
    },
    getCustomerAnalytics: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/merchants/me/reports/customers${query ? '?' + query : ''}`);
    },
  },

  // Admin
  admin: {
    // Dashboard
    getDashboard: () => apiRequest('/admin/dashboard'),

    // Customers
    getCustomers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/customers${query ? '?' + query : ''}`);
    },
    getCustomer: (id) => apiRequest(`/admin/customers/${id}`),
    updateCustomer: (id, data) =>
      apiRequest(`/admin/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateCustomerCredit: (id, creditLimit, reason) =>
      apiRequest(`/admin/customers/${id}/credit-limit`, {
        method: 'PUT',
        body: JSON.stringify({ credit_limit: creditLimit, reason }),
      }),
    adjustCustomerCredit: (id, amount, reason, notes) =>
      apiRequest(`/admin/customers/${id}/adjust-credit`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason, notes }),
      }),

    // Credit Requests
    getCreditRequests: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/credit-requests${query ? '?' + query : ''}`);
    },
    approveCreditRequest: (id, approvedLimit, reason) =>
      apiRequest(`/admin/credit-requests/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approved_limit: approvedLimit, reason }),
      }),
    rejectCreditRequest: (id, reason) =>
      apiRequest(`/admin/credit-requests/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),

    // Merchants
    getMerchants: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/merchants${query ? '?' + query : ''}`);
    },
    getMerchant: (id) => apiRequest(`/admin/merchants/${id}`),
    updateMerchant: (id, data) =>
      apiRequest(`/admin/merchants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    approveMerchant: (id, commissionRate) =>
      apiRequest(`/admin/merchants/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ commission_rate: commissionRate }),
      }),
    suspendMerchant: (id, reason) =>
      apiRequest(`/admin/merchants/${id}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),

    // Transactions
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/transactions${query ? '?' + query : ''}`);
    },
    getOverdueTransactions: () => apiRequest('/admin/transactions/overdue'),

    // Payments
    getPayments: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/payments${query ? '?' + query : ''}`);
    },
    getPayment: (id) => apiRequest(`/admin/payments/${id}`),
    refundPayment: (id, amount, reason) =>
      apiRequest(`/admin/payments/${id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      }),
    queryPaymentStatus: (tranRef) => apiRequest(`/admin/payments/query/${tranRef}`),

    // Settlements
    getSettlements: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/settlements${query ? '?' + query : ''}`);
    },
    getSettlement: (id) => apiRequest(`/admin/settlements/${id}`),
    approveSettlement: (id) =>
      apiRequest(`/admin/settlements/${id}/approve`, { method: 'PUT' }),
    transferSettlement: (id, transferReference) =>
      apiRequest(`/admin/settlements/${id}/transfer`, {
        method: 'PUT',
        body: JSON.stringify({ transfer_reference: transferReference }),
      }),

    // Admin Staff
    getStaff: () => apiRequest('/admin/staff'),
    createStaff: (data) =>
      apiRequest('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStaff: (id, data) =>
      apiRequest(`/admin/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Reports
    getOverviewReport: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/reports/overview${query ? '?' + query : ''}`);
    },
    getFinancialReport: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/reports/financial${query ? '?' + query : ''}`);
    },

    // Audit Logs
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/audit-logs${query ? '?' + query : ''}`);
    },

    // Settings
    getSettings: () => apiRequest('/admin/settings'),
    updateSetting: (key, value) =>
      apiRequest(`/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
  },
};

// Helper functions
function formatNumber(num) {
  return num ? num.toLocaleString('ar-SA') : '0';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA');
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('ar-SA');
}

// Status translations
const statusLabels = {
  paid: 'مدفوعة',
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكدة',
  overdue: 'متأخرة',
  cancelled: 'ملغية',
  active: 'نشط',
  inactive: 'غير نشط',
  suspended: 'موقوف',
};

function getStatusLabel(status) {
  return statusLabels[status] || status;
}

function getStatusBadgeClass(status) {
  const classes = {
    paid: 'badge-success',
    confirmed: 'badge-info',
    pending: 'badge-warning',
    overdue: 'badge-danger',
    cancelled: 'badge-gray',
    active: 'badge-success',
    inactive: 'badge-gray',
    suspended: 'badge-danger',
  };
  return classes[status] || 'badge-gray';
}

// Show loading spinner
function showLoading(container) {
  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
    </div>
  `;
}

// Show error message
function showError(container, message) {
  container.innerHTML = `
    <div class="alert alert-error">
      ${message}
    </div>
  `;
}

// Check auth and redirect if needed
function requireAuth(allowedTypes = []) {
  if (!TokenManager.isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  
  if (allowedTypes.length > 0) {
    const userType = TokenManager.getUserType();
    if (!allowedTypes.includes(userType)) {
      // Redirect to appropriate dashboard
      const dashboards = {
        customer: '/customer',
        merchant: '/merchant',
        admin: '/admin',
      };
      window.location.href = dashboards[userType] || '/login';
      return false;
    }
  }
  
  return true;
}

// Logout function
function logout() {
  TokenManager.clear();
  window.location.href = '/login';
}
