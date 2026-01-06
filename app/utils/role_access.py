"""
Role-Based Access Control Utilities

Provides functions for enforcing role-based data filtering across the merchant portal.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.merchant_user import MerchantUser, ROLE_HIERARCHY


class AccessDeniedError(Exception):
    """Raised when user doesn't have permission to access a resource"""
    def __init__(self, message="Access denied"):
        self.message = message
        super().__init__(self.message)


def get_merchant_user(staff_id):
    """Get MerchantUser by ID"""
    return MerchantUser.query.filter_by(id=staff_id, is_active=True).first()


def get_accessible_branch_ids(user):
    """
    Get list of branch IDs the user can access based on their role.

    Args:
        user: MerchantUser instance

    Returns:
        List of branch IDs the user can access
    """
    if user is None:
        return []
    return user.get_accessible_branch_ids()


def get_accessible_region_ids(user):
    """
    Get list of region IDs the user can access based on their role.

    Args:
        user: MerchantUser instance

    Returns:
        List of region IDs the user can access
    """
    if user is None:
        return []
    return user.get_accessible_region_ids()


def filter_by_accessible_branches(query, user, branch_column):
    """
    Apply branch-based filtering to a SQLAlchemy query based on user's role.

    Args:
        query: SQLAlchemy query object
        user: MerchantUser instance
        branch_column: The column to filter on (e.g., Transaction.branch_id)

    Returns:
        Filtered query
    """
    if user is None:
        return query.filter(False)  # Return empty result

    # Owner and Executive Manager see everything
    if user.can_see_all_branches():
        return query

    # Get accessible branches and filter
    accessible_branch_ids = user.get_accessible_branch_ids()
    if accessible_branch_ids:
        return query.filter(branch_column.in_(accessible_branch_ids))

    # No access
    return query.filter(False)


def filter_by_cashier_own_transactions(query, user, cashier_column):
    """
    For cashiers, filter to only show transactions they created.

    Args:
        query: SQLAlchemy query object
        user: MerchantUser instance
        cashier_column: The column to filter on (e.g., Transaction.cashier_id)

    Returns:
        Filtered query
    """
    if user is None:
        return query.filter(False)

    # Cashiers only see their own transactions
    if user.role == 'cashier':
        return query.filter(cashier_column == user.id)

    return query


def filter_transactions_by_role(query, user, branch_column, cashier_column):
    """
    Apply full role-based filtering to transactions query.
    Combines branch filtering with cashier-specific filtering.

    Args:
        query: SQLAlchemy query object
        user: MerchantUser instance
        branch_column: The branch_id column (e.g., Transaction.branch_id)
        cashier_column: The cashier_id column (e.g., Transaction.cashier_id)

    Returns:
        Filtered query
    """
    if user is None:
        return query.filter(False)

    # Cashiers only see their own transactions
    if user.role == 'cashier':
        return query.filter(cashier_column == user.id)

    # Other roles see transactions from their accessible branches
    return filter_by_accessible_branches(query, user, branch_column)


def validate_branch_access(user, branch_id):
    """
    Check if user can access a specific branch.

    Args:
        user: MerchantUser instance
        branch_id: Branch ID to check

    Returns:
        bool: True if access allowed, False otherwise
    """
    if user is None or branch_id is None:
        return False

    # Owner and Executive Manager can access all branches
    if user.can_see_all_branches():
        return True

    accessible_branch_ids = user.get_accessible_branch_ids()
    return branch_id in accessible_branch_ids


def validate_region_access(user, region_id):
    """
    Check if user can access a specific region.

    Args:
        user: MerchantUser instance
        region_id: Region ID to check

    Returns:
        bool: True if access allowed, False otherwise
    """
    if user is None or region_id is None:
        return False

    # Owner and Executive Manager can access all regions
    if user.can_see_all_regions():
        return True

    accessible_region_ids = user.get_accessible_region_ids()
    return region_id in accessible_region_ids


def validate_staff_management(requester, target_user):
    """
    Check if requester can manage (view/edit/delete) a target user.

    Args:
        requester: MerchantUser instance (the one making the request)
        target_user: MerchantUser instance (the one being accessed)

    Returns:
        bool: True if management is allowed, False otherwise
    """
    if requester is None or target_user is None:
        return False

    # Can't manage yourself through this check
    if requester.id == target_user.id:
        return True  # Can always access own data

    # Must be able to manage staff
    if not requester.can_manage_staff():
        return False

    # Must have higher role level
    if not requester.can_manage(target_user):
        return False

    # Additional scope checks based on role
    if requester.role == 'region_manager':
        # Region manager can only manage staff in their region
        if target_user.region_id != requester.region_id:
            return False

    elif requester.role == 'branch_manager':
        # Branch manager can only manage staff in their branch
        if target_user.branch_id != requester.branch_id:
            return False

    return True


def validate_staff_view(requester, target_user):
    """
    Check if requester can view a target user's details.
    More permissive than management - can view subordinates and peers in scope.

    Args:
        requester: MerchantUser instance (the one making the request)
        target_user: MerchantUser instance (the one being viewed)

    Returns:
        bool: True if viewing is allowed, False otherwise
    """
    if requester is None or target_user is None:
        return False

    # Can always view self
    if requester.id == target_user.id:
        return True

    # Owner and Executive Manager can view all staff
    if requester.is_top_level():
        return True

    # Region manager can view staff in their region
    if requester.role == 'region_manager':
        return target_user.region_id == requester.region_id

    # Branch manager can view staff in their branch
    if requester.role == 'branch_manager':
        return target_user.branch_id == requester.branch_id

    # Cashiers cannot view other staff
    return False


def filter_staff_by_role(query, requester):
    """
    Filter staff query based on requester's role.

    Args:
        query: SQLAlchemy query for MerchantUser
        requester: MerchantUser instance making the request

    Returns:
        Filtered query
    """
    if requester is None:
        return query.filter(False)

    # Owner and Executive Manager see all staff
    if requester.is_top_level():
        return query

    # Region manager sees staff in their region
    if requester.role == 'region_manager' and requester.region_id:
        return query.filter(MerchantUser.region_id == requester.region_id)

    # Branch manager sees staff in their branch
    if requester.role == 'branch_manager' and requester.branch_id:
        return query.filter(MerchantUser.branch_id == requester.branch_id)

    # Cashiers cannot list staff
    return query.filter(False)


def can_view_reports(user):
    """
    Check if user can view reports.
    Cashiers cannot view reports.

    Args:
        user: MerchantUser instance

    Returns:
        bool: True if can view reports
    """
    if user is None:
        return False
    return user.role != 'cashier'


def can_view_settlements(user):
    """
    Check if user can view settlements.
    Cashiers cannot view settlements.

    Args:
        user: MerchantUser instance

    Returns:
        bool: True if can view settlements
    """
    if user is None:
        return False
    return user.role != 'cashier'


def require_minimum_role(*allowed_roles):
    """
    Decorator to require minimum role level for an endpoint.

    Args:
        *allowed_roles: Role names that are allowed (e.g., 'owner', 'executive_manager')

    Usage:
        @require_minimum_role('owner', 'executive_manager', 'region_manager')
        def some_endpoint():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            identity = get_jwt_identity()
            if not identity:
                return jsonify({'error': 'Authentication required'}), 401

            user_role = identity.get('role')
            if user_role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def require_not_cashier():
    """
    Decorator to deny cashiers access to an endpoint.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            identity = get_jwt_identity()
            if not identity:
                return jsonify({'error': 'Authentication required'}), 401

            if identity.get('role') == 'cashier':
                return jsonify({'error': 'Cashiers cannot access this resource'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
