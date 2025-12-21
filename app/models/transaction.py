"""
Transaction Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin, generate_reference
from datetime import datetime, timedelta
import uuid


class Transaction(db.Model, TimestampMixin):
    """Transaction model - Purchase records"""

    __tablename__ = 'transactions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_number = db.Column(db.String(20), unique=True, nullable=False, index=True)

    # Parties
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False, index=True)
    merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=False, index=True)
    branch_id = db.Column(db.String(36), db.ForeignKey('branches.id'), nullable=False, index=True)
    cashier_id = db.Column(db.String(36), db.ForeignKey('merchant_users.id'), nullable=True)

    # Amount
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(10, 2), default=0, nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    # Items (JSON array)
    items = db.Column(db.JSON, default=[], nullable=True)

    # Dates
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    due_date = db.Column(db.Date, nullable=False, index=True)

    # Status
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    # pending, confirmed, paid, overdue, cancelled, refunded

    # Payment Info
    paid_amount = db.Column(db.Numeric(10, 2), default=0, nullable=False)
    paid_at = db.Column(db.DateTime, nullable=True)

    # Return Info
    returned_amount = db.Column(db.Numeric(10, 2), default=0, nullable=False)

    # Settlement
    settlement_id = db.Column(db.String(36), db.ForeignKey('settlements.id'), nullable=True)

    # Notes
    notes = db.Column(db.Text, nullable=True)
    cancellation_reason = db.Column(db.Text, nullable=True)

    # Relationships
    customer = db.relationship('Customer', back_populates='transactions')
    merchant = db.relationship('Merchant', back_populates='transactions')
    branch = db.relationship('Branch', back_populates='transactions')
    cashier = db.relationship('MerchantUser', foreign_keys=[cashier_id])
    settlement = db.relationship('Settlement', back_populates='transactions')
    returns = db.relationship('TransactionReturn', back_populates='transaction', lazy='dynamic')
    payments = db.relationship('Payment', back_populates='transaction', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.reference_number:
            self.reference_number = generate_reference('BRQ')
        if not self.due_date:
            self.due_date = (datetime.utcnow() + timedelta(days=10)).date()

    @property
    def remaining_amount(self):
        """Calculate remaining amount to pay"""
        return float(self.total_amount) - float(self.paid_amount) - float(self.returned_amount)

    @property
    def is_overdue(self):
        """Check if transaction is overdue"""
        if self.status in ['paid', 'cancelled', 'refunded']:
            return False
        return datetime.utcnow().date() > self.due_date

    def to_dict(self):
        return {
            'id': self.id,
            'reference_number': self.reference_number,
            'customer_id': self.customer_id,
            'merchant_id': self.merchant_id,
            'branch_id': self.branch_id,
            'subtotal': float(self.subtotal),
            'discount': float(self.discount),
            'total_amount': float(self.total_amount),
            'items': self.items or [],
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'paid_amount': float(self.paid_amount),
            'returned_amount': float(self.returned_amount),
            'remaining_amount': self.remaining_amount,
            'is_overdue': self.is_overdue,
        }
