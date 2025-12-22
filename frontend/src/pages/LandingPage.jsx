import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: '🛒',
      title: 'تسوق من المتاجر المعتمدة',
      titleEn: 'Shop from approved stores',
      description: 'اشترِ احتياجاتك اليومية من متاجر موثوقة',
    },
    {
      icon: '💰',
      title: 'بدون فوائد أو رسوم',
      titleEn: 'No interest or fees',
      description: 'ادفع نفس المبلغ بالضبط - بدون أي زيادة',
    },
    {
      icon: '📅',
      title: '10 أيام للسداد',
      titleEn: '10 days to pay',
      description: 'مهلة كافية لتنظيم ميزانيتك',
    },
    {
      icon: '✅',
      title: 'متوافق مع الشريعة',
      titleEn: 'Sharia compliant',
      description: 'خدمة حلال 100% بدون ربا',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">ب</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-600">بريق اليسر</h1>
              <p className="text-sm text-gray-500">Bariq Al-Yusr</p>
            </div>
          </div>
          <Link
            to="/login"
            className="btn-primary"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            اشترِ الآن، ادفع لاحقاً
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            خدمة الشراء الآجل للاحتياجات الأساسية
          </p>
          <p className="text-lg text-secondary-600 font-medium mb-8">
            بدون فوائد • بدون رسوم • بدون غرامات
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/login?type=customer" className="btn-primary text-lg px-8 py-4">
              سجل كعميل
            </Link>
            <Link to="/login?type=merchant" className="btn-outline text-lg px-8 py-4">
              سجل كتاجر
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            كيف تعمل الخدمة؟
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'سجل عبر نفاذ', desc: 'تسجيل سريع وآمن' },
              { step: 2, title: 'احصل على حد شراء', desc: 'حتى 5000 ريال' },
              { step: 3, title: 'تسوق من المتاجر', desc: 'متاجر معتمدة' },
              { step: 4, title: 'سدد خلال 10 أيام', desc: 'بنفس المبلغ' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ابدأ التسوق الآن
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            انضم إلى آلاف العملاء الذين يثقون في بريق اليسر
          </p>
          <Link
            to="/login?type=customer"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            سجل مجاناً
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">ب</span>
                </div>
                <span className="text-xl font-bold">بريق اليسر</span>
              </div>
              <p className="text-gray-400">
                خدمة الشراء الآجل المتوافقة مع الشريعة الإسلامية
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login?type=customer" className="hover:text-white">تسجيل العملاء</Link></li>
                <li><Link to="/login?type=merchant" className="hover:text-white">تسجيل التجار</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@bariq.sa</li>
                <li>920000000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2024 بريق اليسر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
