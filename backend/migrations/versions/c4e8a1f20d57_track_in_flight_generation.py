"""track in-flight generation on motions

Revision ID: c4e8a1f20d57
Revises: a3f1c9d40b21
Create Date: 2026-11-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4e8a1f20d57'
down_revision = 'a3f1c9d40b21'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('motions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('generation_id', sa.Uuid(), nullable=True))
        batch_op.add_column(sa.Column('generation_kind', sa.String(length=8), nullable=True))
        batch_op.add_column(sa.Column('generation_stage', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('generation_message_id', sa.Uuid(), nullable=True))
        batch_op.add_column(
            sa.Column('generation_heartbeat_at', sa.DateTime(timezone=True), nullable=True)
        )
        batch_op.add_column(sa.Column('generation_error', sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table('motions', schema=None) as batch_op:
        batch_op.drop_column('generation_error')
        batch_op.drop_column('generation_heartbeat_at')
        batch_op.drop_column('generation_message_id')
        batch_op.drop_column('generation_stage')
        batch_op.drop_column('generation_kind')
        batch_op.drop_column('generation_id')
