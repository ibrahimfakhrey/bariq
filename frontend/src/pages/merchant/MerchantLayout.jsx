import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MerchantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/merchant', label: 'لوحة التحكم', icon: '📊', exact: true },
    { path: '/merchant/transactions', label: 'المعاملات', icon: '🛒' },
    { path: '/merchant/new-transaction', label: 'معاملة جديدة', icon: '➕' },
    { path: '/merchant/branches', label: 'الفروع', icon: '🏪' },
    { path: '/merchant/staff', label: 'الموظفين', icon: '👥' },
    { path: '/merchant/settlements', label: 'التسويات', icon: '💵' },
    { path: '/merchant/settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-40 hidden md:block">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">ب</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-600">بريق اليسر</h1>
              <p className="text-xs text-gray-500">لوحة التاجر</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user?.full_name?.[0] || 'ت'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {user?.merchant?.name_ar || user?.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === 'owner' ? 'مالك' : 'كاشير'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ب</span>
            </div>
            <span className="font-bold text-primary-600">بريق اليسر</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-500 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          {menuItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-2 ${
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
      <main className="md:mr-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MerchantLayout;
