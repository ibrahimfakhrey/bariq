"""
Transaction Return Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class TransactionReturn(db.Model, TimestampMixin):
    """Transaction Return model"""

    __tablename__ = 'transaction_returns'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=False, index=True)

    # Return Info
    return_amount = db.Column(db.Numeric(10, 2), nullable=False)
    reason = db.Column(db.String(100), nullable=False)
    reason_details = db.Column(db.Text, nullable=True)
    returned_items = db.Column(db.JSON, default=[], nullable=True)

    # Processed By
    processed_by = db.Column(db.String(36), db.ForeignKey('merchant_users.id'), nullable=True)

    # Status
    status = db.Column(db.String(20), default='pending', nullable=False)
    processed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    transaction = db.relationship('Transaction', back_populates='returns')

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'return_amount': float(self.return_amount),
            'reason': self.reason,
            'reason_details': self.reason_details,
            'returned_items': self.returned_items or [],
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
