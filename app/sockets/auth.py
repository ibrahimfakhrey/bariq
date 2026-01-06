"""
Socket Authentication - JWT verification for WebSocket connections
"""
import json
from functools import wraps
from flask import request, current_app
from flask_socketio import disconnect, join_room, leave_room
from flask_jwt_extended import decode_token


# Store connected users and their rooms
connected_users = {}


def verify_socket_token(token):
    """
    Verify JWT token from socket connection.

    Args:
        token: JWT token string (with or without 'Bearer ' prefix)

    Returns:
        dict: User identity if valid, None otherwise
    """
    if not token:
        return None

    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]

        # Decode token
        decoded = decode_token(token)
        identity = decoded.get('sub')

        # Parse JSON identity back to dict (our app stores identity as JSON string)
        if isinstance(identity, str):
            return json.loads(identity)
        return identity
    except Exception as e:
        current_app.logger.error(f"Socket token verification failed: {str(e)}")
        return None


def get_user_rooms(identity):
    """
    Get the rooms a user should join based on their identity type.

    Args:
        identity: User identity dict

    Returns:
        list: Room names to join
    """
    rooms = []
    user_type = identity.get('type')

    if user_type == 'customer':
        # Customer joins their personal room
        rooms.append(f"customer_{identity.get('id')}")

    elif user_type == 'merchant_user':
        # Merchant staff joins multiple rooms based on role
        rooms.append(f"merchant_{identity.get('merchant_id')}")

        if identity.get('branch_id'):
            rooms.append(f"branch_{identity.get('branch_id')}")

        if identity.get('region_id'):
            rooms.append(f"region_{identity.get('region_id')}")

        # Staff personal room for direct notifications
        rooms.append(f"staff_{identity.get('id')}")

    elif user_type == 'admin_user':
        # Admin joins admin room
        rooms.append('admin_room')
        rooms.append(f"admin_{identity.get('id')}")

    return rooms


def socket_authenticated(f):
    """
    Decorator to ensure socket event handler has authenticated user.

    Usage:
        @socketio.on('some_event')
        @socket_authenticated
        def handle_event(data):
            identity = get_socket_identity()
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        sid = request.sid
        if sid not in connected_users:
            disconnect()
            return
        return f(*args, **kwargs)
    return decorated


def get_socket_identity():
    """
    Get the identity of the currently connected socket user.

    Returns:
        dict: User identity or None
    """
    sid = request.sid
    return connected_users.get(sid, {}).get('identity')


def register_socket_connection(sid, identity):
    """
    Register a new socket connection.

    Args:
        sid: Socket session ID
        identity: User identity dict
    """
    rooms = get_user_rooms(identity)

    connected_users[sid] = {
        'identity': identity,
        'rooms': rooms
    }

    # Join all rooms
    for room in rooms:
        join_room(room)

    current_app.logger.info(
        f"Socket connected: {identity.get('type')} {identity.get('id')} - Rooms: {rooms}"
    )


def unregister_socket_connection(sid):
    """
    Unregister a socket connection.

    Args:
        sid: Socket session ID
    """
    user_data = connected_users.pop(sid, None)

    if user_data:
        # Leave all rooms
        for room in user_data.get('rooms', []):
            leave_room(room)

        identity = user_data.get('identity', {})
        current_app.logger.info(
            f"Socket disconnected: {identity.get('type')} {identity.get('id')}"
        )


def get_connected_count():
    """Get the number of connected users."""
    return len(connected_users)


def get_connected_users_by_type(user_type):
    """
    Get connected users filtered by type.

    Args:
        user_type: 'customer', 'merchant_user', or 'admin_user'

    Returns:
        list: List of connected user identities
    """
    return [
        data['identity'] for data in connected_users.values()
        if data['identity'].get('type') == user_type
    ]
