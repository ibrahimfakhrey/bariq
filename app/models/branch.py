"""
Branch Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class Branch(db.Model, TimestampMixin):
    """Branch model - Physical store locations"""

    __tablename__ = 'branches'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=False, index=True)
    region_id = db.Column(db.String(36), db.ForeignKey('regions.id'), nullable=True, index=True)

    # Branch Info
    name_ar = db.Column(db.String(100), nullable=False)
    name_en = db.Column(db.String(100), nullable=True)
    code = db.Column(db.String(20), nullable=True)

    # Location
    city = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=True)
    address_line = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Numeric(10, 8), nullable=True)
    longitude = db.Column(db.Numeric(11, 8), nullable=True)

    # Contact
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(255), nullable=True)

    # Operating Hours (JSON)
    operating_hours = db.Column(db.JSON, default={}, nullable=True)

    # Settlement Settings
    settlement_cycle = db.Column(db.String(20), default='weekly', nullable=False)

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    merchant = db.relationship('Merchant', back_populates='branches')
    region = db.relationship('Region', back_populates='branches')
    users = db.relationship('MerchantUser', back_populates='branch', lazy='dynamic')
    transactions = db.relationship('Transaction', back_populates='branch', lazy='dynamic')
    settlements = db.relationship('Settlement', back_populates='branch', lazy='dynamic')

    __table_args__ = (
        db.UniqueConstraint('merchant_id', 'code', name='uq_branch_merchant_code'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'merchant_id': self.merchant_id,
            'region_id': self.region_id,
            'name_ar': self.name_ar,
            'name_en': self.name_en,
            'code': self.code,
            'city': self.city,
            'district': self.district,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'is_active': self.is_active,
        }
