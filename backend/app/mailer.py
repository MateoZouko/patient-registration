import os
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _send(to_email: str, full_name: str) -> None:
    host = os.environ.get("MAIL_HOST", "sandbox.smtp.mailtrap.io")
    port = int(os.environ.get("MAIL_PORT", 2525))
    username = os.environ.get("MAIL_USERNAME", "")
    password = os.environ.get("MAIL_PASSWORD", "")
    from_addr = os.environ.get("MAIL_FROM", "noreply@patients.dev")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Patient Registration Confirmed"
    msg["From"] = from_addr
    msg["To"] = to_email

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

    try:
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.login(username, password)
            server.sendmail(from_addr, [to_email], msg.as_string())
    except Exception as exc:
        print(f"[mailer] Failed to send email to {to_email}: {exc}")


def send_confirmation_async(to_email: str, full_name: str) -> None:
    thread = threading.Thread(target=_send, args=(to_email, full_name), daemon=True)
    thread.start()
