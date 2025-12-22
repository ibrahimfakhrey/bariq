import { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';

const PaymentsPage = () => {
  const [debt, setDebt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [debtRes, paymentsRes] = await Promise.all([
        customerAPI.getDebt(),
        customerAPI.getPayments({ per_page: 10 }),
      ]);

      if (debtRes.data.success) {
        setDebt(debtRes.data.data);
      }
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data.payments);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (transaction) => {
    setSelectedTransaction(transaction);
    setPaymentAmount(transaction.remaining_amount.toString());
    setShowPayModal(true);
  };

  const handlePay = async () => {
    if (!selectedTransaction || !paymentAmount) return;

    setProcessing(true);
    try {
      const response = await customerAPI.makePayment(
        selectedTransaction.id,
        parseFloat(paymentAmount),
        paymentMethod
      );

      if (response.data.success) {
        setShowPayModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800">المدفوعات</h1>

      {/* Debt Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`card ${debt?.overdue_amount > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">إجمالي المستحقات</h2>
          <p className="text-4xl font-bold text-gray-800">
            {debt?.total_debt?.toLocaleString() || 0}
            <span className="text-lg font-normal mr-1">نقطة</span>
          </p>
          {debt?.overdue_amount > 0 && (
            <p className="text-red-600 mt-2">
              متأخر: {debt.overdue_amount.toLocaleString()} نقطة
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">عدد المعاملات المستحقة</h2>
          <p className="text-4xl font-bold text-primary-600">
            {debt?.transaction_count || 0}
            <span className="text-lg font-normal mr-1 text-gray-500">معاملة</span>
          </p>
        </div>
      </div>

      {/* Outstanding Transactions */}
      {debt?.transactions?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">المعاملات المستحقة</h2>
          <div className="space-y-4">
            {debt.transactions.map((txn) => (
              <div
                key={txn.id}
                className={`p-4 rounded-xl border ${txn.is_overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{txn.merchant_name}</h3>
                    <p className="text-sm text-gray-500">رقم المعاملة: {txn.reference_number}</p>
                    <p className="text-sm text-gray-500">
                      موعد السداد: {new Date(txn.due_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div>
                      <p className="text-sm text-gray-500">المبلغ المتبقي</p>
                      <p className="text-xl font-bold text-gray-800">
                        {txn.remaining_amount.toLocaleString()} نقطة
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayClick(txn)}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        txn.is_overdue
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      سدد الآن
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">سجل المدفوعات</h2>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {payment.transaction?.merchant_name || 'دفعة'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  -{payment.amount.toLocaleString()} نقطة
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">💳</span>
            <p>لا توجد مدفوعات سابقة</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" dir="rtl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">سداد المعاملة</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600">المتجر: {selectedTransaction.merchant_name}</p>
              <p className="text-gray-600">المبلغ المتبقي: {selectedTransaction.remaining_amount} نقطة</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">مبلغ السداد</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedTransaction.remaining_amount}
                className="input-field"
                dir="ltr"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="cash">نقدي</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="mada">مدى</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePay}
                disabled={processing || !paymentAmount}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {processing ? 'جاري السداد...' : 'تأكيد السداد'}
              </button>
              <button
                onClick={() => setShowPayModal(false)}
                className="btn-outline flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
