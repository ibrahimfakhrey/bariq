"""
Merchant Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class Merchant(db.Model, TimestampMixin):
    """Merchant model - Stores/businesses"""

    __tablename__ = 'merchants'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Business Info
    name_ar = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    commercial_registration = db.Column(db.String(50), unique=True, nullable=False, index=True)
    tax_number = db.Column(db.String(50), nullable=True)
    business_type = db.Column(db.String(50), nullable=True)

    # Contact Info
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    website = db.Column(db.String(255), nullable=True)

    # Address (HQ)
    city = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    address_line = db.Column(db.Text, nullable=True)

    # Bank Info
    bank_name = db.Column(db.String(100), nullable=True)
    iban = db.Column(db.String(34), nullable=True)
    account_holder_name = db.Column(db.String(200), nullable=True)

    # Commission Settings
    commission_rate = db.Column(db.Numeric(5, 2), default=2.50, nullable=False)

    # Contract Info
    contract_start_date = db.Column(db.Date, nullable=True)
    contract_end_date = db.Column(db.Date, nullable=True)

    # Status
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    status_reason = db.Column(db.Text, nullable=True)
    approved_by = db.Column(db.String(36), db.ForeignKey('admin_users.id'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)

    # Plan
    plan_type = db.Column(db.String(20), default='basic', nullable=False)

    # Relationships
    regions = db.relationship('Region', back_populates='merchant', lazy='dynamic')
    branches = db.relationship('Branch', back_populates='merchant', lazy='dynamic')
    users = db.relationship('MerchantUser', back_populates='merchant', lazy='dynamic')
    transactions = db.relationship('Transaction', back_populates='merchant', lazy='dynamic')
    settlements = db.relationship('Settlement', back_populates='merchant', lazy='dynamic')

    def __repr__(self):
        return f'<Merchant {self.name_ar}>'

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name_ar': self.name_ar,
            'name_en': self.name_en,
            'commercial_registration': self.commercial_registration,
            'tax_number': self.tax_number,
            'business_type': self.business_type,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'city': self.city,
            'district': self.district,
            'address_line': self.address_line,
            'bank_name': self.bank_name,
            'iban': self.iban,
            'account_holder_name': self.account_holder_name,
            'status': self.status,
            'commission_rate': float(self.commission_rate) if self.commission_rate else 2.5,
            'plan_type': self.plan_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
