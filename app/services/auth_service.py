"""
Authentication Service
"""
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime
from app.extensions import db
from app.models.customer import Customer
from app.models.merchant_user import MerchantUser
from app.models.admin_user import AdminUser


class AuthService:
    """Authentication service for all user types"""

    @staticmethod
    def verify_nafath_and_login(national_id, transaction_id):
        """
        Verify Nafath authentication and login/register customer

        In production, this would:
        1. Call Nafath API to verify the transaction
        2. Get customer data from Nafath
        3. Create or update customer record
        4. Generate JWT tokens
        """
        # TODO: Implement real Nafath verification
        # For now, mock the verification

        # Check if customer exists
        customer = Customer.query.filter_by(national_id=national_id).first()

        if not customer:
            # Create new customer (in production, use data from Nafath)
            customer = Customer(
                national_id=national_id,
                full_name_ar=f'عميل {national_id[-4:]}',  # Placeholder
                phone=f'+9665{national_id[-8:]}',  # Placeholder
                status='active',
                credit_limit=current_app.config.get('DEFAULT_CREDIT_LIMIT', 500),
                available_credit=current_app.config.get('DEFAULT_CREDIT_LIMIT', 500),
                verified_at=datetime.utcnow()
            )
            db.session.add(customer)
            db.session.commit()

        # Update last login
        customer.last_login_at = datetime.utcnow()
        db.session.commit()

        # Generate tokens
        identity = {
            'id': customer.id,
            'type': 'customer',
            'national_id': customer.national_id
        }

        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)

        return {
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'customer': customer.to_dict()
            }
        }

    @staticmethod
    def merchant_login(email, password):
        """Authenticate merchant user"""
        user = MerchantUser.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return {
                'success': False,
                'message': 'Invalid email or password',
                'error_code': 'AUTH_001'
            }

        if not user.is_active:
            return {
                'success': False,
                'message': 'Account is deactivated',
                'error_code': 'AUTH_003'
            }

        # Check merchant status
        if user.merchant.status != 'active':
            return {
                'success': False,
                'message': 'Merchant account is not active',
                'error_code': 'MERCH_002'
            }

        # Update last login
        user.last_login_at = datetime.utcnow()
        db.session.commit()

        # Generate tokens
        identity = {
            'id': user.id,
            'type': 'merchant_user',
            'merchant_id': user.merchant_id,
            'branch_id': user.branch_id,
            'region_id': user.region_id,
            'role': user.role,
            'permissions': user.permissions or []
        }

        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)

        return {
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
                'merchant': user.merchant.to_dict()
            }
        }

    @staticmethod
    def admin_login(email, password):
        """Authenticate admin user"""
        user = AdminUser.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return {
                'success': False,
                'message': 'Invalid email or password',
                'error_code': 'AUTH_001'
            }

        if not user.is_active:
            return {
                'success': False,
                'message': 'Account is deactivated',
                'error_code': 'AUTH_003'
            }

        # Update last login
        user.last_login_at = datetime.utcnow()
        db.session.commit()

        # Generate tokens
        identity = {
            'id': user.id,
            'type': 'admin_user',
            'role': user.role,
            'permissions': user.permissions or []
        }

        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)

        return {
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }
        }
