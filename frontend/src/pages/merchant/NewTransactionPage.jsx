import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantAPI } from '../../services/api';

const NewTransactionPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [bariqId, setBariqId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [branchId, setBranchId] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, unit_price: '' }]);
  const [paymentTermDays, setPaymentTermDays] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await merchantAPI.getBranches();
      if (response.data.success) {
        setBranches(response.data.data.branches || []);
        if (response.data.data.branches?.length === 1) {
          setBranchId(response.data.data.branches[0].id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLookupCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await merchantAPI.lookupCustomer(bariqId);
      if (response.data.success) {
        const customerData = response.data.data;
        if (customerData.status === 'active' && customerData.available_credit > 0) {
          setCustomer(customerData);
          setStep(2);
        } else if (customerData.status !== 'active') {
          setError('حساب العميل غير نشط');
        } else {
          setError('العميل لا يملك رصيد كافي');
        }
      } else {
        setError(response.data.message || 'العميل غير موجود');
      }
    } catch (error) {
      setError('لم يتم العثور على العميل - تأكد من رقم بريق');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit_price: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const total = calculateTotal();
    if (total > customer.available_credit) {
      setError('المبلغ الإجمالي أكبر من رصيد العميل المتاح');
      setLoading(false);
      return;
    }

    try {
      const response = await merchantAPI.createTransaction({
        customer_bariq_id: bariqId,
        branch_id: branchId,
        total_amount: total,
        payment_term_days: paymentTermDays,
        notes,
        items: items.filter(item => item.name && item.unit_price),
      });

      if (response.data.success) {
        navigate('/merchant/transactions');
      } else {
        setError(response.data.message || 'حدث خطأ أثناء إنشاء المعاملة');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء إنشاء المعاملة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">معاملة جديدة</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="mr-2 font-medium">العميل</span>
        </div>
        <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="mr-2 font-medium">تفاصيل المعاملة</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Customer Lookup by Bariq ID */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">بحث عن العميل</h2>
          <form onSubmit={handleLookupCustomer}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">رقم بريق (Bariq ID)</label>
              <input
                type="text"
                value={bariqId}
                onChange={(e) => setBariqId(e.target.value)}
                placeholder="أدخل رقم بريق (6 أرقام)"
                maxLength={6}
                className="input-field text-center text-2xl tracking-widest font-bold"
                required
                dir="ltr"
              />
              <p className="text-gray-500 text-sm mt-2 text-center">
                اطلب من العميل رقم بريق الخاص به
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || bariqId.length < 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جاري البحث...' : 'بحث عن العميل'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Transaction Details */}
      {step === 2 && customer && (
        <form onSubmit={handleSubmit}>
          {/* Customer Info */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">معلومات العميل</h2>
              <button
                type="button"
                onClick={() => { setStep(1); setCustomer(null); setBariqId(''); }}
                className="text-primary-600 hover:underline"
              >
                تغيير العميل
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <div>
                  <p className="text-green-700 font-bold text-lg">{customer.full_name_ar}</p>
                  <p className="text-green-600">رقم بريق: {bariqId}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500 text-sm">الرصيد المتاح</p>
                  <p className="font-bold text-2xl text-green-600">
                    {customer.available_credit?.toLocaleString()}
                    <span className="text-sm font-normal mr-1">نقطة</span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500 text-sm">حالة الحساب</p>
                  <p className="font-bold text-green-600">نشط ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Branch Selection */}
          {branches.length > 1 && (
            <div className="card mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">الفرع</h2>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">اختر الفرع</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name_ar} - {branch.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Items */}
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">المنتجات</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="اسم المنتج"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="الكمية"
                      min={1}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      placeholder="السعر"
                      min={0}
                      step={0.01}
                      className="input-field"
                      dir="ltr"
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              ➕ إضافة منتج
            </button>
          </div>

          {/* Payment Terms */}
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">شروط السداد</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">مدة السداد</label>
                <select
                  value={paymentTermDays}
                  onChange={(e) => setPaymentTermDays(parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={7}>7 أيام</option>
                  <option value={14}>14 يوم</option>
                  <option value={30}>30 يوم</option>
                  <option value={60}>60 يوم</option>
                  <option value={90}>90 يوم</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card mb-6 bg-primary-50 border border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">المجموع الكلي</span>
              <span className={`text-2xl font-bold ${
                calculateTotal() > customer.available_credit
                  ? 'text-red-600'
                  : 'text-primary-600'
              }`}>
                {calculateTotal().toLocaleString()} نقطة
              </span>
            </div>
            {calculateTotal() > customer.available_credit && (
              <p className="text-red-600 text-sm mt-2">
                المبلغ يتجاوز رصيد العميل المتاح ({customer.available_credit?.toLocaleString()} نقطة)
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              1 نقطة = 1 ريال سعودي
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || calculateTotal() > customer.available_credit || calculateTotal() === 0}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء المعاملة'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/merchant/transactions')}
              className="btn-outline flex-1"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewTransactionPage;
