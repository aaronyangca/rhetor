"""Outgoing email, with a console fallback for local development.

With SMTP configured (SMTP_HOST and friends in .env), messages are sent over
SMTP with STARTTLS. Without it, nothing is sent: the message — including any
link in it — is written to the server log, which under `make dev` is the
terminal. That keeps flows like password reset fully testable locally with no
email account at all.
"""

from __future__ import annotations

import smtplib
from email.message import EmailMessage

from flask import current_app


class MailError(RuntimeError):
    pass


def send(to: str, subject: str, text: str) -> None:
    config = current_app.config
    if not config.get("SMTP_HOST"):
        current_app.logger.warning(
            "SMTP is not configured, so this email was NOT sent. It would have "
            "gone to %s:\n\nSubject: %s\n\n%s\n",
            to,
            subject,
            text,
        )
        return

    message = EmailMessage()
    message["From"] = config["MAIL_FROM"]
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)

    try:
        with smtplib.SMTP(config["SMTP_HOST"], config["SMTP_PORT"], timeout=15) as smtp:
            smtp.starttls()
            if config.get("SMTP_USERNAME"):
                smtp.login(config["SMTP_USERNAME"], config["SMTP_PASSWORD"])
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        raise MailError(str(exc)) from exc
