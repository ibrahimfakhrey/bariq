"""
Admin User Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid
import bcrypt


class AdminUser(db.Model, TimestampMixin):
    """Admin User model - System administrators"""

    __tablename__ = 'admin_users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Auth
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Personal Info
    full_name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)

    # Role
    role = db.Column(db.String(30), nullable=False)
    # super_admin, accountant, sales, support, collections

    # Department
    department = db.Column(db.String(50), nullable=True)

    # Permissions (JSON array)
    permissions = db.Column(db.JSON, default=[], nullable=True)

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)

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
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'department': self.department,
            'permissions': self.permissions or [],
            'is_active': self.is_active,
        }
