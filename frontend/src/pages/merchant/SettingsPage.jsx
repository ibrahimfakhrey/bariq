import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { merchantAPI } from '../../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileForm, setProfileForm] = useState({
    name_ar: '',
    name_en: '',
    email: '',
    phone: '',
    address: '',
  });

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_holder: '',
    iban: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getProfile();
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setProfileForm({
          name_ar: data.merchant?.name_ar || '',
          name_en: data.merchant?.name_en || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.merchant?.address || '',
        });
        setBankForm({
          bank_name: data.merchant?.bank_account?.bank_name || '',
          account_holder: data.merchant?.bank_account?.account_holder || '',
          iban: data.merchant?.bank_account?.iban || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await merchantAPI.updateProfile(profileForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'تم حفظ البيانات بنجاح' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'حدث خطأ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await merchantAPI.updateBankAccount(bankForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'تم حفظ البيانات البنكية بنجاح' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'حدث خطأ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'profile', label: 'معلومات المتجر', icon: '🏪' },
          { id: 'bank', label: 'الحساب البنكي', icon: '🏦' },
          { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-6">معلومات المتجر</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">اسم المتجر (عربي)</label>
                <input
                  type="text"
                  value={profileForm.name_ar}
                  onChange={(e) => setProfileForm({ ...profileForm, name_ar: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">اسم المتجر (إنجليزي)</label>
                <input
                  type="text"
                  value={profileForm.name_en}
                  onChange={(e) => setProfileForm({ ...profileForm, name_en: e.target.value })}
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="input-field"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">العنوان</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="input-field min-h-[100px]"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-800 mb-4">معلومات إضافية</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">السجل التجاري</p>
                  <p className="font-medium text-gray-800">{profile?.merchant?.commercial_registration || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">نسبة العمولة</p>
                  <p className="font-medium text-gray-800">{profile?.merchant?.commission_rate || 0}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">تاريخ التسجيل</p>
                  <p className="font-medium text-gray-800">
                    {profile?.merchant?.created_at
                      ? new Date(profile.merchant.created_at).toLocaleDateString('ar-SA')
                      : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">الحالة</p>
                  <p className={`font-medium ${
                    profile?.merchant?.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {profile?.merchant?.status === 'active' ? 'نشط' : profile?.merchant?.status}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {/* Bank Tab */}
      {activeTab === 'bank' && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-6">الحساب البنكي</h2>
          <p className="text-gray-600 mb-6">
            سيتم استخدام هذا الحساب لتحويل مستحقاتك من التسويات
          </p>

          <form onSubmit={handleSaveBank}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">اسم البنك</label>
                <select
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">اختر البنك</option>
                  <option value="الراجحي">مصرف الراجحي</option>
                  <option value="الأهلي">البنك الأهلي السعودي</option>
                  <option value="الرياض">بنك الرياض</option>
                  <option value="سامبا">مجموعة سامبا المالية</option>
                  <option value="الإنماء">مصرف الإنماء</option>
                  <option value="البلاد">بنك البلاد</option>
                  <option value="الجزيرة">بنك الجزيرة</option>
                  <option value="العربي">البنك العربي الوطني</option>
                  <option value="السعودي الفرنسي">البنك السعودي الفرنسي</option>
                  <option value="الاستثمار">البنك السعودي للاستثمار</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">اسم صاحب الحساب</label>
                <input
                  type="text"
                  value={bankForm.account_holder}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">رقم الآيبان (IBAN)</label>
                <input
                  type="text"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })}
                  className="input-field font-mono"
                  dir="ltr"
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  maxLength={24}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  يجب أن يبدأ بـ SA ويتكون من 24 حرف ورقم
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ البيانات البنكية'}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-6">إعدادات الإشعارات</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">إشعارات المعاملات الجديدة</h3>
                <p className="text-sm text-gray-500">تلقي إشعار عند إنشاء معاملة جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">إشعارات تأكيد العميل</h3>
                <p className="text-sm text-gray-500">تلقي إشعار عندما يؤكد العميل المعاملة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">إشعارات المدفوعات</h3>
                <p className="text-sm text-gray-500">تلقي إشعار عند سداد العميل للمستحقات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">إشعارات التسويات</h3>
                <p className="text-sm text-gray-500">تلقي إشعار عند اكتمال التسوية</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">التقارير الأسبوعية</h3>
                <p className="text-sm text-gray-500">تلقي تقرير أسبوعي بالأداء والإحصائيات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
