"""Add processing_locked_at field to payments for concurrent processing protection

Revision ID: 005_add_payment_lock
Revises: 004_add_devices
Create Date: 2026-01-04

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_payment_lock'
down_revision = '004_add_devices'
branch_labels = None
depends_on = None


def upgrade():
    # Add processing_locked_at column to payments table
    # This field is used to prevent concurrent processing of the same payment
    op.add_column('payments',
        sa.Column('processing_locked_at', sa.DateTime(), nullable=True)
    )


def downgrade():
    op.drop_column('payments', 'processing_locked_at')
