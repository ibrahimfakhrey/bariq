"""
Real-time Event Emitters

Helper functions to emit WebSocket events from services.
These functions are used throughout the application to push real-time updates.
"""
from flask import current_app


def emit_to_customer(customer_id, event, data, include_self=True):
    """
    Emit event to a specific customer.

    Args:
        customer_id: Customer ID
        event: Event name (e.g., 'transaction_created', 'payment_completed')
        data: Event data dict
        include_self: Include the sender in broadcast (default True)
    """
    try:
        from app.extensions import socketio
        room = f"customer_{customer_id}"
        socketio.emit(event, data, room=room, namespace='/customer')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to customer {customer_id}: {str(e)}")


def emit_to_merchant(merchant_id, event, data):
    """
    Emit event to all staff of a merchant.

    Args:
        merchant_id: Merchant ID
        event: Event name (e.g., 'transaction_confirmed', 'payment_received')
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"merchant_{merchant_id}"
        socketio.emit(event, data, room=room, namespace='/merchant')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to merchant {merchant_id}: {str(e)}")


def emit_to_branch(branch_id, event, data):
    """
    Emit event to all staff of a specific branch.

    Args:
        branch_id: Branch ID
        event: Event name
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"branch_{branch_id}"
        socketio.emit(event, data, room=room, namespace='/merchant')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to branch {branch_id}: {str(e)}")


def emit_to_region(region_id, event, data):
    """
    Emit event to all staff of a specific region.

    Args:
        region_id: Region ID
        event: Event name
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"region_{region_id}"
        socketio.emit(event, data, room=room, namespace='/merchant')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to region {region_id}: {str(e)}")


def emit_to_staff(staff_id, event, data):
    """
    Emit event to a specific staff member.

    Args:
        staff_id: Staff/MerchantUser ID
        event: Event name
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"staff_{staff_id}"
        socketio.emit(event, data, room=room, namespace='/merchant')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to staff {staff_id}: {str(e)}")


def emit_to_admins(event, data):
    """
    Emit event to all connected admins.

    Args:
        event: Event name (e.g., 'merchant_registered', 'credit_request_new')
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        socketio.emit(event, data, room='admin_room', namespace='/admin')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to admins: {str(e)}")


def emit_to_admin(admin_id, event, data):
    """
    Emit event to a specific admin.

    Args:
        admin_id: Admin user ID
        event: Event name
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"admin_{admin_id}"
        socketio.emit(event, data, room=room, namespace='/admin')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to admin {admin_id}: {str(e)}")


def emit_to_transaction(transaction_id, event, data):
    """
    Emit event to all subscribers of a specific transaction.
    Used when both customer and merchant are watching the same transaction.

    Args:
        transaction_id: Transaction ID
        event: Event name
        data: Event data dict
    """
    try:
        from app.extensions import socketio
        room = f"transaction_{transaction_id}"
        # Emit to both namespaces
        socketio.emit(event, data, room=room, namespace='/customer')
        socketio.emit(event, data, room=room, namespace='/merchant')
    except Exception as e:
        current_app.logger.error(f"Failed to emit to transaction {transaction_id}: {str(e)}")


# ==================== Event Data Builders ====================

def build_transaction_event_data(transaction):
    """
    Build standard transaction event data.

    Args:
        transaction: Transaction model instance

    Returns:
        dict: Event data
    """
    return {
        'transaction_id': transaction.id,
        'reference_number': transaction.reference_number,
        'status': transaction.status,
        'total_amount': float(transaction.total_amount) if transaction.total_amount else 0,
        'paid_amount': float(transaction.paid_amount) if transaction.paid_amount else 0,
        'remaining_amount': float(transaction.remaining_amount) if transaction.remaining_amount else 0,
        'customer_id': transaction.customer_id,
        'merchant_id': transaction.merchant_id,
        'branch_id': transaction.branch_id,
        'due_date': transaction.due_date.isoformat() if transaction.due_date else None,
        'updated_at': transaction.updated_at.isoformat() if transaction.updated_at else None
    }


def build_payment_event_data(payment):
    """
    Build standard payment event data.

    Args:
        payment: Payment model instance

    Returns:
        dict: Event data
    """
    return {
        'payment_id': payment.id,
        'reference_number': payment.reference_number,
        'status': payment.status,
        'amount': float(payment.amount) if payment.amount else 0,
        'payment_method': payment.payment_method,
        'transaction_id': payment.transaction_id,
        'customer_id': payment.customer_id,
        'gateway_reference': payment.gateway_reference,
        'created_at': payment.created_at.isoformat() if payment.created_at else None
    }


def build_notification_event_data(notification):
    """
    Build standard notification event data.

    Args:
        notification: Notification model instance

    Returns:
        dict: Event data
    """
    return {
        'notification_id': notification.id,
        'title_ar': notification.title_ar,
        'title_en': notification.title_en,
        'body_ar': notification.body_ar,
        'body_en': notification.body_en,
        'type': notification.type,
        'related_entity_type': notification.related_entity_type,
        'related_entity_id': notification.related_entity_id,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat() if notification.created_at else None
    }


def build_settlement_event_data(settlement):
    """
    Build standard settlement event data.

    Args:
        settlement: Settlement model instance

    Returns:
        dict: Event data
    """
    return {
        'settlement_id': settlement.id,
        'reference_number': settlement.reference_number,
        'status': settlement.status,
        'merchant_id': settlement.merchant_id,
        'branch_id': settlement.branch_id,
        'gross_amount': float(settlement.gross_amount) if settlement.gross_amount else 0,
        'net_amount': float(settlement.net_amount) if settlement.net_amount else 0,
        'commission_amount': float(settlement.commission_amount) if settlement.commission_amount else 0,
        'transaction_count': settlement.transaction_count,
        'period_start': settlement.period_start.isoformat() if settlement.period_start else None,
        'period_end': settlement.period_end.isoformat() if settlement.period_end else None,
        'created_at': settlement.created_at.isoformat() if settlement.created_at else None
    }


def build_credit_event_data(customer):
    """
    Build credit update event data.

    Args:
        customer: Customer model instance

    Returns:
        dict: Event data
    """
    return {
        'customer_id': customer.id,
        'credit_limit': float(customer.credit_limit) if customer.credit_limit else 0,
        'available_credit': float(customer.available_credit) if customer.available_credit else 0,
        'used_credit': float(customer.credit_limit - customer.available_credit) if customer.credit_limit else 0
    }
