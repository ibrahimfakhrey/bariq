"""
Socket.IO Event Handlers

This module registers all WebSocket namespaces for real-time communication.

Namespaces:
- /customer: Customer mobile app real-time updates
- /merchant: Merchant staff real-time updates
- /admin: Admin dashboard real-time updates
"""
from app.sockets.customer_events import CustomerNamespace
from app.sockets.merchant_events import MerchantNamespace
from app.sockets.admin_events import AdminNamespace


def register_sockets(socketio):
    """
    Register all socket namespaces with the SocketIO instance.

    Args:
        socketio: Flask-SocketIO instance
    """
    # Register namespaces
    socketio.on_namespace(CustomerNamespace('/customer'))
    socketio.on_namespace(MerchantNamespace('/merchant'))
    socketio.on_namespace(AdminNamespace('/admin'))

    # Register default namespace error handler
    @socketio.on_error_default
    def default_error_handler(e):
        from flask import current_app
        current_app.logger.error(f"SocketIO error: {str(e)}")
