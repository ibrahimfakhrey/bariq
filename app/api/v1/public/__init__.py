"""
Public Routes (No authentication required)
"""
from flask import Blueprint, jsonify

public_bp = Blueprint('public', __name__)


@public_bp.route('/cities', methods=['GET'])
def get_cities():
    """Get list of Saudi cities"""
    cities = [
        {'key': 'riyadh', 'name_ar': 'الرياض', 'name_en': 'Riyadh'},
        {'key': 'jeddah', 'name_ar': 'جدة', 'name_en': 'Jeddah'},
        {'key': 'makkah', 'name_ar': 'مكة المكرمة', 'name_en': 'Makkah'},
        {'key': 'madinah', 'name_ar': 'المدينة المنورة', 'name_en': 'Madinah'},
        {'key': 'dammam', 'name_ar': 'الدمام', 'name_en': 'Dammam'},
        {'key': 'khobar', 'name_ar': 'الخبر', 'name_en': 'Khobar'},
        {'key': 'dhahran', 'name_ar': 'الظهران', 'name_en': 'Dhahran'},
        {'key': 'taif', 'name_ar': 'الطائف', 'name_en': 'Taif'},
        {'key': 'tabuk', 'name_ar': 'تبوك', 'name_en': 'Tabuk'},
        {'key': 'buraidah', 'name_ar': 'بريدة', 'name_en': 'Buraidah'},
        {'key': 'khamis_mushait', 'name_ar': 'خميس مشيط', 'name_en': 'Khamis Mushait'},
        {'key': 'abha', 'name_ar': 'أبها', 'name_en': 'Abha'},
        {'key': 'najran', 'name_ar': 'نجران', 'name_en': 'Najran'},
        {'key': 'hail', 'name_ar': 'حائل', 'name_en': 'Hail'},
        {'key': 'jazan', 'name_ar': 'جازان', 'name_en': 'Jazan'},
        {'key': 'yanbu', 'name_ar': 'ينبع', 'name_en': 'Yanbu'},
        {'key': 'al_ahsa', 'name_ar': 'الأحساء', 'name_en': 'Al Ahsa'},
        {'key': 'qatif', 'name_ar': 'القطيف', 'name_en': 'Qatif'},
        {'key': 'jubail', 'name_ar': 'الجبيل', 'name_en': 'Jubail'},
    ]

    return jsonify({
        'success': True,
        'data': {
            'cities': cities
        }
    })


@public_bp.route('/business-types', methods=['GET'])
def get_business_types():
    """Get merchant business types"""
    types = [
        {'key': 'supermarket', 'name_ar': 'سوبرماركت', 'name_en': 'Supermarket'},
        {'key': 'hypermarket', 'name_ar': 'هايبرماركت', 'name_en': 'Hypermarket'},
        {'key': 'grocery', 'name_ar': 'بقالة', 'name_en': 'Grocery'},
        {'key': 'pharmacy', 'name_ar': 'صيدلية', 'name_en': 'Pharmacy'},
        {'key': 'bakery', 'name_ar': 'مخبز', 'name_en': 'Bakery'},
        {'key': 'butcher', 'name_ar': 'ملحمة', 'name_en': 'Butcher'},
        {'key': 'vegetables', 'name_ar': 'خضار وفواكه', 'name_en': 'Vegetables & Fruits'},
        {'key': 'dairy', 'name_ar': 'ألبان', 'name_en': 'Dairy'},
        {'key': 'general_store', 'name_ar': 'متجر عام', 'name_en': 'General Store'},
    ]

    return jsonify({
        'success': True,
        'data': {
            'types': types
        }
    })


@public_bp.route('/return-reasons', methods=['GET'])
def get_return_reasons():
    """Get valid return reasons"""
    reasons = [
        {'key': 'damaged', 'name_ar': 'المنتج تالف', 'name_en': 'Damaged'},
        {'key': 'wrong_item', 'name_ar': 'منتج خاطئ', 'name_en': 'Wrong Item'},
        {'key': 'defective', 'name_ar': 'منتج معيب', 'name_en': 'Defective'},
        {'key': 'customer_changed_mind', 'name_ar': 'تغير رأي العميل', 'name_en': 'Customer Changed Mind'},
        {'key': 'expired', 'name_ar': 'منتج منتهي الصلاحية', 'name_en': 'Expired'},
        {'key': 'other', 'name_ar': 'سبب آخر', 'name_en': 'Other'},
    ]

    return jsonify({
        'success': True,
        'data': {
            'reasons': reasons
        }
    })


@public_bp.route('/ticket-categories', methods=['GET'])
def get_ticket_categories():
    """Get support ticket categories"""
    categories = [
        {'key': 'payment_issue', 'name_ar': 'مشكلة في الدفع', 'name_en': 'Payment Issue'},
        {'key': 'transaction_issue', 'name_ar': 'مشكلة في العملية', 'name_en': 'Transaction Issue'},
        {'key': 'account_issue', 'name_ar': 'مشكلة في الحساب', 'name_en': 'Account Issue'},
        {'key': 'technical', 'name_ar': 'مشكلة تقنية', 'name_en': 'Technical Issue'},
        {'key': 'complaint', 'name_ar': 'شكوى', 'name_en': 'Complaint'},
        {'key': 'inquiry', 'name_ar': 'استفسار', 'name_en': 'Inquiry'},
        {'key': 'suggestion', 'name_ar': 'اقتراح', 'name_en': 'Suggestion'},
        {'key': 'other', 'name_ar': 'أخرى', 'name_en': 'Other'},
    ]

    return jsonify({
        'success': True,
        'data': {
            'categories': categories
        }
    })
