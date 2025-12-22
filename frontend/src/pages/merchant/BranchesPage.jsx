import { useState, useEffect } from 'react';
import { merchantAPI } from '../../services/api';

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    city: '',
    address: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getBranches();
      if (response.data.success) {
        setBranches(response.data.data.branches || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name_ar: branch.name_ar || '',
        name_en: branch.name_en || '',
        city: branch.city || '',
        address: branch.address || '',
        phone: branch.phone || '',
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name_ar: '',
        name_en: '',
        city: '',
        address: '',
        phone: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let response;
      if (editingBranch) {
        response = await merchantAPI.updateBranch(editingBranch.id, formData);
      } else {
        response = await merchantAPI.addBranch(formData);
      }

      if (response.data.success) {
        setShowModal(false);
        fetchBranches();
      } else {
        setError(response.data.message || 'حدث خطأ');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (branch) => {
    try {
      await merchantAPI.updateBranch(branch.id, {
        is_active: !branch.is_active,
      });
      fetchBranches();
    } catch (error) {
      console.error('Error:', error);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الفروع</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          ➕ إضافة فرع
        </button>
      </div>

      {/* Branches Grid */}
      {branches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{branch.name_ar}</h3>
                    {branch.name_en && (
                      <p className="text-sm text-gray-500">{branch.name_en}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  branch.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {branch.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{branch.city}</span>
                </p>
                {branch.address && (
                  <p className="flex items-center gap-2">
                    <span>🏠</span>
                    <span>{branch.address}</span>
                  </p>
                )}
                {branch.phone && (
                  <p className="flex items-center gap-2">
                    <span>📱</span>
                    <span dir="ltr">{branch.phone}</span>
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-gray-500 text-xs">المعاملات</p>
                  <p className="font-bold text-gray-800">{branch.transaction_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs">الموظفين</p>
                  <p className="font-bold text-gray-800">{branch.staff_count || 0}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleOpenModal(branch)}
                  className="flex-1 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleToggleStatus(branch)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    branch.is_active
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {branch.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🏪</span>
          <p className="text-gray-500 mb-4">لا توجد فروع</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            إضافة أول فرع
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">اسم الفرع (عربي)</label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">اسم الفرع (إنجليزي)</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">المدينة</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">اختر المدينة</option>
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="الخبر">الخبر</option>
                    <option value="الظهران">الظهران</option>
                    <option value="الطائف">الطائف</option>
                    <option value="بريدة">بريدة</option>
                    <option value="تبوك">تبوك</option>
                    <option value="أبها">أبها</option>
                    <option value="حائل">حائل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">العنوان</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field min-h-[80px]"
                    placeholder="العنوان التفصيلي"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    dir="ltr"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default BranchesPage;
