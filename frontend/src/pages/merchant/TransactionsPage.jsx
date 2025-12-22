import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { merchantAPI } from '../../services/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (filter !== 'all') params.status = filter;
      if (searchQuery) params.search = searchQuery;

      const response = await merchantAPI.getTransactions(params);
      if (response.data.success) {
        setTransactions(response.data.data.transactions || []);
        setMeta(response.data.meta || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      pending: 'بانتظار التأكيد',
      confirmed: 'مؤكدة',
      paid: 'مدفوعة',
      overdue: 'متأخرة',
      cancelled: 'ملغاة',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.confirmed}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">المعاملات</h1>
        <Link to="/merchant/new-transaction" className="btn-primary">
          ➕ معاملة جديدة
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم المعاملة أو اسم العميل..."
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary px-6">
            بحث
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'pending', label: 'بانتظار التأكيد' },
            { value: 'confirmed', label: 'مؤكدة' },
            { value: 'paid', label: 'مدفوعة' },
            { value: 'overdue', label: 'متأخرة' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right bg-gray-50 border-b">
                  <th className="px-4 py-3 font-medium text-gray-600">رقم المعاملة</th>
                  <th className="px-4 py-3 font-medium text-gray-600">العميل</th>
                  <th className="px-4 py-3 font-medium text-gray-600">الفرع</th>
                  <th className="px-4 py-3 font-medium text-gray-600">المبلغ</th>
                  <th className="px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 font-medium text-gray-600">موعد السداد</th>
                  <th className="px-4 py-3 font-medium text-gray-600">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600">{txn.reference_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{txn.customer?.full_name_ar || 'عميل'}</p>
                      <p className="text-sm text-gray-500">{txn.customer?.national_id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.branch?.name_ar || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800">{txn.total_amount?.toLocaleString()} نقطة</p>
                      {txn.remaining_amount > 0 && txn.remaining_amount < txn.total_amount && (
                        <p className="text-sm text-gray-500">
                          متبقي: {txn.remaining_amount?.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {txn.due_date
                        ? new Date(txn.due_date).toLocaleDateString('ar-SA')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(txn.transaction_date).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                السابق
              </button>
              <span className="px-4 py-2">
                {page} / {meta.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
                disabled={page === meta.total_pages}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500">لا توجد معاملات</p>
          <Link to="/merchant/new-transaction" className="btn-primary mt-4 inline-block">
            إنشاء معاملة جديدة
          </Link>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
