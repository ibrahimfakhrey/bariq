"""
Merchant Socket Events - Real-time updates for merchant staff
"""
from flask import request, current_app
from flask_socketio import Namespace, emit
from app.sockets.auth import (
    verify_socket_token,
    register_socket_connection,
    unregister_socket_connection,
    socket_authenticated,
    get_socket_identity
)


class MerchantNamespace(Namespace):
    """
    Merchant namespace for real-time updates.

    Events emitted TO merchants:
    - transaction_created: New transaction created by cashier
    - transaction_confirmed: Customer confirmed transaction
    - transaction_rejected: Customer rejected transaction
    - transaction_status_changed: Transaction status update
    - payment_received: Payment received for transaction
    - return_processed: Return processed
    - settlement_created: New settlement created
    - settlement_approved: Settlement approved by admin
    - settlement_transferred: Settlement transferred
    - notification_new: New notification
    - staff_update: Staff member updated

    Events FROM merchants:
    - ping: Keep-alive ping
    - subscribe_branch: Subscribe to specific branch updates
    """

    def on_connect(self, auth=None):
        """Handle merchant staff connection with JWT authentication."""
        token = None

        # Try to get token from auth dict
        if auth and isinstance(auth, dict):
            token = auth.get('token')

        # Fallback: try to get from query string
        if not token:
            token = request.args.get('token')

        if not token:
            current_app.logger.warning("Merchant socket connection rejected: No token")
            return False

        identity = verify_socket_token(token)

        if not identity:
            current_app.logger.warning("Merchant socket connection rejected: Invalid token")
            return False

        if identity.get('type') != 'merchant_user':
            current_app.logger.warning(
                f"Merchant socket connection rejected: Wrong user type {identity.get('type')}"
            )
            return False

        # Register connection
        register_socket_connection(request.sid, identity)

        # Send connection success with role info
        emit('connected', {
            'status': 'connected',
            'staff_id': identity.get('id'),
            'merchant_id': identity.get('merchant_id'),
            'branch_id': identity.get('branch_id'),
            'role': identity.get('role'),
            'message': 'Connected to real-time updates'
        })

        return True

    def on_disconnect(self):
        """Handle merchant staff disconnection."""
        unregister_socket_connection(request.sid)

    @socket_authenticated
    def on_ping(self):
        """Handle ping for keep-alive."""
        emit('pong', {'status': 'ok'})

    @socket_authenticated
    def on_subscribe_branch(self, data):
        """
        Subscribe to updates for a specific branch.
        Used by managers to monitor multiple branches.

        Args:
            data: {'branch_id': 'xxx'}
        """
        identity = get_socket_identity()
        branch_id = data.get('branch_id')

        if not branch_id:
            emit('error', {'message': 'branch_id is required'})
            return

        # Verify user has access to this branch
        from app.utils.role_access import validate_branch_access, get_merchant_user
        user = get_merchant_user(identity.get('id'))

        if not user or not validate_branch_access(user, branch_id):
            emit('error', {'message': 'Access denied to this branch'})
            return

        from flask_socketio import join_room
        room = f"branch_{branch_id}"
        join_room(room)

        emit('subscribed', {
            'type': 'branch',
            'id': branch_id
        })

        current_app.logger.info(
            f"Staff {identity.get('id')} subscribed to branch {branch_id}"
        )

    @socket_authenticated
    def on_unsubscribe_branch(self, data):
        """
        Unsubscribe from branch updates.

        Args:
            data: {'branch_id': 'xxx'}
        """
        branch_id = data.get('branch_id')

        if branch_id:
            from flask_socketio import leave_room
            room = f"branch_{branch_id}"
            leave_room(room)

            emit('unsubscribed', {
                'type': 'branch',
                'id': branch_id
            })

    @socket_authenticated
    def on_subscribe_transaction(self, data):
        """
        Subscribe to updates for a specific transaction.

        Args:
            data: {'transaction_id': 'xxx'}
        """
        identity = get_socket_identity()
        transaction_id = data.get('transaction_id')

        if transaction_id:
            from flask_socketio import join_room
            room = f"transaction_{transaction_id}"
            join_room(room)

            emit('subscribed', {
                'type': 'transaction',
                'id': transaction_id
            })

    @socket_authenticated
    def on_get_status(self):
        """Get current connection status."""
        identity = get_socket_identity()
        emit('status', {
            'connected': True,
            'staff_id': identity.get('id'),
            'merchant_id': identity.get('merchant_id'),
            'branch_id': identity.get('branch_id'),
            'role': identity.get('role'),
            'type': 'merchant_user'
        })
