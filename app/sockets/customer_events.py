"""
Customer Socket Events - Real-time updates for customer mobile app
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


class CustomerNamespace(Namespace):
    """
    Customer namespace for real-time updates.

    Events emitted TO customers:
    - transaction_created: New transaction pending confirmation
    - transaction_status_changed: Transaction status update
    - payment_initiated: Payment process started
    - payment_completed: Payment successful
    - payment_failed: Payment failed
    - notification_new: New notification
    - credit_updated: Credit limit or available credit changed

    Events FROM customers:
    - ping: Keep-alive ping
    - subscribe_transaction: Subscribe to specific transaction updates
    """

    def on_connect(self, auth=None):
        """Handle customer connection with JWT authentication."""
        token = None

        # Try to get token from auth dict
        if auth and isinstance(auth, dict):
            token = auth.get('token')

        # Fallback: try to get from query string
        if not token:
            token = request.args.get('token')

        if not token:
            current_app.logger.warning("Customer socket connection rejected: No token")
            return False

        identity = verify_socket_token(token)

        if not identity:
            current_app.logger.warning("Customer socket connection rejected: Invalid token")
            return False

        if identity.get('type') != 'customer':
            current_app.logger.warning(
                f"Customer socket connection rejected: Wrong user type {identity.get('type')}"
            )
            return False

        # Register connection
        register_socket_connection(request.sid, identity)

        # Send connection success
        emit('connected', {
            'status': 'connected',
            'customer_id': identity.get('id'),
            'message': 'Connected to real-time updates'
        })

        return True

    def on_disconnect(self):
        """Handle customer disconnection."""
        unregister_socket_connection(request.sid)

    @socket_authenticated
    def on_ping(self):
        """Handle ping for keep-alive."""
        emit('pong', {'status': 'ok'})

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

            current_app.logger.info(
                f"Customer {identity.get('id')} subscribed to transaction {transaction_id}"
            )

    @socket_authenticated
    def on_unsubscribe_transaction(self, data):
        """
        Unsubscribe from transaction updates.

        Args:
            data: {'transaction_id': 'xxx'}
        """
        identity = get_socket_identity()
        transaction_id = data.get('transaction_id')

        if transaction_id:
            from flask_socketio import leave_room
            room = f"transaction_{transaction_id}"
            leave_room(room)

            emit('unsubscribed', {
                'type': 'transaction',
                'id': transaction_id
            })

    @socket_authenticated
    def on_get_status(self):
        """Get current connection status."""
        identity = get_socket_identity()
        emit('status', {
            'connected': True,
            'customer_id': identity.get('id'),
            'type': 'customer'
        })
