import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Customer Pages
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTransactionsPage from './pages/customer/TransactionsPage';
import CustomerPaymentsPage from './pages/customer/PaymentsPage';
import CreditPage from './pages/customer/CreditPage';
import ProfilePage from './pages/customer/ProfilePage';

// Merchant Pages
import MerchantLayout from './pages/merchant/MerchantLayout';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantTransactionsPage from './pages/merchant/TransactionsPage';
import NewTransactionPage from './pages/merchant/NewTransactionPage';
import StaffPage from './pages/merchant/StaffPage';
import BranchesPage from './pages/merchant/BranchesPage';
import SettlementsPage from './pages/merchant/SettlementsPage';
import SettingsPage from './pages/merchant/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="transactions" element={<CustomerTransactionsPage />} />
            <Route path="payments" element={<CustomerPaymentsPage />} />
            <Route path="credit" element={<CreditPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Merchant Routes */}
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MerchantDashboard />} />
            <Route path="transactions" element={<MerchantTransactionsPage />} />
            <Route path="new-transaction" element={<NewTransactionPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="settlements" element={<SettlementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
