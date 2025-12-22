import { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

      const response = await customerAPI.getTransactions(params);
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (transactionId) => {
    try {
      const response = await customerAPI.confirmTransaction(transactionId);
      if (response.data.success) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error confirming:', error);
    }
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
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800">معاملاتي</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div key={txn.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{txn.merchant?.name_ar}</h3>
                    <p className="text-sm text-gray-500">{txn.branch?.name_ar} - {txn.branch?.city}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(txn.transaction_date).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <p className="text-xl font-bold text-gray-800">
                    {txn.total_amount.toLocaleString()} نقطة
                  </p>
                  {getStatusBadge(txn.status)}
                  {txn.due_date && txn.status !== 'paid' && (
                    <p className="text-sm text-gray-500">
                      موعد السداد: {new Date(txn.due_date).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>

                {txn.status === 'pending' && (
                  <button
                    onClick={() => handleConfirm(txn.id)}
                    className="btn-primary"
                  >
                    تأكيد المعاملة
                  </button>
                )}
              </div>

              {/* Items */}
              {txn.items && txn.items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">المنتجات:</p>
                  <div className="flex flex-wrap gap-2">
                    {txn.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500">لا توجد معاملات</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
