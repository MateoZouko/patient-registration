"""
Notification dispatcher.

Architecture note
-----------------
The client has indicated that SMS notifications will be required within the
next development cycle. This module is designed to support multiple channels
from the start. Adding SMS requires only:

  1. Implement SmsChannel._deliver() using any SMS provider SDK.
  2. Set SMS_ENABLED=true in the environment.

No changes to routes or business logic are needed.
"""

import os
import smtplib
import threading
from abc import ABC, abstractmethod
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class NotificationChannel(ABC):
    @abstractmethod
    def _deliver(self, to: str, full_name: str) -> None: ...

    def send(self, to: str, full_name: str) -> None:
        try:
            self._deliver(to, full_name)
        except Exception as exc:
            print(f"[notifier] {self.__class__.__name__} failed for {to}: {exc}")


class EmailChannel(NotificationChannel):
    def _deliver(self, to: str, full_name: str) -> None:
        host = os.environ.get("MAIL_HOST", "sandbox.smtp.mailtrap.io")
        port = int(os.environ.get("MAIL_PORT", 2525))
        username = os.environ.get("MAIL_USERNAME", "")
        password = os.environ.get("MAIL_PASSWORD", "")
        from_addr = os.environ.get("MAIL_FROM", "noreply@patients.dev")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Patient Registration Confirmed"
        msg["From"] = from_addr
        msg["To"] = to

        text = (
            f"Hello {full_name},\n\n"
            "Your registration has been successfully completed.\n\n"
            "Thank you for registering."
        )
        html = f"""
        <html><body>
          <h2>Registration Confirmed</h2>
          <p>Hello <strong>{full_name}</strong>,</p>
          <p>Your registration has been successfully completed.</p>
          <p>Thank you for registering.</p>
        </body></html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(host, port, timeout=10) as server:
            server.login(username, password)
            server.sendmail(from_addr, [to], msg.as_string())


class SmsChannel(NotificationChannel):
    """
    SMS notification channel — stub ready for integration.

    To activate:
      - Set SMS_ENABLED=true in the environment.
      - Install your SMS provider SDK (e.g. twilio) and implement _deliver().

    Example with Twilio:
        from twilio.rest import Client
        client = Client(os.environ["TWILIO_SID"], os.environ["TWILIO_TOKEN"])
        client.messages.create(
            body=f"Hello {full_name}, your registration is confirmed.",
            from_=os.environ["TWILIO_FROM"],
            to=to,
        )
    """

    def _deliver(self, to: str, full_name: str) -> None:
        raise NotImplementedError("SMS provider not configured.")


def _active_channels() -> list[NotificationChannel]:
    channels: list[NotificationChannel] = [EmailChannel()]
    if os.environ.get("SMS_ENABLED", "").lower() == "true":
        channels.append(SmsChannel())
    return channels


def send_confirmation_async(to: str, full_name: str) -> None:
    channels = _active_channels()

    def _run() -> None:
        for channel in channels:
            channel.send(to, full_name)

    threading.Thread(target=_run, daemon=True).start()
