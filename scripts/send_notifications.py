#!/usr/bin/env python3
"""
Send notifications to all customers
Run: python3 scripts/send_notifications.py
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import Customer
from app.services.notification_service import NotificationService

def send_to_all_customers(title_ar, body_ar, title_en=None, body_en=None, notification_type='announcement'):
    """Send notification to all active customers"""
    app = create_app()
    with app.app_context():
        customers = Customer.query.filter_by(status='active').all()

        print(f"Found {len(customers)} active customers")
        print("-" * 40)

        success_count = 0
        fail_count = 0

        for customer in customers:
            result = NotificationService.create_notification(
                customer_id=customer.id,
                title_ar=title_ar,
                title_en=title_en or title_ar,
                body_ar=body_ar,
                body_en=body_en or body_ar,
                notification_type=notification_type
            )

            if result['success']:
                print(f"[OK] Sent to: {customer.full_name_ar} ({customer.bariq_id})")
                success_count += 1
            else:
                print(f"[FAIL] {customer.full_name_ar} - {result['message']}")
                fail_count += 1

        print("-" * 40)
        print(f"Done! Success: {success_count}, Failed: {fail_count}")


if __name__ == '__main__':
    # Default test notification
    send_to_all_customers(
        title_ar='إشعار تجريبي',
        title_en='Test Notification',
        body_ar='مرحباً! هذا إشعار تجريبي من نظام بريق اليسر',
        body_en='Hello! This is a test notification from Bariq Al-Yusr',
        notification_type='announcement'
    )
