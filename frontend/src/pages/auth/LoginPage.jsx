import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginMerchant, loginCustomer, initiateNafath, verifyNafath, isAuthenticated, getDashboardPath, error, setError } = useAuth();

  const [loginType, setLoginType] = useState(searchParams.get('type') || 'customer');
  const [loading, setLoading] = useState(false);

  // Customer login mode: 'credentials' or 'nafath'
  const [customerLoginMode, setCustomerLoginMode] = useState('credentials');

  // Customer credentials state
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');

  // Customer Nafath state (for new registration)
  const [nationalId, setNationalId] = useState('');
  const [nafathSession, setNafathSession] = useState(null);

  // Merchant state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getDashboardPath());
    }
  }, [isAuthenticated, navigate, getDashboardPath]);

  // Clear error when switching login type
  useEffect(() => {
    setError(null);
    setNafathSession(null);
  }, [loginType, customerLoginMode, setError]);

  // Handle Customer Login with username/password
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginCustomer(customerUsername, customerPassword);

    if (result.success) {
      navigate('/customer');
    }

    setLoading(false);
  };

  // Handle Customer Nafath Registration
  const handleNafathInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await initiateNafath(nationalId);

    if (result.success) {
      setNafathSession(result.data);
    }

    setLoading(false);
  };

  const handleNafathVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyNafath(nafathSession.session_id, nationalId);

    if (result.success) {
      // After Nafath verification, redirect to setup credentials
      navigate('/customer/setup');
    }

    setLoading(false);
  };

  // Handle Merchant Login
  const handleMerchantLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginMerchant(email, password);

    if (result.success) {
      navigate('/merchant');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">ب</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-600">بريق اليسر</h1>
            <p className="text-sm text-gray-500">Bariq Al-Yusr</p>
          </div>
        </Link>

        {/* Login Type Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setLoginType('customer')}
            className={`flex-1 py-3 rounded-md font-medium transition-all ${
              loginType === 'customer'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            عميل
          </button>
          <button
            onClick={() => setLoginType('merchant')}
            className={`flex-1 py-3 rounded-md font-medium transition-all ${
              loginType === 'merchant'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            تاجر
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Customer Login */}
        {loginType === 'customer' && (
          <>
            {customerLoginMode === 'credentials' ? (
              <form onSubmit={handleCustomerLogin}>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل دخول العميل</h2>
                <p className="text-gray-600 mb-6">أدخل اسم المستخدم وكلمة المرور</p>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={customerUsername}
                    onChange={(e) => setCustomerUsername(e.target.value)}
                    placeholder="اسم المستخدم"
                    className="input-field"
                    required
                    dir="ltr"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !customerUsername || !customerPassword}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>

                <div className="text-center mt-6 pt-6 border-t">
                  <p className="text-gray-600 mb-3">ليس لديك حساب؟</p>
                  <button
                    type="button"
                    onClick={() => setCustomerLoginMode('nafath')}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    سجل الآن عبر نفاذ
                  </button>
                </div>
              </form>
            ) : !nafathSession ? (
              <form onSubmit={handleNafathInitiate}>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل حساب جديد</h2>
                <p className="text-gray-600 mb-6">أدخل رقم الهوية الوطنية للتسجيل عبر نفاذ</p>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">رقم الهوية الوطنية</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="10 أرقام"
                    maxLength={10}
                    className="input-field text-center text-lg tracking-widest"
                    required
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || nationalId.length !== 10}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري التحقق...' : 'متابعة'}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  سيتم إرسال طلب تأكيد إلى تطبيق نفاذ
                </p>

                <div className="text-center mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setCustomerLoginMode('credentials')}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    لديك حساب؟ سجل الدخول
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNafathVerify}>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تأكيد الهوية</h2>
                <p className="text-gray-600 mb-6">افتح تطبيق نفاذ وأدخل الرمز التالي:</p>

                <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 text-center mb-6">
                  <p className="text-5xl font-bold text-primary-600 tracking-widest">
                    {nafathSession.random_code}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">صالح لمدة {nafathSession.expires_in} ثانية</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'جاري التحقق...' : 'تم التأكيد في نفاذ'}
                </button>

                <button
                  type="button"
                  onClick={() => setNafathSession(null)}
                  className="w-full text-gray-600 mt-4 hover:text-gray-800"
                >
                  رجوع
                </button>
              </form>
            )}
          </>
        )}

        {/* Merchant Login */}
        {loginType === 'merchant' && (
          <form onSubmit={handleMerchantLogin}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل دخول التاجر</h2>
            <p className="text-gray-600 mb-6">أدخل بيانات حسابك</p>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@store.com"
                className="input-field"
                required
                dir="ltr"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-6">
              ليس لديك حساب؟{' '}
              <a href="#" className="text-primary-600 hover:underline">تواصل معنا للتسجيل</a>
            </p>
          </form>
        )}

        {/* Back to Home */}
        <div className="text-center mt-6 pt-6 border-t">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
