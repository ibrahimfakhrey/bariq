"""
Customer Routes
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

customers_bp = Blueprint('customers', __name__)


# ==================== Profile ====================

@customers_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current customer profile"""
    from app.services.customer_service import CustomerService

    identity = get_jwt_identity()
    result = CustomerService.get_customer_profile(identity['id'])

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@customers_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update customer profile"""
    from app.services.customer_service import CustomerService

    identity = get_jwt_identity()
    data = request.get_json()

    result = CustomerService.update_customer_profile(identity['id'], data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Credit ====================

@customers_bp.route('/me/credit', methods=['GET'])
@jwt_required()
def get_credit():
    """Get customer credit details"""
    from app.services.customer_service import CustomerService

    identity = get_jwt_identity()
    result = CustomerService.get_credit_details(identity['id'])

    return jsonify(result)


@customers_bp.route('/me/credit/request-increase', methods=['POST'])
@jwt_required()
def request_credit_increase():
    """Request credit limit increase"""
    from app.services.customer_service import CustomerService

    identity = get_jwt_identity()
    data = request.get_json()

    result = CustomerService.request_credit_increase(
        identity['id'],
        data.get('requested_amount'),
        data.get('reason')
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


# ==================== Transactions ====================

@customers_bp.route('/me/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get customer transactions"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()

    # Get query params
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = TransactionService.get_customer_transactions(
        identity['id'],
        status=status,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@customers_bp.route('/me/transactions/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    """Get single transaction details"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    result = TransactionService.get_transaction_for_customer(
        identity['id'],
        transaction_id
    )

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@customers_bp.route('/me/transactions/<transaction_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_transaction(transaction_id):
    """Confirm a pending transaction"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    result = TransactionService.confirm_transaction(
        identity['id'],
        transaction_id
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Debt & Payments ====================

@customers_bp.route('/me/debt', methods=['GET'])
@jwt_required()
def get_debt():
    """Get current debt summary"""
    from app.services.payment_service import PaymentService

    identity = get_jwt_identity()
    result = PaymentService.get_customer_debt(identity['id'])

    return jsonify(result)


@customers_bp.route('/me/payments', methods=['GET'])
@jwt_required()
def get_payments():
    """Get payment history"""
    from app.services.payment_service import PaymentService

    identity = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = PaymentService.get_customer_payments(
        identity['id'],
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@customers_bp.route('/me/payments', methods=['POST'])
@jwt_required()
def make_payment():
    """Make a payment"""
    from app.services.payment_service import PaymentService

    identity = get_jwt_identity()
    data = request.get_json()

    result = PaymentService.make_payment(
        identity['id'],
        data.get('transaction_id'),
        data.get('amount'),
        data.get('payment_method')
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


# ==================== Stores ====================

@customers_bp.route('/stores', methods=['GET'])
@jwt_required()
def get_stores():
    """Get available stores"""
    from app.services.merchant_service import MerchantService

    city = request.args.get('city')
    search = request.args.get('search')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = MerchantService.get_stores_for_customer(
        city=city,
        search=search,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@customers_bp.route('/stores/<merchant_id>', methods=['GET'])
@jwt_required()
def get_store(merchant_id):
    """Get store details"""
    from app.services.merchant_service import MerchantService

    result = MerchantService.get_store_details(merchant_id)

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


# ==================== Notifications ====================

@customers_bp.route('/me/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get notifications"""
    from app.services.notification_service import NotificationService

    identity = get_jwt_identity()
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    page = request.args.get('page', 1, type=int)

    result = NotificationService.get_customer_notifications(
        identity['id'],
        unread_only=unread_only,
        page=page
    )

    return jsonify(result)


@customers_bp.route('/me/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    from app.services.notification_service import NotificationService

    identity = get_jwt_identity()
    result = NotificationService.mark_as_read(identity['id'], notification_id)

    return jsonify(result)
