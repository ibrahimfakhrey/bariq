import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [creditDetails, setCreditDetails] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchData = async () => {
    try {
      const [creditRes, transactionsRes, pendingRes, debtRes] = await Promise.all([
        customerAPI.getCreditDetails(),
        customerAPI.getTransactions({ per_page: 5 }),
        customerAPI.getPendingTransactions(),
        customerAPI.getDebt(),
      ]);

      if (creditRes.data.success) {
        setCreditDetails(creditRes.data.data);
      }
      if (transactionsRes.data.success) {
        setRecentTransactions(transactionsRes.data.data.transactions);
      }
      if (pendingRes.data.success) {
        setPendingTransactions(pendingRes.data.data.transactions || []);
      }
      if (debtRes.data.success) {
        setDebt(debtRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmTransaction = async (transactionId) => {
    setConfirmingId(transactionId);
    try {
      const response = await customerAPI.confirmTransaction(transactionId);
      if (response.data.success) {
        // Refresh data after confirmation
        await fetchData();
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
      alert('حدث خطأ أثناء تأكيد المعاملة');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Header */}
      <div className="bg-gradient-to-l from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً، {user?.full_name_ar || user?.full_name || 'عميلنا العزيز'}
        </h1>
        <p className="text-primary-100">إدارة مشترياتك ومدفوعاتك</p>
      </div>

      {/* Credit Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Available Credit */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-100">النقاط المتاحة</span>
            <span className="text-3xl">💳</span>
          </div>
          <p className="text-3xl font-bold">
            {creditDetails?.available_credit?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
          <p className="text-green-200 text-xs mt-1">1 نقطة = 1 ريال سعودي</p>
        </div>

        {/* Used Credit */}
        <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-secondary-100">النقاط المستخدمة</span>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold">
            {creditDetails?.used_credit?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
        </div>

        {/* Credit Limit */}
        <div className="card bg-gradient-to-br from-gray-700 to-gray-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">حد النقاط</span>
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-3xl font-bold">
            {creditDetails?.credit_limit?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
        </div>
      </div>

      {/* Bariq ID Card */}
      <div className="card bg-gradient-to-l from-primary-100 to-primary-50 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">رقم بريق الخاص بك</p>
            <p className="text-3xl font-bold text-primary-600 tracking-widest" dir="ltr">{user?.bariq_id || '------'}</p>
            <p className="text-gray-500 text-xs mt-1">استخدم هذا الرقم عند الشراء من المتاجر</p>
          </div>
          <div className="text-5xl">🆔</div>
        </div>
      </div>

      {/* Pending Transactions Alert */}
      {pendingTransactions.length > 0 && (
        <div className="card bg-orange-50 border-2 border-orange-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-orange-700">معاملات تحتاج تأكيدك</h3>
              <p className="text-orange-600 text-sm">لديك {pendingTransactions.length} معاملة بانتظار الموافقة</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingTransactions.map((txn) => (
              <div key={txn.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{txn.merchant?.name_ar || 'متجر'}</p>
                  <p className="text-sm text-gray-500">
                    {txn.branch?.name_ar} - {new Date(txn.transaction_date).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-lg font-bold text-primary-600 mt-1">
                    {txn.total_amount?.toLocaleString()} نقطة
                  </p>
                </div>
                <button
                  onClick={() => handleConfirmTransaction(txn.id)}
                  disabled={confirmingId === txn.id}
                  className="btn-primary px-6 disabled:opacity-50"
                >
                  {confirmingId === txn.id ? 'جاري التأكيد...' : 'تأكيد ✓'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Debt Alert */}
      {debt && debt.total_debt > 0 && (
        <div className={`rounded-xl p-6 ${debt.overdue_amount > 0 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold ${debt.overdue_amount > 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                {debt.overdue_amount > 0 ? 'لديك مستحقات متأخرة!' : 'لديك مستحقات قادمة'}
              </h3>
              <p className={`text-sm ${debt.overdue_amount > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                إجمالي المستحقات: {debt.total_debt.toLocaleString()} نقطة
                {debt.overdue_amount > 0 && ` (متأخر: ${debt.overdue_amount.toLocaleString()} نقطة)`}
              </p>
            </div>
            <Link to="/customer/payments" className={`px-6 py-2 rounded-lg font-medium ${debt.overdue_amount > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}>
              سدد الآن
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: '📋', label: 'معاملاتي', path: '/customer/transactions', color: 'bg-blue-50 text-blue-600' },
          { icon: '💰', label: 'المدفوعات', path: '/customer/payments', color: 'bg-green-50 text-green-600' },
          { icon: '📈', label: 'زيادة الحد', path: '/customer/credit', color: 'bg-purple-50 text-purple-600' },
          { icon: '👤', label: 'حسابي', path: '/customer/profile', color: 'bg-gray-50 text-gray-600' },
        ].map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`${action.color} rounded-xl p-4 text-center hover:shadow-lg transition-shadow`}
          >
            <span className="text-3xl block mb-2">{action.icon}</span>
            <span className="font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">آخر المعاملات</h2>
          <Link to="/customer/transactions" className="text-primary-600 hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{txn.merchant?.name_ar || 'متجر'}</p>
                    <p className="text-sm text-gray-500">{new Date(txn.transaction_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{txn.total_amount.toLocaleString()} نقطة</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    txn.status === 'paid' ? 'bg-green-100 text-green-700' :
                    txn.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {txn.status === 'paid' ? 'مدفوعة' :
                     txn.status === 'overdue' ? 'متأخرة' :
                     txn.status === 'pending' ? 'بانتظار التأكيد' :
                     'مؤكدة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">📭</span>
            <p>لا توجد معاملات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
