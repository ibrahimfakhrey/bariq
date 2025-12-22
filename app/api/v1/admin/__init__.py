"""
Admin Routes
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user

admin_bp = Blueprint('admin', __name__)


# ==================== Dashboard ====================

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Executive dashboard"""
    from app.services.admin_service import AdminService

    result = AdminService.get_dashboard_stats()
    return jsonify(result)


# ==================== Customer Management ====================

@admin_bp.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    """List all customers"""
    from app.services.admin_service import AdminService

    status = request.args.get('status')
    search = request.args.get('search')
    city = request.args.get('city')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = AdminService.get_customers(
        status=status,
        search=search,
        city=city,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@admin_bp.route('/customers/<customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Get customer details"""
    from app.services.admin_service import AdminService

    result = AdminService.get_customer_details(customer_id)

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@admin_bp.route('/customers/<customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Update customer"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.update_customer(customer_id, data, identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@admin_bp.route('/customers/<customer_id>/credit-limit', methods=['PUT'])
@jwt_required()
def update_customer_credit(customer_id):
    """Update customer credit limit"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.update_customer_credit_limit(
        customer_id,
        data.get('credit_limit'),
        data.get('reason'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Credit Requests ====================

@admin_bp.route('/credit-requests', methods=['GET'])
@jwt_required()
def get_credit_requests():
    """List credit increase requests"""
    from app.services.admin_service import AdminService

    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)

    result = AdminService.get_credit_requests(status=status, page=page)

    return jsonify(result)


@admin_bp.route('/credit-requests/<request_id>/approve', methods=['PUT'])
@jwt_required()
def approve_credit_request(request_id):
    """Approve credit request"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.approve_credit_request(
        request_id,
        data.get('approved_limit'),
        data.get('reason'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@admin_bp.route('/credit-requests/<request_id>/reject', methods=['PUT'])
@jwt_required()
def reject_credit_request(request_id):
    """Reject credit request"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.reject_credit_request(
        request_id,
        data.get('reason'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Merchant Management ====================

@admin_bp.route('/merchants', methods=['GET'])
@jwt_required()
def get_merchants():
    """List all merchants"""
    from app.services.admin_service import AdminService

    status = request.args.get('status')
    business_type = request.args.get('business_type')
    search = request.args.get('search')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = AdminService.get_merchants(
        status=status,
        business_type=business_type,
        search=search,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@admin_bp.route('/merchants/<merchant_id>', methods=['GET'])
@jwt_required()
def get_merchant(merchant_id):
    """Get merchant details"""
    from app.services.admin_service import AdminService

    result = AdminService.get_merchant_details(merchant_id)

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@admin_bp.route('/merchants/<merchant_id>', methods=['PUT'])
@jwt_required()
def update_merchant(merchant_id):
    """Update merchant"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.update_merchant(merchant_id, data, identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@admin_bp.route('/merchants/<merchant_id>/approve', methods=['PUT'])
@jwt_required()
def approve_merchant(merchant_id):
    """Approve pending merchant"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.approve_merchant(
        merchant_id,
        data.get('commission_rate'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@admin_bp.route('/merchants/<merchant_id>/suspend', methods=['PUT'])
@jwt_required()
def suspend_merchant(merchant_id):
    """Suspend merchant"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.suspend_merchant(
        merchant_id,
        data.get('reason'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Transactions ====================

@admin_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """List all transactions"""
    from app.services.admin_service import AdminService

    status = request.args.get('status')
    merchant_id = request.args.get('merchant_id')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = AdminService.get_transactions(
        status=status,
        merchant_id=merchant_id,
        from_date=from_date,
        to_date=to_date,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@admin_bp.route('/transactions/overdue', methods=['GET'])
@jwt_required()
def get_overdue_transactions():
    """Get overdue transactions"""
    from app.services.admin_service import AdminService

    result = AdminService.get_overdue_transactions()

    return jsonify(result)


# ==================== Settlements ====================

@admin_bp.route('/settlements', methods=['GET'])
@jwt_required()
def get_settlements():
    """List all settlements"""
    from app.services.settlement_service import SettlementService

    status = request.args.get('status')
    merchant_id = request.args.get('merchant_id')
    page = request.args.get('page', 1, type=int)

    result = SettlementService.get_all_settlements(
        status=status,
        merchant_id=merchant_id,
        page=page
    )

    return jsonify(result)


@admin_bp.route('/settlements/<settlement_id>', methods=['GET'])
@jwt_required()
def get_settlement(settlement_id):
    """Get settlement details"""
    from app.services.settlement_service import SettlementService

    result = SettlementService.get_settlement_details_admin(settlement_id)

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@admin_bp.route('/settlements/<settlement_id>/approve', methods=['PUT'])
@jwt_required()
def approve_settlement(settlement_id):
    """Approve settlement"""
    from app.services.settlement_service import SettlementService

    identity = current_user
    result = SettlementService.approve_settlement(settlement_id, identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@admin_bp.route('/settlements/<settlement_id>/transfer', methods=['PUT'])
@jwt_required()
def transfer_settlement(settlement_id):
    """Mark settlement as transferred"""
    from app.services.settlement_service import SettlementService

    identity = current_user
    data = request.get_json()

    result = SettlementService.mark_as_transferred(
        settlement_id,
        data.get('transfer_reference'),
        identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Admin Staff ====================

@admin_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """List admin staff"""
    from app.services.admin_service import AdminService

    result = AdminService.get_admin_staff()

    return jsonify(result)


@admin_bp.route('/staff', methods=['POST'])
@jwt_required()
def create_staff():
    """Add admin staff"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.create_admin_staff(data, identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@admin_bp.route('/staff/<staff_id>', methods=['PUT'])
@jwt_required()
def update_staff(staff_id):
    """Update admin staff"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.update_admin_staff(staff_id, data, identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Reports ====================

@admin_bp.route('/reports/overview', methods=['GET'])
@jwt_required()
def get_reports_overview():
    """General overview report"""
    from app.services.report_service import ReportService

    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')

    result = ReportService.get_admin_overview(from_date=from_date, to_date=to_date)

    return jsonify(result)


@admin_bp.route('/reports/financial', methods=['GET'])
@jwt_required()
def get_reports_financial():
    """Financial report"""
    from app.services.report_service import ReportService

    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')

    result = ReportService.get_financial_report(from_date=from_date, to_date=to_date)

    return jsonify(result)


# ==================== Audit Logs ====================

@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """View audit trail"""
    from app.services.audit_service import AuditService

    actor_type = request.args.get('actor_type')
    action = request.args.get('action')
    from_date = request.args.get('from_date')
    page = request.args.get('page', 1, type=int)

    result = AuditService.get_audit_logs(
        actor_type=actor_type,
        action=action,
        from_date=from_date,
        page=page
    )

    return jsonify(result)


# ==================== Settings ====================

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get all settings"""
    from app.services.admin_service import AdminService

    result = AdminService.get_system_settings()

    return jsonify(result)


@admin_bp.route('/settings/<key>', methods=['PUT'])
@jwt_required()
def update_setting(key):
    """Update setting"""
    from app.services.admin_service import AdminService

    identity = current_user
    data = request.get_json()

    result = AdminService.update_system_setting(key, data.get('value'), identity['id'])

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)
