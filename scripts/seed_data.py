"""
Seed Data Script - Initialize database with sample data
"""
from datetime import datetime, timedelta
from app.extensions import db
from app.models.admin_user import AdminUser
from app.models.customer import Customer
from app.models.merchant import Merchant
from app.models.region import Region
from app.models.branch import Branch
from app.models.merchant_user import MerchantUser
from app.models.system_setting import SystemSetting


def seed_admin_users():
    """Create default admin users"""
    print("Seeding admin users...")

    # Check if admin already exists
    if AdminUser.query.filter_by(email='admin@bariq.sa').first():
        print("  Admin user already exists, skipping...")
        return

    admin = AdminUser(
        email='admin@bariq.sa',
        full_name='System Administrator',
        phone='0500000000',
        role='super_admin',
        department='IT',
        permissions=['all'],
        is_active=True
    )
    admin.set_password('Admin@123')

    db.session.add(admin)
    db.session.commit()
    print("  Created admin user: admin@bariq.sa / Admin@123")


def seed_system_settings():
    """Create default system settings"""
    print("Seeding system settings...")

    settings = [
        {
            'key': 'default_credit_limit',
            'value': {'amount': 500, 'currency': 'SAR'},
            'description': 'Default credit limit for new customers',
            'editable_by': 'super_admin'
        },
        {
            'key': 'max_credit_limit',
            'value': {'amount': 5000, 'currency': 'SAR'},
            'description': 'Maximum allowed credit limit',
            'editable_by': 'super_admin'
        },
        {
            'key': 'repayment_days',
            'value': {'days': 10},
            'description': 'Number of days to repay',
            'editable_by': 'super_admin'
        },
        {
            'key': 'default_commission_rate',
            'value': {'rate': 2.5},
            'description': 'Default merchant commission rate (%)',
            'editable_by': 'super_admin'
        },
        {
            'key': 'min_transaction_amount',
            'value': {'amount': 10, 'currency': 'SAR'},
            'description': 'Minimum transaction amount',
            'editable_by': 'super_admin'
        },
        {
            'key': 'max_transaction_amount',
            'value': {'amount': 2000, 'currency': 'SAR'},
            'description': 'Maximum transaction amount',
            'editable_by': 'super_admin'
        },
        {
            'key': 'payment_reminder_days',
            'value': {'days': [3, 1, 0]},
            'description': 'Days before due date to send reminders',
            'editable_by': 'admin'
        }
    ]

    for setting_data in settings:
        if not SystemSetting.query.filter_by(key=setting_data['key']).first():
            setting = SystemSetting(**setting_data)
            db.session.add(setting)

    db.session.commit()
    print(f"  Created {len(settings)} system settings")


def seed_sample_customer():
    """Create a sample customer for testing"""
    print("Seeding sample customer...")

    if Customer.query.filter_by(national_id='1234567890').first():
        print("  Sample customer already exists, skipping...")
        return

    customer = Customer(
        national_id='1234567890',
        nafath_id='NAFATH123456',
        full_name_ar='أحمد محمد العلي',
        full_name_en='Ahmed Mohammed Al-Ali',
        email='customer@test.com',
        phone='0551234567',
        date_of_birth=datetime(1990, 5, 15).date(),
        gender='male',
        city='Riyadh',
        district='Al Olaya',
        address_line='Building 123, Street 456',
        status='active',
        credit_limit=1000,
        available_credit=1000,
        used_credit=0,
        language='ar',
        notifications_enabled=True,
        verified_at=datetime.utcnow()
    )

    db.session.add(customer)
    db.session.commit()
    print("  Created sample customer: 1234567890")


def seed_sample_merchant():
    """Create a sample merchant with branches for testing"""
    print("Seeding sample merchant...")

    if Merchant.query.filter_by(commercial_registration='1234567890').first():
        print("  Sample merchant already exists, skipping...")
        return

    # Create merchant
    merchant = Merchant(
        name_ar='سوبرماركت البركة',
        name_en='Al Baraka Supermarket',
        commercial_registration='1234567890',
        tax_number='300012345678901',
        business_type='supermarket',
        email='merchant@test.com',
        phone='0112345678',
        website='https://albaraka.sa',
        city='Riyadh',
        district='Al Malaz',
        address_line='King Fahd Road, Building 100',
        bank_name='Al Rajhi Bank',
        iban='SA0380000000608010167519',
        account_holder_name='Al Baraka Trading Est.',
        commission_rate=2.50,
        status='active',
        plan_type='basic',
        approved_at=datetime.utcnow()
    )

    db.session.add(merchant)
    db.session.flush()

    # Create region
    region = Region(
        merchant_id=merchant.id,
        name_ar='منطقة الرياض',
        name_en='Riyadh Region',
        city='Riyadh',
        is_active=True
    )

    db.session.add(region)
    db.session.flush()

    # Create branches
    branches_data = [
        {
            'name_ar': 'فرع العليا',
            'name_en': 'Olaya Branch',
            'code': 'RYD001',
            'city': 'Riyadh',
            'district': 'Al Olaya',
            'address_line': 'Olaya Street, Building 50',
            'phone': '0112345001',
            'latitude': 24.7136,
            'longitude': 46.6753
        },
        {
            'name_ar': 'فرع الملز',
            'name_en': 'Malaz Branch',
            'code': 'RYD002',
            'city': 'Riyadh',
            'district': 'Al Malaz',
            'address_line': 'King Fahd Road, Building 75',
            'phone': '0112345002',
            'latitude': 24.6748,
            'longitude': 46.7148
        }
    ]

    for branch_data in branches_data:
        branch = Branch(
            merchant_id=merchant.id,
            region_id=region.id,
            settlement_cycle='weekly',
            is_active=True,
            **branch_data
        )
        db.session.add(branch)

    db.session.flush()

    # Get first branch for owner
    first_branch = Branch.query.filter_by(merchant_id=merchant.id).first()

    # Create merchant owner
    owner = MerchantUser(
        merchant_id=merchant.id,
        branch_id=first_branch.id,
        email='owner@albaraka.sa',
        full_name='Mohammed Al-Baraka',
        phone='0551234567',
        role='owner',
        permissions=['all'],
        is_active=True
    )
    owner.set_password('Owner@123')

    # Create cashier
    cashier = MerchantUser(
        merchant_id=merchant.id,
        branch_id=first_branch.id,
        email='cashier@albaraka.sa',
        full_name='Ali Hassan',
        phone='0559876543',
        role='cashier',
        permissions=['create_transaction', 'view_transactions'],
        is_active=True
    )
    cashier.set_password('Cashier@123')

    db.session.add(owner)
    db.session.add(cashier)
    db.session.commit()

    print("  Created sample merchant: Al Baraka Supermarket")
    print("    Owner: owner@albaraka.sa / Owner@123")
    print("    Cashier: cashier@albaraka.sa / Cashier@123")


def seed_all():
    """Run all seed functions"""
    print("\n" + "=" * 50)
    print("Starting database seeding...")
    print("=" * 50 + "\n")

    seed_admin_users()
    seed_system_settings()
    seed_sample_customer()
    seed_sample_merchant()

    print("\n" + "=" * 50)
    print("Database seeding completed!")
    print("=" * 50)
    print("\nTest Accounts:")
    print("-" * 50)
    print("Admin:    admin@bariq.sa / Admin@123")
    print("Customer: 1234567890 (National ID)")
    print("Merchant Owner: owner@albaraka.sa / Owner@123")
    print("Merchant Cashier: cashier@albaraka.sa / Cashier@123")
    print("-" * 50 + "\n")


if __name__ == '__main__':
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_all()
