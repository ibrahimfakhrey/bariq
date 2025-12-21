"""
System Setting Model
"""
from app.extensions import db
from datetime import datetime
import uuid


class SystemSetting(db.Model):
    """System Setting model"""

    __tablename__ = 'system_settings'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.JSON, nullable=False)
    description = db.Column(db.Text, nullable=True)
    editable_by = db.Column(db.String(20), default='super_admin', nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(36), db.ForeignKey('admin_users.id'), nullable=True)

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'description': self.description,
        }
