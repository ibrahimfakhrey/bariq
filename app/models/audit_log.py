"""
Audit Log Model
"""
from app.extensions import db
from datetime import datetime
import uuid


class AuditLog(db.Model):
    """Audit Log model - System activity tracking"""

    __tablename__ = 'audit_logs'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    actor_type = db.Column(db.String(20), nullable=False, index=True)
    actor_id = db.Column(db.String(36), nullable=True)
    actor_email = db.Column(db.String(255), nullable=True)
    actor_ip = db.Column(db.String(45), nullable=True)

    action = db.Column(db.String(100), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=True, index=True)
    entity_id = db.Column(db.String(36), nullable=True)

    old_values = db.Column(db.JSON, nullable=True)
    new_values = db.Column(db.JSON, nullable=True)
    extra_data = db.Column(db.JSON, default={}, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'actor_type': self.actor_type,
            'actor_id': self.actor_id,
            'actor_email': self.actor_email,
            'actor_name': self.actor_email or self.actor_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'old_values': self.old_values,
            'new_values': self.new_values,
            'details': self.extra_data,
            'ip_address': self.actor_ip,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
