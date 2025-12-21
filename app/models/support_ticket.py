"""
Support Ticket Models
"""
from app.extensions import db
from app.models.mixins import TimestampMixin, generate_reference
import uuid


class SupportTicket(db.Model, TimestampMixin):
    """Support Ticket model"""

    __tablename__ = 'support_tickets'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = db.Column(db.String(20), unique=True, nullable=False, index=True)

    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=True, index=True)
    merchant_user_id = db.Column(db.String(36), db.ForeignKey('merchant_users.id'), nullable=True)

    category = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)

    related_transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=True)

    priority = db.Column(db.String(20), default='medium', nullable=False)
    status = db.Column(db.String(20), default='open', nullable=False, index=True)

    assigned_to = db.Column(db.String(36), db.ForeignKey('admin_users.id'), nullable=True, index=True)

    resolution = db.Column(db.Text, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    messages = db.relationship('SupportTicketMessage', back_populates='ticket', lazy='dynamic')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.ticket_number:
            self.ticket_number = generate_reference('TKT')

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'category': self.category,
            'subject': self.subject,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SupportTicketMessage(db.Model, TimestampMixin):
    """Support Ticket Message model"""

    __tablename__ = 'support_ticket_messages'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = db.Column(db.String(36), db.ForeignKey('support_tickets.id'), nullable=False, index=True)

    sender_type = db.Column(db.String(20), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=True)
    merchant_user_id = db.Column(db.String(36), db.ForeignKey('merchant_users.id'), nullable=True)
    admin_user_id = db.Column(db.String(36), db.ForeignKey('admin_users.id'), nullable=True)

    message = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.JSON, default=[], nullable=True)

    # Relationships
    ticket = db.relationship('SupportTicket', back_populates='messages')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_type': self.sender_type,
            'message': self.message,
            'attachments': self.attachments or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
