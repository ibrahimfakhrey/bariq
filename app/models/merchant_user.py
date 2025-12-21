"""
Merchant User Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid
import bcrypt


class MerchantUser(db.Model, TimestampMixin):
    """Merchant User model - Staff members"""

    __tablename__ = 'merchant_users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=False, index=True)
    branch_id = db.Column(db.String(36), db.ForeignKey('branches.id'), nullable=True, index=True)
    region_id = db.Column(db.String(36), db.ForeignKey('regions.id'), nullable=True)

    # Auth
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Personal Info
    full_name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    national_id = db.Column(db.String(10), nullable=True)

    # Role
    role = db.Column(db.String(30), nullable=False, index=True)
    # owner, general_manager, region_manager, branch_manager, cashier

    # Permissions (JSON array)
    permissions = db.Column(db.JSON, default=[], nullable=True)

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    merchant = db.relationship('Merchant', back_populates='users')
    branch = db.relationship('Branch', back_populates='users')
    region = db.relationship('Region', back_populates='users')

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        """Check password against hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'merchant_id': self.merchant_id,
            'branch_id': self.branch_id,
            'region_id': self.region_id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'permissions': self.permissions or [],
            'is_active': self.is_active,
        }
