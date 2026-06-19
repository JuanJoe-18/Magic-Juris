"""
Global configuration and services for Magic-Juris.
This module holds singleton instances like email_service.
"""

email_service = None

def set_email_service(service):
    """Set the email service instance."""
    global email_service
    email_service = service

def get_email_service():
    """Get the email service instance."""
    return email_service
