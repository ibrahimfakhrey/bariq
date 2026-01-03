#!/usr/bin/env python3
"""
Send notifications to all customers with DEBUG info
Run: python3 scripts/send_notifications.py
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import Customer
from app.models.device import CustomerDevice
from app.services.notification_service import NotificationService
from app.services.firebase_service import FirebaseService, push_manager

def send_to_all_customers(title_ar, body_ar, title_en=None, body_en=None, notification_type='announcement'):
    """Send notification to all active customers with debug info"""
    app = create_app()
    with app.app_context():

        # DEBUG: Check Firebase initialization
        print("=" * 50)
        print("DEBUG: Firebase Status")
        print("=" * 50)
        firebase_ok = FirebaseService.initialize()
        print(f"Firebase initialized: {firebase_ok}")
        print()

        # Get customers
        customers = Customer.query.filter_by(status='active').all()
        print(f"Found {len(customers)} active customers")
        print("-" * 50)

        for customer in customers:
            print()
            print(f"Customer: {customer.full_name_ar} ({customer.bariq_id})")
            print(f"Customer ID: {customer.id}")

            # DEBUG: Check registered devices
            devices = CustomerDevice.query.filter_by(
                customer_id=customer.id,
                is_active=True
            ).all()

            print(f"Registered devices: {len(devices)}")

            for device in devices:
                print(f"  - Device: {device.device_name} ({device.device_type})")
                print(f"    FCM Token: {device.fcm_token[:50]}..." if len(device.fcm_token) > 50 else f"    FCM Token: {device.fcm_token}")
                print(f"    Is Active: {device.is_active}")

            if not devices:
                print("  [WARNING] No devices registered - push will not be sent!")

            # Send notification with push
            print()
            print("Sending notification...")

            result = push_manager.send_to_customer(
                customer_id=customer.id,
                title_ar=title_ar,
                title_en=title_en or title_ar,
                body_ar=body_ar,
                body_en=body_en or body_ar,
                notification_type=notification_type
            )

            print(f"Result: {result}")
            print("-" * 50)

        print()
        print("=" * 50)
        print("DONE!")
        print("=" * 50)


if __name__ == '__main__':
    send_to_all_customers(
        title_ar='إشعار تجريبي',
        title_en='Test Notification',
        body_ar='مرحباً! هذا إشعار تجريبي من نظام بريق اليسر',
        body_en='Hello! This is a test notification from Bariq Al-Yusr',
        notification_type='announcement'
    )
