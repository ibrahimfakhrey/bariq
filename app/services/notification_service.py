"""
Notification Service - Placeholder
"""


class NotificationService:
    """Notification service - to be implemented"""

    @staticmethod
    def get_customer_notifications(customer_id, unread_only=False, page=1):
        return {'success': True, 'data': {'notifications': [], 'unread_count': 0}}

    @staticmethod
    def mark_as_read(customer_id, notification_id):
        return {'success': True, 'message': 'Marked as read'}
