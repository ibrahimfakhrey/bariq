"""
Utilities Package
"""
from app.utils.role_access import (
    AccessDeniedError,
    get_merchant_user,
    get_accessible_branch_ids,
    get_accessible_region_ids,
    filter_by_accessible_branches,
    filter_by_cashier_own_transactions,
    filter_transactions_by_role,
    validate_branch_access,
    validate_region_access,
    validate_staff_management,
    validate_staff_view,
    filter_staff_by_role,
    can_view_reports,
    can_view_settlements,
    require_minimum_role,
    require_not_cashier,
)

from app.utils.realtime import (
    emit_to_customer,
    emit_to_merchant,
    emit_to_branch,
    emit_to_region,
    emit_to_staff,
    emit_to_admins,
    emit_to_admin,
    emit_to_transaction,
    build_transaction_event_data,
    build_payment_event_data,
    build_notification_event_data,
    build_settlement_event_data,
    build_credit_event_data,
)
