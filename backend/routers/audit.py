from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps, config
from datetime import datetime
import csv
import io

router = APIRouter()


@router.get("/", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    process_id: int = None,
    action_type: str = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get audit logs.
    ADMINISTRATIVO sees all logs.
    ABOGADO sees logs for their processes.
    CLIENTE sees logs for their processes (limited info).
    """
    query = db.query(models.AuditLog)
    
    if process_id:
        process = db.query(models.Process).filter(models.Process.id == process_id).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        # Check authorization
        if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        query = query.filter(models.AuditLog.process_id == process_id)
    else:
        if current_user.role == "CLIENTE":
            query = query.filter(models.AuditLog.process_id.isnot(None)).join(
                models.Process, models.AuditLog.process_id == models.Process.id
            ).filter(models.Process.cliente_id == current_user.id)
        elif current_user.role == "ABOGADO":
            query = query.filter(models.AuditLog.process_id.isnot(None)).join(
                models.Process, models.AuditLog.process_id == models.Process.id
            ).filter(models.Process.abogado_id == current_user.id)
        # ADMINISTRATIVO sees all
    
    if action_type:
        query = query.filter(models.AuditLog.action_type == action_type)
    
    return query.order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/process/{process_id}", response_model=List[schemas.AuditLogResponse])
def get_audit_logs_by_process(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get audit logs for a specific process with RBAC."""
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Check authorization
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    logs = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.process_id == process_id)
        .order_by(models.AuditLog.created_at.desc())
        .all()
    )
    return logs


@router.get("/export.csv")
def export_audit_logs(
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin)
):
    """
    Export audit logs as CSV. Only ADMINISTRATIVO can export.
    """
    logs = (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.created_at.desc())
        .all()
    )
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "User ID", "Process ID", "Action Type", "Description", "Metadata", "Created At"
    ])
    
    # Write rows
    for log in logs:
        writer.writerow([
            log.id,
            log.user_id,
            log.process_id or "N/A",
            log.action_type,
            log.description,
            log.metadata_json or "",
            log.created_at.isoformat()
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=audit_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}
    )


@router.get("/communications/process/{process_id}", response_model=List[schemas.CommunicationHistoryResponse])
def get_communications_by_process(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get communication history for a specific process with RBAC."""
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Check authorization
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    communications = (
        db.query(models.CommunicationHistory)
        .filter(models.CommunicationHistory.process_id == process_id)
        .order_by(models.CommunicationHistory.created_at.desc())
        .all()
    )
    return communications


@router.post("/communications", response_model=schemas.CommunicationHistoryResponse)
def create_communication(
    communication: schemas.CommunicationHistoryCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Create a communication record. ABOGADO can record communications to clients."""
    process = db.query(models.Process).filter(models.Process.id == communication.process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # ABOGADO can record communications for their processes
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # ADMINISTRATIVO can record communications
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot record communications")
    
    new_communication = models.CommunicationHistory(**communication.dict())
    db.add(new_communication)
    
    # Create audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        process_id=communication.process_id,
        action_type="create_communication",
        description=f"Comunicación registrada al {communication.audience} vía {communication.channel}"
    )
    db.add(audit)
    
    db.commit()
    db.refresh(new_communication)
    
    # Send email notification if communication is to cliente
    if communication.audience == "cliente" and communication.channel == "email":
        try:
            email_service = config.get_email_service()
            cliente = db.query(models.User).filter(models.User.id == process.cliente_id).first()
            if cliente and email_service:
                html_body = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; color: #333;">
                        <div style="background-color: #141414; padding: 30px; border-radius: 8px; color: #FFFFFF;">
                            <h1 style="color: #84120C; margin-bottom: 10px; font-size: 24px;">💬 Comunicación de tu Abogado</h1>
                            <p style="color: #D9D9D9; margin-bottom: 20px;">Estimado/a <strong>{cliente.name}</strong>,</p>
                            
                            <!-- RADICADO -->
                            <div style="background-color: #84120C; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center;">
                                <p style="margin: 0; color: #FFFFFF; font-size: 11px;">RADICADO</p>
                                <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 18px; font-family: monospace; font-weight: bold;">{process.radicado}</p>
                            </div>
                            
                            <!-- MENSAJE DEL ABOGADO -->
                            <div style="background-color: #1C1C1C; padding: 25px; border-left: 4px solid #84120C; margin-bottom: 25px; border-radius: 4px;">
                                <h3 style="color: #84120C; margin-top: 0; margin-bottom: 15px;">Mensaje de {abogado.name if 'abogado' in locals() else 'tu Abogado'}:</h3>
                                <p style="line-height: 1.8; color: #FFFFFF; white-space: pre-wrap;">{new_communication.message}</p>
                            </div>
                            
                            <!-- CTA -->
                            <div style="text-align: center; margin-bottom: 25px;">
                                <a href="http://localhost:5173/dashboard" style="background-color: #84120C; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                                    Responder en Portal
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #3A3A3A; margin: 20px 0;">
                            <p style="font-size: 12px; color: #D9D9D9; text-align: center;">
                                <strong>Magic-Juris</strong> - Sistema de Seguimiento Judicial<br>
                                Powered by <strong>Hurtado Gandini</strong>
                            </p>
                        </div>
                    </body>
                </html>
                """
                
                text_body = f"""
╔════════════════════════════════════════════╗
║   COMUNICACIÓN DE TU ABOGADO               ║
╚════════════════════════════════════════════╝

Estimado/a {cliente.name},

Tu abogado ha enviado un mensaje importante sobre tu caso.

═══ RADICADO ═══
{process.radicado}

═══ MENSAJE ═══
{new_communication.message}

═══ RESPONDER ═══
Ingresa al portal para enviar una respuesta:
http://localhost:5173/dashboard

────────────────────────────────────────────
Magic-Juris - Sistema de Seguimiento Judicial
Powered by Hurtado Gandini
                """
                
                success = email_service.send_email(
                    to_email=cliente.email,
                    subject=f"Comunicación de tu Abogado - Caso {process.radicado}",
                    html_body=html_body,
                    text_body=text_body
                )
                
                # Log email
                email_log = models.EmailLog(
                    to_email=cliente.email,
                    to_name=cliente.name,
                    subject=f"Comunicación de tu Abogado - Caso {process.radicado}",
                    email_type="communication",
                    process_id=process.id,
                    sent_successfully=success,
                    error_message=None if success else "Email send attempt made"
                )
                db.add(email_log)
                db.commit()
                
                print(f"📧 Communication email sent to {cliente.email} for process {process.id}")
        except Exception as e:
            print(f"⚠️  Failed to send communication email to {cliente.email}: {str(e)}")
            try:
                email_log = models.EmailLog(
                    to_email=cliente.email,
                    to_name=cliente.name if cliente else "Unknown",
                    subject=f"Comunicación de tu Abogado - Caso {process.radicado}",
                    email_type="communication",
                    process_id=process.id,
                    sent_successfully=False,
                    error_message=str(e)
                )
                db.add(email_log)
                db.commit()
            except:
                pass
    
    return new_communication


@router.get("/emails/sent", response_model=List[schemas.EmailLogResponse])
def get_sent_emails(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get sent emails. Only ADMINISTRATIVO can see all emails."""
    if current_user.role != "ADMINISTRATIVO":
        raise HTTPException(status_code=403, detail="Only ADMINISTRATIVO can view all sent emails")
    
    emails = (
        db.query(models.EmailLog)
        .order_by(models.EmailLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return emails


@router.get("/emails/process/{process_id}", response_model=List[schemas.EmailLogResponse])
def get_process_emails(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get emails for a specific process. ABOGADO and ADMINISTRATIVO can access."""
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Check authorization
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot view email logs")
    
    emails = (
        db.query(models.EmailLog)
        .filter(models.EmailLog.process_id == process_id)
        .order_by(models.EmailLog.created_at.desc())
        .all()
    )
    return emails


@router.get("/emails/to-me", response_model=List[schemas.EmailLogResponse])
def get_my_emails(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get emails sent to current user."""
    emails = (
        db.query(models.EmailLog)
        .filter(models.EmailLog.to_email == current_user.email)
        .order_by(models.EmailLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return emails
