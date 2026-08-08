"""add gemini provider key

Revision ID: 2b7b9e771ce9
Revises: f99b0329ca31
Create Date: 2026-08-08 14:14:12.045649

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b7b9e771ce9'
down_revision = 'f99b0329ca31'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('encrypted_gemini_key', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('gemini_key_masked', sa.String(length=32), nullable=True))

    # Widen the allowed providers. Alembic does not autogenerate CHECK
    # constraint changes, so this half is written by hand.
    op.drop_constraint('ck_motions_provider', 'motions', type_='check')
    op.create_check_constraint(
        'ck_motions_provider', 'motions', "provider IN ('openai','anthropic','gemini')"
    )


def downgrade():
    # Gemini motions would violate the narrowed constraint, so clear them
    # first — rolling this back means the provider is no longer supported.
    op.execute("DELETE FROM motions WHERE provider = 'gemini'")
    op.drop_constraint('ck_motions_provider', 'motions', type_='check')
    op.create_check_constraint(
        'ck_motions_provider', 'motions', "provider IN ('openai','anthropic')"
    )

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('gemini_key_masked')
        batch_op.drop_column('encrypted_gemini_key')
