import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/customer', label: 'الرئيسية', icon: '🏠', exact: true },
    { path: '/customer/transactions', label: 'معاملاتي', icon: '📋' },
    { path: '/customer/payments', label: 'المدفوعات', icon: '💰' },
    { path: '/customer/credit', label: 'حد الشراء', icon: '📈' },
    { path: '/customer/profile', label: 'حسابي', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ب</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-primary-600">بريق اليسر</h1>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="ml-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.full_name_ar || user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">عميل</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {(user?.full_name_ar || user?.full_name)?.[0]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 transition-colors p-2"
                title="تسجيل الخروج"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
