"""
Promotion Model
"""
from app.extensions import db
from app.models.mixins import TimestampMixin
import uuid


class Promotion(db.Model, TimestampMixin):
    """Promotion/Banner model"""

    __tablename__ = 'promotions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    title_ar = db.Column(db.String(200), nullable=False)
    title_en = db.Column(db.String(200), nullable=True)
    description_ar = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)

    link_type = db.Column(db.String(30), nullable=True)
    link_merchant_id = db.Column(db.String(36), db.ForeignKey('merchants.id'), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)

    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    target_audience = db.Column(db.String(20), default='all', nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title_ar': self.title_ar,
            'title_en': self.title_en,
            'description_ar': self.description_ar,
            'description_en': self.description_en,
            'image_url': self.image_url,
            'link_type': self.link_type,
            'is_active': self.is_active,
        }
