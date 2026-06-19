from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps, actuation_service
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/", response_model=List[schemas.ProcessResponse])
def get_processes(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    query = db.query(models.Process)
    if current_user.role == "CLIENTE":
        query = query.filter(models.Process.cliente_id == current_user.id)
    elif current_user.role == "ABOGADO":
        query = query.filter(models.Process.abogado_id == current_user.id)
    return query.offset(skip).limit(limit).all()

@router.post("/sync-all")
def sync_all_processes(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Sync all processes with mock actuations.
    Only ADMINISTRATIVO can perform this action.
    """
    if current_user.role != "ADMINISTRATIVO":
        raise HTTPException(status_code=403, detail="Only ADMINISTRATIVO can sync all processes")
    
    processes_to_sync = db.query(models.Process).all()
    total_synced = 0
    
    for process in processes_to_sync:
        # Generate 1-2 actuations per process
        mock_actuations = [
            ("audiencia", "Audiencia de seguimiento"),
            ("notificación", "Notificación de resolución"),
            ("traslado", "Traslado para observaciones"),
            ("auto que ordena", "Auto que ordena práctica de pruebas"),
            ("sentencia", "Sentencia de segunda instancia"),
        ]
        
        num_actuations = random.randint(1, 2)
        
        for _ in range(num_actuations):
            tipo, anotacion = random.choice(mock_actuations)
            
            # Check for duplicates
            existing = (
                db.query(models.JudicialActuation)
                .filter(
                    models.JudicialActuation.process_id == process.id,
                    models.JudicialActuation.tipo == tipo
                )
                .first()
            )
            
            if existing:
                continue
            
            classification = actuation_service.classify_actuation(tipo, anotacion)
            
            actuation = models.JudicialActuation(
                process_id=process.id,
                fecha=datetime.utcnow() - timedelta(days=random.randint(1, 15)),
                tipo=tipo,
                anotacion=anotacion,
                clasificacion=classification["clasificacion"],
                urgencia=classification["urgencia"],
                fuente="MOCK",
                external_id=f"SYNC_ALL_{process.id}_{int(datetime.utcnow().timestamp())}"
            )
            db.add(actuation)
            db.flush()
            
            # Generate alert
            alert_config = actuation_service.get_alert_for_actuation(classification["clasificacion"])
            alert_message = alert_config["mensaje_template"].format(tipo=tipo)
            
            alert = models.Alert(
                process_id=process.id,
                user_id=process.abogado_id,
                tipo=alert_config["tipo"],
                nivel=alert_config["nivel"],
                mensaje=alert_message,
                canal=alert_config["canal"]
            )
            db.add(alert)
            
            # Audit log
            audit = models.AuditLog(
                user_id=current_user.id,
                process_id=process.id,
                action_type="sync_all_actuations",
                description=f"Sincronización global: actuación {tipo}"
            )
            db.add(audit)
            
            total_synced += 1
    
    db.commit()
    
    return {
        "message": "Sincronización global completada",
        "processes_synced": len(processes_to_sync),
        "actuations_created": total_synced
    }

@router.get("/{id}", response_model=schemas.ProcessResponse)
def get_process(id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    process = db.query(models.Process).filter(models.Process.id == id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this process")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this process")
    return process

@router.get("/radicado/{radicado}", response_model=schemas.ProcessResponse)
def get_process_by_radicado(radicado: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    process = db.query(models.Process).filter(models.Process.radicado == radicado).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this process")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this process")
    return process

@router.post("/", response_model=schemas.ProcessResponse)
def create_process(process: schemas.ProcessCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot create processes")
    
    # Validar cliente y abogado
    cliente = db.query(models.User).filter(models.User.id == process.cliente_id).first()
    if not cliente or cliente.role != "CLIENTE":
        raise HTTPException(status_code=400, detail="Invalid cliente_id")
    
    abogado = db.query(models.User).filter(models.User.id == process.abogado_id).first()
    if not abogado or abogado.role != "ABOGADO":
        raise HTTPException(status_code=400, detail="Invalid abogado_id")
        
    db_process = db.query(models.Process).filter(models.Process.radicado == process.radicado).first()
    if db_process:
        raise HTTPException(status_code=400, detail="Radicado already registered")
    
    # Create audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        process_id=None,
        action_type="create_process",
        description=f"Nuevo proceso registrado: radicado {process.radicado}",
        metadata_json=f'{{"radicado": "{process.radicado}", "jurisdiccion": "{process.jurisdiccion}"}}'
    )
    
    new_process = models.Process(**process.dict())
    db.add(new_process)
    db.flush()
    
    audit.process_id = new_process.id
    db.add(audit)
    db.commit()
    db.refresh(new_process)
    return new_process

@router.put("/{id}", response_model=schemas.ProcessResponse)
def update_process(id: int, process_update: schemas.ProcessUpdate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot update processes")
        
    process = db.query(models.Process).filter(models.Process.id == id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
        
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this process")
        
    if process_update.etapa is not None:
        process.etapa = process_update.etapa
    if process_update.estado is not None:
        process.estado = process_update.estado
    
    # Create audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        process_id=id,
        action_type="update_process",
        description=f"Proceso actualizado: etapa={process_update.etapa}, estado={process_update.estado}"
    )
    db.add(audit)
    db.commit()
    db.refresh(process)
    return process

@router.delete("/{id}")
def delete_process(id: int, db: Session = Depends(deps.get_db), current_admin: models.User = Depends(deps.get_current_admin)):
    process = db.query(models.Process).filter(models.Process.id == id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Create audit log
    audit = models.AuditLog(
        user_id=current_admin.id,
        process_id=id,
        action_type="delete_process",
        description=f"Proceso eliminado: radicado {process.radicado}"
    )
    db.add(audit)
    db.delete(process)
    db.commit()
    return {"message": "Process deleted successfully"}
