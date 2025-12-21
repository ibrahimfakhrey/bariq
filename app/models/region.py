"""
Region Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class Region(db.Model, TimestampMixin):
    """Region model - Geographical grouping of branches"""

    __tablename__ = 'regions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=False, index=True)

    name_ar = db.Column(db.String(100), nullable=False)
    name_en = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    area_description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    merchant = db.relationship('Merchant', back_populates='regions')
    branches = db.relationship('Branch', back_populates='region', lazy='dynamic')
    users = db.relationship('MerchantUser', back_populates='region', lazy='dynamic')

    __table_args__ = (
        db.UniqueConstraint('merchant_id', 'name_ar', name='uq_region_merchant_name'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'merchant_id': self.merchant_id,
            'name_ar': self.name_ar,
            'name_en': self.name_en,
            'city': self.city,
            'is_active': self.is_active,
        }
