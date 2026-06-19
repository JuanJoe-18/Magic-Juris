from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps
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
    return new_communication

