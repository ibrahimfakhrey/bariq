"""
Database Model Mixins
"""
from datetime import datetime
from sqlalchemy import Column, DateTime
from app.extensions import db
import uuid


class TimestampMixin:
    """Mixin that adds created_at and updated_at columns"""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class UUIDMixin:
    """Mixin that uses UUID as primary key"""

    @staticmethod
    def generate_uuid():
        return str(uuid.uuid4())


def generate_reference(prefix, length=5):
    """Generate a reference number like BRQ-2024-00001"""
    from datetime import datetime
    import random
    import string

    year = datetime.now().year
    random_part = ''.join(random.choices(string.digits, k=length))
    return f"{prefix}-{year}-{random_part}"
