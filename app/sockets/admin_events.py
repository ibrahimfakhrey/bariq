"""
Admin Socket Events - Real-time updates for admin dashboard
"""
from flask import request, current_app
from flask_socketio import Namespace, emit
from app.sockets.auth import (
    verify_socket_token,
    register_socket_connection,
    unregister_socket_connection,
    socket_authenticated,
    get_socket_identity,
    get_connected_count,
    get_connected_users_by_type
)


class AdminNamespace(Namespace):
    """
    Admin namespace for real-time updates.

    Events emitted TO admins:
    - merchant_registered: New merchant registration pending approval
    - merchant_approved: Merchant approved
    - credit_request_new: New credit increase request
    - credit_request_processed: Credit request approved/rejected
    - settlement_pending: Settlement awaiting approval
    - settlement_approved: Settlement approved
    - settlement_transferred: Settlement transferred
    - overdue_alert: Transaction became overdue
    - system_stats: System statistics update
    - notification_new: New notification

    Events FROM admins:
    - ping: Keep-alive ping
    - get_system_stats: Request current system stats
    - broadcast: Broadcast message to all users (super_admin only)
    """

    def on_connect(self, auth=None):
        """Handle admin connection with JWT authentication."""
        token = None

        # Try to get token from auth dict
        if auth and isinstance(auth, dict):
            token = auth.get('token')

        # Fallback: try to get from query string
        if not token:
            token = request.args.get('token')

        if not token:
            current_app.logger.warning("Admin socket connection rejected: No token")
            return False

        identity = verify_socket_token(token)

        if not identity:
            current_app.logger.warning("Admin socket connection rejected: Invalid token")
            return False

        if identity.get('type') != 'admin_user':
            current_app.logger.warning(
                f"Admin socket connection rejected: Wrong user type {identity.get('type')}"
            )
            return False

        # Register connection
        register_socket_connection(request.sid, identity)

        # Send connection success with role info
        emit('connected', {
            'status': 'connected',
            'admin_id': identity.get('id'),
            'role': identity.get('role'),
            'message': 'Connected to admin real-time updates'
        })

        return True

    def on_disconnect(self):
        """Handle admin disconnection."""
        unregister_socket_connection(request.sid)

    @socket_authenticated
    def on_ping(self):
        """Handle ping for keep-alive."""
        emit('pong', {'status': 'ok'})

    @socket_authenticated
    def on_get_system_stats(self):
        """
        Get current system statistics.
        Returns connected user counts and basic stats.
        """
        identity = get_socket_identity()

        stats = {
            'connected_users': {
                'total': get_connected_count(),
                'customers': len(get_connected_users_by_type('customer')),
                'merchants': len(get_connected_users_by_type('merchant_user')),
                'admins': len(get_connected_users_by_type('admin_user'))
            }
        }

        emit('system_stats', stats)

    @socket_authenticated
    def on_subscribe_merchant(self, data):
        """
        Subscribe to updates for a specific merchant.
        Useful for monitoring specific merchant activity.

        Args:
            data: {'merchant_id': 'xxx'}
        """
        identity = get_socket_identity()
        merchant_id = data.get('merchant_id')

        if merchant_id:
            from flask_socketio import join_room
            room = f"merchant_{merchant_id}"
            join_room(room)

            emit('subscribed', {
                'type': 'merchant',
                'id': merchant_id
            })

            current_app.logger.info(
                f"Admin {identity.get('id')} subscribed to merchant {merchant_id}"
            )

    @socket_authenticated
    def on_unsubscribe_merchant(self, data):
        """
        Unsubscribe from merchant updates.

        Args:
            data: {'merchant_id': 'xxx'}
        """
        merchant_id = data.get('merchant_id')

        if merchant_id:
            from flask_socketio import leave_room
            room = f"merchant_{merchant_id}"
            leave_room(room)

            emit('unsubscribed', {
                'type': 'merchant',
                'id': merchant_id
            })

    @socket_authenticated
    def on_broadcast(self, data):
        """
        Broadcast message to all connected users.
        Only super_admin can use this.

        Args:
            data: {
                'target': 'all' | 'customers' | 'merchants' | 'admins',
                'event': 'event_name',
                'payload': {...}
            }
        """
        identity = get_socket_identity()

        # Only super_admin can broadcast
        if identity.get('role') != 'super_admin':
            emit('error', {'message': 'Only super_admin can broadcast'})
            return

        target = data.get('target', 'all')
        event = data.get('event', 'broadcast')
        payload = data.get('payload', {})

        from app.extensions import socketio

        if target == 'customers':
            # Broadcast to all customers
            socketio.emit(event, payload, namespace='/customer')
        elif target == 'merchants':
            # Broadcast to all merchants
            socketio.emit(event, payload, namespace='/merchant')
        elif target == 'admins':
            # Broadcast to all admins
            socketio.emit(event, payload, namespace='/admin')
        else:
            # Broadcast to all
            socketio.emit(event, payload, namespace='/customer')
            socketio.emit(event, payload, namespace='/merchant')
            socketio.emit(event, payload, namespace='/admin')

        emit('broadcast_sent', {
            'target': target,
            'event': event
        })

        current_app.logger.info(
            f"Admin {identity.get('id')} broadcasted {event} to {target}"
        )

    @socket_authenticated
    def on_get_status(self):
        """Get current connection status."""
        identity = get_socket_identity()
        emit('status', {
            'connected': True,
            'admin_id': identity.get('id'),
            'role': identity.get('role'),
            'type': 'admin_user'
        })
