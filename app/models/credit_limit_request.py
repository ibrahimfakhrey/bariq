"""
Credit Limit Request Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class CreditLimitRequest(db.Model, TimestampMixin):
    """Credit Limit Request model"""

    __tablename__ = 'credit_limit_requests'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False, index=True)

    current_limit = db.Column(db.Numeric(10, 2), nullable=False)
    requested_limit = db.Column(db.Numeric(10, 2), nullable=False)
    reason = db.Column(db.Text, nullable=True)

    # Decision
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    approved_limit = db.Column(db.Numeric(10, 2), nullable=True)
    decision_reason = db.Column(db.Text, nullable=True)
    decided_by = db.Column(db.String(36), db.ForeignKey('admin_users.id'), nullable=True)
    decided_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    customer = db.relationship('Customer', back_populates='credit_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'current_limit': float(self.current_limit),
            'requested_limit': float(self.requested_limit),
            'reason': self.reason,
            'status': self.status,
            'approved_limit': float(self.approved_limit) if self.approved_limit else None,
            'decision_reason': self.decision_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
