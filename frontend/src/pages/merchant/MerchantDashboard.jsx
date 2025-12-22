import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { merchantAPI } from '../../services/api';

const MerchantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        merchantAPI.getDashboardStats(),
        merchantAPI.getTransactions({ per_page: 5 }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (transactionsRes.data.success) {
        setRecentTransactions(transactionsRes.data.data.transactions || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-l from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً، {user?.merchant?.name_ar || user?.full_name || 'شريكنا'}
        </h1>
        <p className="text-secondary-100">إدارة معاملاتك وعملائك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-100">المعاملات اليوم</span>
            <span className="text-3xl">🛒</span>
          </div>
          <p className="text-3xl font-bold">{stats?.today_transactions || 0}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-100">مبيعات اليوم</span>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-3xl font-bold">
            {stats?.today_sales?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-purple-100">بانتظار التأكيد</span>
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-3xl font-bold">{stats?.pending_transactions || 0}</p>
        </div>

        <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-secondary-100">المستحقات</span>
            <span className="text-3xl">📈</span>
          </div>
          <p className="text-3xl font-bold">
            {stats?.pending_settlements?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link
          to="/merchant/new-transaction"
          className="card bg-primary-50 hover:bg-primary-100 text-primary-600 text-center transition-colors"
        >
          <span className="text-3xl block mb-2">➕</span>
          <span className="font-medium">معاملة جديدة</span>
        </Link>
        <Link
          to="/merchant/transactions"
          className="card bg-blue-50 hover:bg-blue-100 text-blue-600 text-center transition-colors"
        >
          <span className="text-3xl block mb-2">📋</span>
          <span className="font-medium">المعاملات</span>
        </Link>
        <Link
          to="/merchant/settlements"
          className="card bg-green-50 hover:bg-green-100 text-green-600 text-center transition-colors"
        >
          <span className="text-3xl block mb-2">💵</span>
          <span className="font-medium">التسويات</span>
        </Link>
        <Link
          to="/merchant/staff"
          className="card bg-purple-50 hover:bg-purple-100 text-purple-600 text-center transition-colors"
        >
          <span className="text-3xl block mb-2">👥</span>
          <span className="font-medium">الموظفين</span>
        </Link>
      </div>

      {/* Monthly Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">إحصائيات الشهر</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">إجمالي المعاملات</span>
              <span className="font-bold text-gray-800">{stats?.month_transactions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">إجمالي المبيعات</span>
              <span className="font-bold text-gray-800">
                {stats?.month_sales?.toLocaleString() || 0} نقطة
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">متوسط قيمة المعاملة</span>
              <span className="font-bold text-gray-800">
                {stats?.avg_transaction?.toLocaleString() || 0} نقطة
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">عدد العملاء الجدد</span>
              <span className="font-bold text-gray-800">{stats?.new_customers || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">حالة التسويات</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-700">قيد الانتظار</span>
              <span className="font-bold text-yellow-700">
                {stats?.pending_settlements?.toLocaleString() || 0} نقطة
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-700">تم تسويتها هذا الشهر</span>
              <span className="font-bold text-green-700">
                {stats?.settled_this_month?.toLocaleString() || 0} نقطة
              </span>
            </div>
            <Link
              to="/merchant/settlements"
              className="block text-center text-primary-600 hover:underline mt-4"
            >
              عرض كل التسويات
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">آخر المعاملات</h2>
          <Link to="/merchant/transactions" className="text-primary-600 hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right text-gray-500 border-b">
                  <th className="pb-3 font-medium">العميل</th>
                  <th className="pb-3 font-medium">المبلغ</th>
                  <th className="pb-3 font-medium">الحالة</th>
                  <th className="pb-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{txn.customer?.full_name_ar || 'عميل'}</p>
                      <p className="text-sm text-gray-500">{txn.reference_number}</p>
                    </td>
                    <td className="py-3 font-bold text-gray-800">
                      {txn.total_amount?.toLocaleString()} نقطة
                    </td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        txn.status === 'paid' ? 'bg-green-100 text-green-700' :
                        txn.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        txn.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {txn.status === 'paid' ? 'مدفوعة' :
                         txn.status === 'confirmed' ? 'مؤكدة' :
                         txn.status === 'pending' ? 'بانتظار التأكيد' :
                         txn.status === 'overdue' ? 'متأخرة' :
                         txn.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(txn.transaction_date).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default MerchantDashboard;
