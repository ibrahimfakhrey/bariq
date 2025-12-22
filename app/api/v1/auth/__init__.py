"""
Authentication Routes
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    current_user
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/nafath/initiate', methods=['POST'])
def nafath_initiate():
    """Initiate Nafath authentication"""
    data = request.get_json()
    national_id = data.get('national_id')

    if not national_id:
        return jsonify({
            'success': False,
            'message': 'National ID is required',
            'error_code': 'VAL_001'
        }), 400

    # TODO: Integrate with real Nafath API
    # For now, return mock response
    return jsonify({
        'success': True,
        'message': 'Nafath authentication initiated',
        'data': {
            'transaction_id': 'mock-transaction-id',
            'random_number': '42'
        }
    })


@auth_bp.route('/nafath/verify', methods=['POST'])
def nafath_verify():
    """Verify Nafath authentication"""
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    national_id = data.get('national_id')

    if not transaction_id or not national_id:
        return jsonify({
            'success': False,
            'message': 'Transaction ID and National ID are required',
            'error_code': 'VAL_001'
        }), 400

    # TODO: Verify with real Nafath API and create/get customer
    # For now, return mock response
    from app.services.auth_service import AuthService

    result = AuthService.verify_nafath_and_login(national_id, transaction_id)

    if not result['success']:
        return jsonify(result), 401

    return jsonify(result)


@auth_bp.route('/customer/login', methods=['POST'])
def customer_login():
    """Customer login with username/password"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'Username and password are required',
            'error_code': 'VAL_001'
        }), 400

    from app.services.auth_service import AuthService
    result = AuthService.customer_login(username, password)

    if not result['success']:
        return jsonify(result), 401

    return jsonify(result)


@auth_bp.route('/merchant/login', methods=['POST'])
def merchant_login():
    """Merchant user login"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required',
            'error_code': 'VAL_001'
        }), 400

    from app.services.auth_service import AuthService
    result = AuthService.merchant_login(email, password)

    if not result['success']:
        return jsonify(result), 401

    return jsonify(result)


@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Admin user login"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required',
            'error_code': 'VAL_001'
        }), 400

    from app.services.auth_service import AuthService
    result = AuthService.admin_login(email, password)

    if not result['success']:
        return jsonify(result), 401

    return jsonify(result)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    identity = current_user
    access_token = create_access_token(identity=identity)

    return jsonify({
        'success': True,
        'data': {
            'access_token': access_token
        }
    })


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    # TODO: Add token to blacklist if needed
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })
