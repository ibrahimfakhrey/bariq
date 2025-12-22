import { useState, useEffect } from 'react';
import { merchantAPI } from '../../services/api';

const SettlementsPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (filter !== 'all') params.status = filter;

      const [settlementsRes, statsRes] = await Promise.all([
        merchantAPI.getSettlements(params),
        merchantAPI.getSettlementStats(),
      ]);

      if (settlementsRes.data.success) {
        setSettlements(settlementsRes.data.data.settlements || []);
        setMeta(settlementsRes.data.meta || {});
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      completed: 'مكتملة',
      failed: 'فشلت',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">التسويات</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-100">قيد الانتظار</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.pending_amount?.toLocaleString() || 0}
            <span className="text-sm font-normal mr-1">نقطة</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">قيد المعالجة</span>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.processing_amount?.toLocaleString() || 0}
            <span className="text-sm font-normal mr-1">نقطة</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">تم تسويتها</span>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.completed_amount?.toLocaleString() || 0}
            <span className="text-sm font-normal mr-1">نقطة</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-gray-700 to-gray-800 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">الإجمالي</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.total_amount?.toLocaleString() || 0}
            <span className="text-sm font-normal mr-1">نقطة</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'pending', label: 'قيد الانتظار' },
          { value: 'processing', label: 'قيد المعالجة' },
          { value: 'completed', label: 'مكتملة' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Settlements List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : settlements.length > 0 ? (
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <div
              key={settlement.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSettlement(settlement)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-800">
                      تسوية #{settlement.reference_number}
                    </h3>
                    {getStatusBadge(settlement.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    الفترة: {new Date(settlement.period_start).toLocaleDateString('ar-SA')} - {new Date(settlement.period_end).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-sm text-gray-500">
                    عدد المعاملات: {settlement.transaction_count}
                  </p>
                </div>

                <div className="text-left">
                  <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {settlement.total_amount?.toLocaleString()} نقطة
                  </p>
                  <p className="text-sm text-gray-500">
                    صافي: {settlement.net_amount?.toLocaleString()} نقطة
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
              >
                السابق
              </button>
              <span className="px-4 py-2">
                {page} / {meta.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
                disabled={page === meta.total_pages}
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">💵</span>
          <p className="text-gray-500">لا توجد تسويات</p>
        </div>
      )}

      {/* Settlement Details Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                تفاصيل التسوية #{selectedSettlement.reference_number}
              </h2>
              <button
                onClick={() => setSelectedSettlement(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedSettlement.status)}
                <span className="text-gray-500">
                  {selectedSettlement.settled_at
                    ? `تم التسوية: ${new Date(selectedSettlement.settled_at).toLocaleDateString('ar-SA')}`
                    : 'لم يتم التسوية بعد'}
                </span>
              </div>

              {/* Period */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">الفترة</h3>
                <p className="text-gray-600">
                  من {new Date(selectedSettlement.period_start).toLocaleDateString('ar-SA', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">
                  إلى {new Date(selectedSettlement.period_end).toLocaleDateString('ar-SA', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>

              {/* Amounts */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-600 text-sm mb-1">المبلغ الإجمالي</p>
                  <p className="text-xl font-bold text-blue-700">
                    {selectedSettlement.total_amount?.toLocaleString()} نقطة
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-red-600 text-sm mb-1">العمولة ({selectedSettlement.commission_rate}%)</p>
                  <p className="text-xl font-bold text-red-700">
                    {selectedSettlement.commission_amount?.toLocaleString()} نقطة
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-600 text-sm mb-1">الصافي</p>
                  <p className="text-xl font-bold text-green-700">
                    {selectedSettlement.net_amount?.toLocaleString()} نقطة
                  </p>
                </div>
              </div>

              {/* Bank Info */}
              {selectedSettlement.bank_account && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">الحساب البنكي</h3>
                  <p className="text-gray-600">{selectedSettlement.bank_account.bank_name}</p>
                  <p className="text-gray-600" dir="ltr">IBAN: {selectedSettlement.bank_account.iban}</p>
                </div>
              )}

              {/* Transactions */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  المعاملات ({selectedSettlement.transaction_count})
                </h3>
                <p className="text-gray-500 text-sm">
                  هذه التسوية تشمل {selectedSettlement.transaction_count} معاملة مكتملة خلال الفترة المحددة
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSettlement(null)}
              className="btn-primary w-full mt-6"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementsPage;
