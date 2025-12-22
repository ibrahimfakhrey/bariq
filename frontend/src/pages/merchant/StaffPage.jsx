import { useState, useEffect } from 'react';
import { merchantAPI } from '../../services/api';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'cashier',
    branch_id: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, branchesRes] = await Promise.all([
        merchantAPI.getStaff(),
        merchantAPI.getBranches(),
      ]);

      if (staffRes.data.success) {
        setStaff(staffRes.data.data.staff || []);
      }
      if (branchesRes.data.success) {
        setBranches(branchesRes.data.data.branches || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        full_name: member.full_name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'cashier',
        branch_id: member.branch_id || '',
        password: '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'cashier',
        branch_id: '',
        password: '',
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
      if (editingStaff) {
        response = await merchantAPI.updateStaff(editingStaff.id, formData);
      } else {
        response = await merchantAPI.addStaff(formData);
      }

      if (response.data.success) {
        setShowModal(false);
        fetchData();
      } else {
        setError(response.data.message || 'حدث خطأ');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      await merchantAPI.updateStaff(member.id, {
        is_active: !member.is_active,
      });
      fetchData();
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
        <h1 className="text-2xl font-bold text-gray-800">الموظفين</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          ➕ إضافة موظف
        </button>
      </div>

      {/* Staff List */}
      {staff.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    member.role === 'owner' ? 'bg-secondary-100' : 'bg-primary-100'
                  }`}>
                    <span className={`font-bold ${
                      member.role === 'owner' ? 'text-secondary-600' : 'text-primary-600'
                    }`}>
                      {member.full_name?.[0] || '؟'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{member.full_name}</h3>
                    <p className="text-sm text-gray-500">
                      {member.role === 'owner' ? 'مالك' : 'كاشير'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {member.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <span>📧</span>
                  <span dir="ltr">{member.email}</span>
                </p>
                {member.phone && (
                  <p className="flex items-center gap-2">
                    <span>📱</span>
                    <span dir="ltr">{member.phone}</span>
                  </p>
                )}
                {member.branch && (
                  <p className="flex items-center gap-2">
                    <span>🏪</span>
                    <span>{member.branch.name_ar}</span>
                  </p>
                )}
              </div>

              {member.role !== 'owner' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="flex-1 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      member.is_active
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {member.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">👥</span>
          <p className="text-gray-500 mb-4">لا يوجد موظفين</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            إضافة أول موظف
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingStaff ? 'تعديل موظف' : 'إضافة موظف جديد'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="cashier">كاشير</option>
                    <option value="manager">مدير فرع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">الفرع</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">جميع الفروع</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingStaff && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">كلمة المرور</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      dir="ltr"
                      required={!editingStaff}
                      minLength={6}
                    />
                  </div>
                )}
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

export default StaffPage;
