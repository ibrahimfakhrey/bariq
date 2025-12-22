import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await customerAPI.getProfile();
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await customerAPI.updateProfile(formData);
      if (response.data.success) {
        setProfile({ ...profile, ...formData });
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold text-gray-800">حسابي</h1>

      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {(profile?.full_name_ar || profile?.full_name)?.[0] || 'ع'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {profile?.full_name_ar || profile?.full_name}
            </h2>
            <p className="text-gray-500">{profile?.national_id}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              profile?.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {profile?.status === 'active' ? 'نشط' : profile?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">المعلومات الشخصية</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              تعديل
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    email: profile?.email || '',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
                  });
                }}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">الاسم بالعربي</label>
              <p className="font-medium text-gray-800">{profile?.full_name_ar || '-'}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">الاسم بالإنجليزي</label>
              <p className="font-medium text-gray-800">{profile?.full_name || '-'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">رقم الهوية</label>
              <p className="font-medium text-gray-800" dir="ltr">{profile?.national_id}</p>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">تاريخ الميلاد</label>
              <p className="font-medium text-gray-800">
                {profile?.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString('ar-SA')
                  : '-'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">البريد الإلكتروني</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                ) : (
                  <p className="font-medium text-gray-800" dir="ltr">{profile?.email || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">رقم الجوال</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                ) : (
                  <p className="font-medium text-gray-800" dir="ltr">{profile?.phone || '-'}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">العنوان</label>
            {editing ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field min-h-[80px]"
              />
            ) : (
              <p className="font-medium text-gray-800">{profile?.address || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">إحصائيات الحساب</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">تاريخ التسجيل</p>
            <p className="font-bold text-gray-800">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('ar-SA')
                : '-'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">حد الشراء</p>
            <p className="font-bold text-gray-800">
              {profile?.credit_limit?.toLocaleString() || 0} ريال
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">التصنيف الائتماني</p>
            <p className="font-bold text-primary-600">
              {profile?.credit_score || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">الأمان</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="font-medium text-gray-800">المصادقة عبر نفاذ</p>
                <p className="text-sm text-gray-500">حسابك مرتبط بنفاذ الوطني</p>
              </div>
            </div>
            <span className="text-green-600">✓ مفعّل</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-gray-800">الإشعارات</p>
                <p className="text-sm text-gray-500">تلقي إشعارات المعاملات والتذكيرات</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card bg-red-50 border border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-red-700">تسجيل الخروج</h3>
            <p className="text-sm text-red-600">سيتم تسجيل خروجك من جميع الأجهزة</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
