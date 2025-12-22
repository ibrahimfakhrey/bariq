import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer', 'merchant', 'admin'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('user_type');
    const accessToken = localStorage.getItem('access_token');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    setLoading(false);
  }, []);

  // Admin login
  const loginAdmin = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.adminLogin(email, password);

      if (response.data.success) {
        const { user, access_token, refresh_token } = response.data.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_type', 'admin');

        setUser(user);
        setUserType('admin');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Merchant login
  const loginMerchant = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.merchantLogin(email, password);

      if (response.data.success) {
        const { user, merchant, access_token, refresh_token } = response.data.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify({ ...user, merchant }));
        localStorage.setItem('user_type', 'merchant');

        setUser({ ...user, merchant });
        setUserType('merchant');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Customer login with username/password
  const loginCustomer = async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.customerLogin(username, password);

      if (response.data.success) {
        const { customer, access_token, refresh_token } = response.data.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(customer));
        localStorage.setItem('user_type', 'customer');

        setUser(customer);
        setUserType('customer');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Customer Nafath login (initiate)
  const initiateNafath = async (nationalId) => {
    try {
      setError(null);
      const response = await authAPI.nafathInitiate(nationalId);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to initiate Nafath';
      setError(message);
      return { success: false, message };
    }
  };

  // Customer Nafath verify
  const verifyNafath = async (sessionId, nationalId) => {
    try {
      setError(null);
      const response = await authAPI.nafathVerify(sessionId, nationalId);

      if (response.data.success) {
        const { customer, access_token, refresh_token } = response.data.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(customer));
        localStorage.setItem('user_type', 'customer');

        setUser(customer);
        setUserType('customer');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
    setUser(null);
    setUserType(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('access_token');
  };

  // Get dashboard path based on user type
  const getDashboardPath = () => {
    switch (userType) {
      case 'customer':
        return '/customer';
      case 'merchant':
        return '/merchant';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const value = {
    user,
    userType,
    loading,
    error,
    loginAdmin,
    loginMerchant,
    loginCustomer,
    initiateNafath,
    verifyNafath,
    logout,
    isAuthenticated,
    getDashboardPath,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
