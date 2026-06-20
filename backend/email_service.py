import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


class EmailService:
    def __init__(
        self,
        smtp_host: str,
        smtp_port: int,
        smtp_user: str,
        smtp_password: str,
        smtp_from: str,
        enabled: bool = False,
    ):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.smtp_from = smtp_from
        self.enabled = enabled

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: Optional[str] = None,
        text_body: Optional[str] = None,
    ) -> bool:
        if not self.enabled or not self.smtp_host or not self.smtp_from:
            print(f"[EMAIL_STUB] To: {to_email} | Subject: {subject}\n{text_body or html_body or ''}")
            return False

        # --- INTERCEPTOR DE PRUEBAS ---
        # Fuerza todos los correos hacia tu bandeja para evitar enviar emails a clientes falsos
        original_to = to_email
        to_email = "aponzavalenciajuanjo@gmail.com"
        subject = f"[PRUEBA p/{original_to}] {subject}"
        # ------------------------------

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.smtp_from
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        if html_body:
            msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            if self.smtp_user:
                server.login(self.smtp_user, self.smtp_password)
            server.sendmail(self.smtp_from, [to_email], msg.as_string())

        return True
