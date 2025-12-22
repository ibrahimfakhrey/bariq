import { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';

const CreditPage = () => {
  const [creditDetails, setCreditDetails] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [creditRes, requestsRes] = await Promise.all([
        customerAPI.getCreditDetails(),
        customerAPI.getCreditRequests(),
      ]);

      if (creditRes.data.success) {
        setCreditDetails(creditRes.data.data);
      }
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.data.requests || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await customerAPI.requestCreditIncrease(
        parseFloat(requestAmount),
        requestReason
      );

      if (response.data.success) {
        setShowRequestModal(false);
        setRequestAmount('');
        setRequestReason('');
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'قيد المراجعة',
      approved: 'مقبول',
      rejected: 'مرفوض',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const usagePercentage = creditDetails
    ? (creditDetails.used_credit / creditDetails.credit_limit) * 100
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">حد النقاط</h1>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary"
        >
          طلب زيادة النقاط
        </button>
      </div>

      {/* Credit Overview */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-6">نظرة عامة</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>المستخدم: {creditDetails?.used_credit?.toLocaleString() || 0} نقطة</span>
            <span>الحد: {creditDetails?.credit_limit?.toLocaleString() || 0} نقطة</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            {usagePercentage.toFixed(1)}% مستخدم
          </p>
        </div>

        {/* Credit Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-green-600 text-sm mb-1">المتاح</p>
            <p className="text-2xl font-bold text-green-700">
              {creditDetails?.available_credit?.toLocaleString() || 0}
              <span className="text-sm font-normal mr-1">نقطة</span>
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-blue-600 text-sm mb-1">المستخدم</p>
            <p className="text-2xl font-bold text-blue-700">
              {creditDetails?.used_credit?.toLocaleString() || 0}
              <span className="text-sm font-normal mr-1">نقطة</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">الحد الإجمالي</p>
            <p className="text-2xl font-bold text-gray-700">
              {creditDetails?.credit_limit?.toLocaleString() || 0}
              <span className="text-sm font-normal mr-1">نقطة</span>
            </p>
          </div>
        </div>
      </div>

      {/* Credit Score */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">تصنيفك الائتماني</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {creditDetails?.credit_score || 'N/A'}
            </span>
          </div>
          <div>
            <p className="text-gray-600">
              {creditDetails?.credit_score >= 80 ? 'ممتاز - أنت عميل موثوق!' :
               creditDetails?.credit_score >= 60 ? 'جيد - استمر في السداد في الوقت المحدد' :
               creditDetails?.credit_score >= 40 ? 'متوسط - حاول تحسين سجل السداد' :
               'يحتاج تحسين - سدد مستحقاتك المتأخرة'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              كلما زاد تصنيفك، زادت فرصتك للحصول على حد أعلى
            </p>
          </div>
        </div>
      </div>

      {/* Previous Requests */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">طلبات سابقة</h2>
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    طلب زيادة إلى {request.requested_amount?.toLocaleString()} نقطة
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">📈</span>
            <p>لا توجد طلبات سابقة</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" dir="rtl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">طلب زيادة حد النقاط</h2>

            <form onSubmit={handleSubmitRequest}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  الحد المطلوب (نقطة)
                </label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  min={creditDetails?.credit_limit + 1000}
                  step={1000}
                  className="input-field"
                  placeholder={`أكثر من ${creditDetails?.credit_limit?.toLocaleString()}`}
                  required
                  dir="ltr"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  سبب الطلب (اختياري)
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="اشرح سبب احتياجك لحد أعلى..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !requestAmount}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-outline flex-1"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPage;
