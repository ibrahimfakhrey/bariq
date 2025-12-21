"""
Merchant Routes
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

merchants_bp = Blueprint('merchants', __name__)


# ==================== Registration & Profile ====================

@merchants_bp.route('/register', methods=['POST'])
def register_merchant():
    """Register new merchant"""
    from app.services.merchant_service import MerchantService

    data = request.get_json()
    result = MerchantService.register_merchant(data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me', methods=['GET'])
@jwt_required()
def get_merchant_profile():
    """Get merchant profile"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    result = MerchantService.get_merchant_profile(identity['merchant_id'])

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@merchants_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_merchant_profile():
    """Update merchant profile"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.update_merchant_profile(identity['merchant_id'], data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Regions ====================

@merchants_bp.route('/me/regions', methods=['GET'])
@jwt_required()
def get_regions():
    """Get all regions"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    result = MerchantService.get_regions(identity['merchant_id'])

    return jsonify(result)


@merchants_bp.route('/me/regions', methods=['POST'])
@jwt_required()
def create_region():
    """Create region"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.create_region(identity['merchant_id'], data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me/regions/<region_id>', methods=['PUT'])
@jwt_required()
def update_region(region_id):
    """Update region"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.update_region(identity['merchant_id'], region_id, data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


@merchants_bp.route('/me/regions/<region_id>', methods=['DELETE'])
@jwt_required()
def delete_region(region_id):
    """Delete region"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    result = MerchantService.delete_region(identity['merchant_id'], region_id)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Branches ====================

@merchants_bp.route('/me/branches', methods=['GET'])
@jwt_required()
def get_branches():
    """Get all branches"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    region_id = request.args.get('region_id')
    is_active = request.args.get('is_active')

    result = MerchantService.get_branches(
        identity['merchant_id'],
        region_id=region_id,
        is_active=is_active
    )

    return jsonify(result)


@merchants_bp.route('/me/branches', methods=['POST'])
@jwt_required()
def create_branch():
    """Create branch"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.create_branch(identity['merchant_id'], data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me/branches/<branch_id>', methods=['GET'])
@jwt_required()
def get_branch(branch_id):
    """Get branch details"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    result = MerchantService.get_branch(identity['merchant_id'], branch_id)

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@merchants_bp.route('/me/branches/<branch_id>', methods=['PUT'])
@jwt_required()
def update_branch(branch_id):
    """Update branch"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.update_branch(identity['merchant_id'], branch_id, data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Staff ====================

@merchants_bp.route('/me/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """Get all staff"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    role = request.args.get('role')
    branch_id = request.args.get('branch_id')

    result = MerchantService.get_staff(
        identity['merchant_id'],
        role=role,
        branch_id=branch_id
    )

    return jsonify(result)


@merchants_bp.route('/me/staff', methods=['POST'])
@jwt_required()
def create_staff():
    """Add staff member"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.create_staff(identity['merchant_id'], data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me/staff/<staff_id>', methods=['PUT'])
@jwt_required()
def update_staff(staff_id):
    """Update staff"""
    from app.services.merchant_service import MerchantService

    identity = get_jwt_identity()
    data = request.get_json()
    result = MerchantService.update_staff(identity['merchant_id'], staff_id, data)

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Transactions ====================

@merchants_bp.route('/me/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    """Create new transaction/invoice"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    data = request.get_json()

    result = TransactionService.create_transaction(
        merchant_id=identity['merchant_id'],
        branch_id=data.get('branch_id') or identity.get('branch_id'),
        cashier_id=identity['id'],
        customer_national_id=data.get('customer_national_id'),
        items=data.get('items', []),
        discount=data.get('discount', 0),
        notes=data.get('notes')
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get transactions"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()

    branch_id = request.args.get('branch_id')
    status = request.args.get('status')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    result = TransactionService.get_merchant_transactions(
        merchant_id=identity['merchant_id'],
        branch_id=branch_id or identity.get('branch_id'),
        status=status,
        from_date=from_date,
        to_date=to_date,
        page=page,
        per_page=per_page
    )

    return jsonify(result)


@merchants_bp.route('/me/transactions/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    """Get transaction details"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    result = TransactionService.get_transaction_for_merchant(
        identity['merchant_id'],
        transaction_id
    )

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)


@merchants_bp.route('/me/transactions/<transaction_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_transaction(transaction_id):
    """Cancel pending transaction"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    data = request.get_json()

    result = TransactionService.cancel_transaction(
        identity['merchant_id'],
        transaction_id,
        data.get('reason')
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)


# ==================== Returns ====================

@merchants_bp.route('/me/transactions/<transaction_id>/returns', methods=['POST'])
@jwt_required()
def create_return(transaction_id):
    """Process return"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()
    data = request.get_json()

    result = TransactionService.process_return(
        merchant_id=identity['merchant_id'],
        transaction_id=transaction_id,
        return_amount=data.get('return_amount'),
        reason=data.get('reason'),
        reason_details=data.get('reason_details'),
        returned_items=data.get('returned_items', []),
        processed_by=identity['id']
    )

    if not result['success']:
        return jsonify(result), 400

    return jsonify(result), 201


@merchants_bp.route('/me/returns', methods=['GET'])
@jwt_required()
def get_returns():
    """Get all returns"""
    from app.services.transaction_service import TransactionService

    identity = get_jwt_identity()

    branch_id = request.args.get('branch_id')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')

    result = TransactionService.get_merchant_returns(
        merchant_id=identity['merchant_id'],
        branch_id=branch_id,
        from_date=from_date,
        to_date=to_date
    )

    return jsonify(result)


# ==================== Reports ====================

@merchants_bp.route('/me/reports/summary', methods=['GET'])
@jwt_required()
def get_reports_summary():
    """Get summary dashboard"""
    from app.services.report_service import ReportService

    identity = get_jwt_identity()

    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    branch_id = request.args.get('branch_id')

    result = ReportService.get_merchant_summary(
        merchant_id=identity['merchant_id'],
        branch_id=branch_id,
        from_date=from_date,
        to_date=to_date
    )

    return jsonify(result)


@merchants_bp.route('/me/reports/transactions', methods=['GET'])
@jwt_required()
def get_reports_transactions():
    """Detailed transaction report"""
    from app.services.report_service import ReportService

    identity = get_jwt_identity()

    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    branch_id = request.args.get('branch_id')
    group_by = request.args.get('group_by', 'day')

    result = ReportService.get_transaction_report(
        merchant_id=identity['merchant_id'],
        branch_id=branch_id,
        from_date=from_date,
        to_date=to_date,
        group_by=group_by
    )

    return jsonify(result)


# ==================== Settlements ====================

@merchants_bp.route('/me/settlements', methods=['GET'])
@jwt_required()
def get_settlements():
    """Get settlements"""
    from app.services.settlement_service import SettlementService

    identity = get_jwt_identity()

    status = request.args.get('status')
    branch_id = request.args.get('branch_id')
    page = request.args.get('page', 1, type=int)

    result = SettlementService.get_merchant_settlements(
        merchant_id=identity['merchant_id'],
        branch_id=branch_id,
        status=status,
        page=page
    )

    return jsonify(result)


@merchants_bp.route('/me/settlements/<settlement_id>', methods=['GET'])
@jwt_required()
def get_settlement(settlement_id):
    """Get settlement details"""
    from app.services.settlement_service import SettlementService

    identity = get_jwt_identity()
    result = SettlementService.get_settlement_details(
        identity['merchant_id'],
        settlement_id
    )

    if not result['success']:
        return jsonify(result), 404

    return jsonify(result)
