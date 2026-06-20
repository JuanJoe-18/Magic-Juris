from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps

router = APIRouter()


@router.get("/", response_model=List[schemas.AlertResponse])
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    leida: bool = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get alerts for current user.
    ADMINISTRATIVO sees all alerts.
    ABOGADO sees alerts for their processes.
    CLIENTE sees alerts for their processes (limited info).
    """
    query = db.query(models.Alert)
    
    if current_user.role == "CLIENTE":
        # Clients see alerts for their processes only
        query = query.join(models.Process).filter(models.Process.cliente_id == current_user.id)
    elif current_user.role == "ABOGADO":
        # Lawyers see alerts for their assigned processes
        query = query.join(models.Process).filter(models.Process.abogado_id == current_user.id)
    # ADMINISTRATIVO sees all
    
    if leida is not None:
        query = query.filter(models.Alert.leida == leida)
    
    return query.order_by(models.Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/process/{process_id}", response_model=List[schemas.AlertResponse])
def get_alerts_by_process(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get alerts for a specific process with RBAC."""
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Check authorization
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    alerts = (
        db.query(models.Alert)
        .filter(models.Alert.process_id == process_id)
        .order_by(models.Alert.created_at.desc())
        .all()
    )
    return alerts


@router.patch("/{alert_id}/read", response_model=schemas.AlertResponse)
def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Mark an alert as read."""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Verify ownership (only the alert recipient can mark it as read)
    if alert.user_id != current_user.id and current_user.role != "ADMINISTRATIVO":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    alert.leida = True
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/unread/count")
def get_unread_alerts_count(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get count of unread alerts for current user."""
    query = db.query(models.Alert).filter(models.Alert.leida == False)
    
    if current_user.role == "CLIENTE":
        query = query.join(models.Process).filter(models.Process.cliente_id == current_user.id)
    elif current_user.role == "ABOGADO":
        query = query.join(models.Process).filter(models.Process.abogado_id == current_user.id)
    # ADMINISTRATIVO sees all
    
    count = query.count()
    return {"unread_count": count}

