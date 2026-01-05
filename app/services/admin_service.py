"""
Admin Service - Full Implementation
"""
from datetime import datetime, timedelta
from sqlalchemy import func, or_, and_
from app import db
from app.models.customer import Customer
from app.models.merchant import Merchant
from app.models.transaction import Transaction
from app.models.payment import Payment
from app.models.settlement import Settlement
from app.models.admin_user import AdminUser
from app.models.system_setting import SystemSetting
from app.models.credit_limit_request import CreditLimitRequest
from app.services.audit_service import AuditService


class AdminService:
    """Admin service with full database implementation"""

    # ==================== Dashboard ====================

    @staticmethod
    def get_dashboard_stats():
        """Get executive dashboard statistics"""
        try:
            today = datetime.utcnow().date()
            month_start = today.replace(day=1)

            # Customer stats
            total_customers = Customer.query.count()
            active_customers = Customer.query.filter_by(status='active').count()
            new_customers_today = Customer.query.filter(
                func.date(Customer.created_at) == today
            ).count()

            # Merchant stats
            total_merchants = Merchant.query.count()
            active_merchants = Merchant.query.filter_by(status='active').count()
            pending_merchants = Merchant.query.filter_by(status='pending').count()

            # Transaction stats for today
            today_transactions = Transaction.query.filter(
                func.date(Transaction.created_at) == today
            ).all()
            today_count = len(today_transactions)
            today_amount = sum(float(t.total_amount or 0) for t in today_transactions)

            # Month revenue
            month_transactions = Transaction.query.filter(
                Transaction.created_at >= month_start,
                Transaction.status.in_(['paid', 'confirmed'])
            ).all()
            month_revenue = sum(float(t.total_amount or 0) for t in month_transactions)

            # Overdue count
            overdue_count = Transaction.query.filter_by(status='overdue').count()

            # Pending settlements
            pending_settlements = Settlement.query.filter_by(status='pending').count()

            return {
                'success': True,
                'data': {
                    'customers': {
                        'total': total_customers,
                        'active': active_customers,
                        'new_today': new_customers_today
                    },
                    'merchants': {
                        'total': total_merchants,
                        'active': active_merchants,
                        'pending_approval': pending_merchants
                    },
                    'transactions': {
                        'today': {
                            'count': today_count,
                            'amount': today_amount
                        }
                    },
                    'revenue': {
                        'today': today_amount,
                        'month': month_revenue
                    },
                    'overdue_count': overdue_count,
                    'pending_settlements': pending_settlements
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    # ==================== Customer Management ====================

    @staticmethod
    def get_customers(status=None, search=None, city=None, page=1, per_page=20):
        """List all customers with filters"""
        try:
            query = Customer.query

            if status:
                query = query.filter(Customer.status == status)

            if city:
                query = query.filter(Customer.city == city)

            if search:
                search_term = f'%{search}%'
                query = query.filter(or_(
                    Customer.full_name_ar.ilike(search_term),
                    Customer.full_name_en.ilike(search_term),
                    Customer.email.ilike(search_term),
                    Customer.phone.ilike(search_term),
                    Customer.bariq_id.ilike(search_term),
                    Customer.national_id.ilike(search_term)
                ))

            query = query.order_by(Customer.created_at.desc())
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            customers = []
            for c in pagination.items:
                customer_data = c.to_dict()
                # Calculate used credit (remaining_amount = total_amount - paid_amount - returned_amount)
                active_debt = Transaction.query.filter(
                    Transaction.customer_id == c.id,
                    Transaction.status.in_(['confirmed', 'pending', 'overdue'])
                ).with_entities(func.sum(Transaction.total_amount - Transaction.paid_amount - Transaction.returned_amount)).scalar() or 0
                customer_data['used_credit'] = float(active_debt)
                customer_data['available_credit'] = float(c.credit_limit or 0) - float(active_debt)
                customers.append(customer_data)

            return {
                'success': True,
                'data': {
                    'customers': customers,
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': pagination.total,
                        'pages': pagination.pages
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_customer_details(customer_id):
        """Get detailed customer information"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'success': False, 'message': 'Customer not found'}

            data = customer.to_dict()

            # Calculate credit usage (remaining_amount = total_amount - paid_amount - returned_amount)
            active_debt = Transaction.query.filter(
                Transaction.customer_id == customer_id,
                Transaction.status.in_(['confirmed', 'pending', 'overdue'])
            ).with_entities(func.sum(Transaction.total_amount - Transaction.paid_amount - Transaction.returned_amount)).scalar() or 0

            data['used_credit'] = float(active_debt)
            data['available_credit'] = float(customer.credit_limit or 0) - float(active_debt)

            # Get recent transactions
            recent_transactions = Transaction.query.filter_by(
                customer_id=customer_id
            ).order_by(Transaction.created_at.desc()).limit(10).all()
            data['recent_transactions'] = [t.to_dict() for t in recent_transactions]

            # Get recent payments
            recent_payments = Payment.query.filter_by(
                customer_id=customer_id
            ).order_by(Payment.created_at.desc()).limit(10).all()
            data['recent_payments'] = [p.to_dict() for p in recent_payments]

            return {'success': True, 'data': data}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def update_customer(customer_id, data, admin_id):
        """Update customer information"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'success': False, 'message': 'Customer not found'}

            old_data = customer.to_dict()

            # Update allowed fields
            allowed_fields = ['status', 'full_name_ar', 'full_name_en', 'email', 'phone', 'city']
            for field in allowed_fields:
                if field in data:
                    setattr(customer, field, data[field])

            customer.updated_at = datetime.utcnow()
            db.session.commit()

            # Audit log
            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='update',
                entity_type='customer',
                entity_id=customer_id,
                details={'old': old_data, 'new': data}
            )

            return {'success': True, 'data': customer.to_dict()}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def update_customer_credit_limit(customer_id, credit_limit, reason, admin_id):
        """Update customer credit limit"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'success': False, 'message': 'Customer not found'}

            old_limit = customer.credit_limit
            customer.credit_limit = credit_limit
            customer.updated_at = datetime.utcnow()
            db.session.commit()

            # Audit log
            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='update_credit_limit',
                entity_type='customer',
                entity_id=customer_id,
                details={
                    'old_limit': float(old_limit or 0),
                    'new_limit': float(credit_limit),
                    'reason': reason
                }
            )

            return {'success': True, 'data': customer.to_dict()}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def adjust_customer_credit(customer_id, amount, reason, notes, admin_id):
        """Adjust customer credit (add or remove)"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'success': False, 'message': 'Customer not found'}

            old_limit = float(customer.credit_limit or 0)
            new_limit = old_limit + float(amount)

            if new_limit < 0:
                return {'success': False, 'message': 'Credit limit cannot be negative'}

            customer.credit_limit = new_limit
            customer.updated_at = datetime.utcnow()
            db.session.commit()

            # Audit log
            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='adjust_credit',
                entity_type='customer',
                entity_id=customer_id,
                details={
                    'old_limit': old_limit,
                    'adjustment': float(amount),
                    'new_limit': new_limit,
                    'reason': reason,
                    'notes': notes
                }
            )

            return {
                'success': True,
                'data': {
                    'old_limit': old_limit,
                    'adjustment': float(amount),
                    'new_limit': new_limit
                }
            }
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    # ==================== Credit Requests ====================

    @staticmethod
    def get_credit_requests(status=None, page=1, per_page=20):
        """List credit increase requests"""
        try:
            query = CreditLimitRequest.query

            if status:
                query = query.filter(CreditLimitRequest.status == status)

            query = query.order_by(CreditLimitRequest.created_at.desc())
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            return {
                'success': True,
                'data': {
                    'requests': [r.to_dict() for r in pagination.items],
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': pagination.total,
                        'pages': pagination.pages
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def approve_credit_request(request_id, approved_limit, reason, admin_id):
        """Approve credit increase request"""
        try:
            credit_request = CreditLimitRequest.query.get(request_id)
            if not credit_request:
                return {'success': False, 'message': 'Request not found'}

            if credit_request.status != 'pending':
                return {'success': False, 'message': 'Request already processed'}

            # Update request
            credit_request.status = 'approved'
            credit_request.approved_limit = approved_limit
            credit_request.decision_reason = reason
            credit_request.decided_by = admin_id
            credit_request.decided_at = datetime.utcnow()

            # Update customer credit limit
            customer = Customer.query.get(credit_request.customer_id)
            if customer:
                customer.credit_limit = approved_limit

            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='approve',
                entity_type='credit_request',
                entity_id=request_id,
                details={'approved_limit': approved_limit, 'reason': reason}
            )

            return {'success': True, 'message': 'Request approved'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def reject_credit_request(request_id, reason, admin_id):
        """Reject credit increase request"""
        try:
            credit_request = CreditLimitRequest.query.get(request_id)
            if not credit_request:
                return {'success': False, 'message': 'Request not found'}

            if credit_request.status != 'pending':
                return {'success': False, 'message': 'Request already processed'}

            credit_request.status = 'rejected'
            credit_request.decision_reason = reason
            credit_request.decided_by = admin_id
            credit_request.decided_at = datetime.utcnow()

            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='reject',
                entity_type='credit_request',
                entity_id=request_id,
                details={'reason': reason}
            )

            return {'success': True, 'message': 'Request rejected'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    # ==================== Merchant Management ====================

    @staticmethod
    def get_merchants(status=None, business_type=None, search=None, page=1, per_page=20):
        """List all merchants with filters"""
        try:
            query = Merchant.query

            if status:
                query = query.filter(Merchant.status == status)

            if business_type:
                query = query.filter(Merchant.business_type == business_type)

            if search:
                search_term = f'%{search}%'
                query = query.filter(or_(
                    Merchant.name_ar.ilike(search_term),
                    Merchant.name_en.ilike(search_term),
                    Merchant.commercial_registration.ilike(search_term),
                    Merchant.email.ilike(search_term)
                ))

            query = query.order_by(Merchant.created_at.desc())
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            merchants = []
            for m in pagination.items:
                merchant_data = m.to_dict()
                # Count branches
                from app.models.branch import Branch
                merchant_data['branches_count'] = Branch.query.filter_by(merchant_id=m.id).count()
                merchants.append(merchant_data)

            return {
                'success': True,
                'data': {
                    'merchants': merchants,
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': pagination.total,
                        'pages': pagination.pages
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_merchant_details(merchant_id):
        """Get detailed merchant information"""
        try:
            merchant = Merchant.query.get(merchant_id)
            if not merchant:
                return {'success': False, 'message': 'Merchant not found'}

            data = merchant.to_dict()

            # Get branches
            from app.models.branch import Branch
            branches = Branch.query.filter_by(merchant_id=merchant_id).all()
            data['branches'] = [b.to_dict() for b in branches]

            # Get staff count
            from app.models.merchant_user import MerchantUser
            data['staff_count'] = MerchantUser.query.filter_by(merchant_id=merchant_id).count()

            # Get transaction summary
            transactions = Transaction.query.filter_by(merchant_id=merchant_id).all()
            data['transactions_count'] = len(transactions)
            data['total_revenue'] = sum(float(t.total_amount or 0) for t in transactions)

            return {'success': True, 'data': data}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def update_merchant(merchant_id, data, admin_id):
        """Update merchant information"""
        try:
            merchant = Merchant.query.get(merchant_id)
            if not merchant:
                return {'success': False, 'message': 'Merchant not found'}

            old_data = merchant.to_dict()

            # Update allowed fields
            allowed_fields = ['status', 'name_ar', 'name_en', 'email', 'phone', 'commission_rate']
            for field in allowed_fields:
                if field in data:
                    setattr(merchant, field, data[field])

            merchant.updated_at = datetime.utcnow()
            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='update',
                entity_type='merchant',
                entity_id=merchant_id,
                details={'old': old_data, 'new': data}
            )

            return {'success': True, 'data': merchant.to_dict()}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def approve_merchant(merchant_id, commission_rate, admin_id):
        """Approve pending merchant"""
        try:
            merchant = Merchant.query.get(merchant_id)
            if not merchant:
                return {'success': False, 'message': 'Merchant not found'}

            if merchant.status != 'pending':
                return {'success': False, 'message': 'Merchant is not pending approval'}

            merchant.status = 'active'
            merchant.commission_rate = commission_rate or 2.5
            merchant.approved_at = datetime.utcnow()
            merchant.approved_by = admin_id

            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='approve',
                entity_type='merchant',
                entity_id=merchant_id,
                details={'commission_rate': commission_rate}
            )

            return {'success': True, 'message': 'Merchant approved'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def suspend_merchant(merchant_id, reason, admin_id):
        """Suspend merchant"""
        try:
            merchant = Merchant.query.get(merchant_id)
            if not merchant:
                return {'success': False, 'message': 'Merchant not found'}

            merchant.status = 'suspended'
            merchant.suspension_reason = reason
            merchant.suspended_at = datetime.utcnow()

            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='suspend',
                entity_type='merchant',
                entity_id=merchant_id,
                details={'reason': reason}
            )

            return {'success': True, 'message': 'Merchant suspended'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    # ==================== Transactions ====================

    @staticmethod
    def get_transactions(status=None, merchant_id=None, from_date=None, to_date=None, page=1, per_page=20):
        """List all transactions with filters"""
        try:
            query = Transaction.query

            if status:
                query = query.filter(Transaction.status == status)

            if merchant_id:
                query = query.filter(Transaction.merchant_id == merchant_id)

            if from_date:
                query = query.filter(Transaction.created_at >= from_date)

            if to_date:
                query = query.filter(Transaction.created_at <= to_date)

            query = query.order_by(Transaction.created_at.desc())
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            return {
                'success': True,
                'data': {
                    'transactions': [t.to_dict() for t in pagination.items],
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': pagination.total,
                        'pages': pagination.pages
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def get_overdue_transactions():
        """Get all overdue transactions"""
        try:
            transactions = Transaction.query.filter_by(status='overdue').order_by(
                Transaction.due_date.asc()
            ).all()

            total_amount = sum(float(t.remaining_amount or 0) for t in transactions)

            return {
                'success': True,
                'data': {
                    'transactions': [t.to_dict() for t in transactions],
                    'summary': {
                        'count': len(transactions),
                        'total_amount': total_amount
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    # ==================== Admin Staff ====================

    @staticmethod
    def get_admin_staff():
        """List all admin staff"""
        try:
            staff = AdminUser.query.order_by(AdminUser.created_at.desc()).all()
            staff_list = []
            for s in staff:
                data = s.to_dict()
                data['status'] = 'active' if s.is_active else 'inactive'
                data['last_login_at'] = s.last_login_at.isoformat() if s.last_login_at else None
                staff_list.append(data)
            return {
                'success': True,
                'data': {
                    'staff': staff_list
                }
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def create_admin_staff(data, admin_id):
        """Create new admin staff"""
        try:
            # Check email uniqueness
            if AdminUser.query.filter_by(email=data.get('email')).first():
                return {'success': False, 'message': 'Email already exists'}

            admin = AdminUser(
                email=data.get('email'),
                full_name=data.get('full_name'),
                role=data.get('role', 'support'),
                department=data.get('department'),
                is_active=data.get('status', 'active') == 'active'
            )
            admin.set_password(data.get('password'))

            db.session.add(admin)
            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='create',
                entity_type='admin',
                entity_id=admin.id,
                details={'email': admin.email, 'role': admin.role}
            )

            return {'success': True, 'data': admin.to_dict()}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    @staticmethod
    def update_admin_staff(staff_id, data, admin_id):
        """Update admin staff"""
        try:
            staff = AdminUser.query.get(staff_id)
            if not staff:
                return {'success': False, 'message': 'Staff not found'}

            # Update allowed fields
            if 'full_name' in data:
                staff.full_name = data['full_name']
            if 'role' in data:
                staff.role = data['role']
            if 'department' in data:
                staff.department = data['department']
            if 'status' in data:
                staff.is_active = data['status'] == 'active'

            # Update password if provided
            if data.get('password'):
                staff.set_password(data['password'])

            staff.updated_at = datetime.utcnow()
            db.session.commit()

            AuditService.log_action(
                actor_type='admin',
                actor_id=admin_id,
                action='update',
                entity_type='admin',
                entity_id=staff_id,
                details={k: v for k, v in data.items() if k != 'password'}
            )

            result = staff.to_dict()
            result['status'] = 'active' if staff.is_active else 'inactive'
            return {'success': True, 'data': result}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    # ==================== System Settings ====================

    @staticmethod
    def get_system_settings():
        """Get all system settings"""
        try:
            settings = SystemSetting.query.all()
            settings_dict = {s.key: s.value for s in settings}
            return {'success': True, 'data': settings_dict}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @staticmethod
    def update_system_setting(key, value, admin_id):
        """Update a system setting"""
        try:
            setting = SystemSetting.query.filter_by(key=key).first()

            old_value = setting.value if setting else None

            if setting:
                setting.value = str(value)
                setting.updated_at = datetime.utcnow()
            else:
                setting = SystemSetting(key=key, value=str(value))
                db.session.add(setting)

            db.session.commit()

            # Don't log sensitive settings
            if 'key' not in key.lower() and 'password' not in key.lower():
                AuditService.log_action(
                    actor_type='admin',
                    actor_id=admin_id,
                    action='update_setting',
                    entity_type='setting',
                    entity_id=key,
                    details={'old_value': old_value, 'new_value': value}
                )

            return {'success': True, 'message': 'Setting updated'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}
