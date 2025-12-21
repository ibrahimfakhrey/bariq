"""
Customer Rating Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class CustomerRating(db.Model, TimestampMixin):
    """Customer Rating model"""

    __tablename__ = 'customer_ratings'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=True)
    merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=True, index=True)
    branch_id = db.Column(db.String(36), db.ForeignKey('branches.id'), nullable=True, index=True)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False, index=True)

    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    # Relationships
    customer = db.relationship('Customer', back_populates='ratings')

    __table_args__ = (
        db.UniqueConstraint('customer_id', 'transaction_id', name='uq_rating_customer_transaction'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
