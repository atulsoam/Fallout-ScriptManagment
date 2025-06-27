import smtplib
from email.mime.text import MIMEText

def send_email_notification(to_email, subject, body):
    sender_email = "your-email@example.com"
    sender_password = "your-password"
    smtp_server = "smtp.example.com"
    smtp_port = 587  # Or 465 for SSL

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")
