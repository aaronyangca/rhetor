"""add openrouter provider key

Revision ID: a3f1c9d40b21
Revises: 7bfd0249f284
Create Date: 2026-09-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a3f1c9d40b21'
down_revision = '7bfd0249f284'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('encrypted_openrouter_key', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('openrouter_key_masked', sa.String(length=32), nullable=True))

    # Widen the allowed providers. Alembic does not autogenerate CHECK
    # constraint changes, so this half is written by hand.
    op.drop_constraint('ck_motions_provider', 'motions', type_='check')
    op.create_check_constraint(
        'ck_motions_provider',
        'motions',
        "provider IN ('openai','anthropic','gemini','openrouter')",
    )


def downgrade():
    # OpenRouter motions would violate the narrowed constraint, so clear them
    # first — rolling this back means the provider is no longer supported.
    op.execute("DELETE FROM motions WHERE provider = 'openrouter'")
    op.drop_constraint('ck_motions_provider', 'motions', type_='check')
    op.create_check_constraint(
        'ck_motions_provider', 'motions', "provider IN ('openai','anthropic','gemini')"
    )

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('openrouter_key_masked')
        batch_op.drop_column('encrypted_openrouter_key')
