from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps, actuation_service, config
from datetime import datetime, timedelta
import random

router = APIRouter()


@router.get("/", response_model=List[schemas.JudicialActuationResponse])
def get_actuaciones(
    skip: int = 0,
    limit: int = 100,
    process_id: int = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get judicial actuations. Filter by process_id if provided. RBAC applies."""
    query = db.query(models.JudicialActuation)
    
    if process_id:
        process = db.query(models.Process).filter(models.Process.id == process_id).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        # Check authorization
        if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        query = query.filter(models.JudicialActuation.process_id == process_id)
    else:
        # Filter by role if not requesting specific process
        if current_user.role == "CLIENTE":
            # Only actuations for own processes
            query = query.join(models.Process).filter(models.Process.cliente_id == current_user.id)
        elif current_user.role == "ABOGADO":
            # Only actuations for assigned processes
            query = query.join(models.Process).filter(models.Process.abogado_id == current_user.id)
        # ADMINISTRATIVO sees all
    
    return query.order_by(models.JudicialActuation.fecha.desc()).offset(skip).limit(limit).all()


@router.get("/process/{process_id}", response_model=List[schemas.JudicialActuationResponse])
def get_actuaciones_by_process(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get actuations for a specific process with RBAC."""
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Check authorization
    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    actuations = (
        db.query(models.JudicialActuation)
        .filter(models.JudicialActuation.process_id == process_id)
        .order_by(models.JudicialActuation.fecha.desc())
        .all()
    )
    return actuations


@router.post("/{process_id}/sync", response_model=dict)
def sync_mock_actuations(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Sync mock actuations for a process.
    CLIENTE cannot sync. ABOGADO can sync own processes. ADMINISTRATIVO can sync all.
    """
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot sync actuations")
    
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to sync this process")
    
    # Generate 2-4 random actuations
    mock_actuations_data = [
        ("audiencia", "Audiencia de pruebas programada para el caso"),
        ("notificación", "Notificación de demanda al demandado"),
        ("traslado", "Traslado para contestación de demanda"),
        ("fallo", "Fallo dictado por el juzgado"),
        ("contestación", "Demandado contestó la demanda"),
        ("memorial", "Memorial presentado por la defensa"),
        ("auto que ordena", "Auto que ordena práctica de pruebas"),
        ("sentencia", "Sentencia de primera instancia"),
        ("apelación", "Apelación interpuesta contra sentencia"),
        ("constancia", "Constancia de recibido en despacho"),
    ]
    
    num_actuations = random.randint(2, 4)
    created_count = 0
    
    for _ in range(num_actuations):
        tipo, anotacion = random.choice(mock_actuations_data)
        
        # Check if this exact actuation already exists (avoid duplicates)
        existing = (
            db.query(models.JudicialActuation)
            .filter(
                models.JudicialActuation.process_id == process_id,
                models.JudicialActuation.tipo == tipo,
                models.JudicialActuation.anotacion == anotacion
            )
            .first()
        )
        
        if existing:
            continue
        
        # Classify
        classification_result = actuation_service.classify_actuation(tipo, anotacion)
        
        # Create actuation
        actuation = models.JudicialActuation(
            process_id=process_id,
            fecha=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            tipo=tipo,
            anotacion=anotacion,
            clasificacion=classification_result["clasificacion"],
            urgencia=classification_result["urgencia"],
            fuente="MOCK",
            external_id=f"MOCK_{process_id}_{created_count}_{int(datetime.utcnow().timestamp())}"
        )
        db.add(actuation)
        db.flush()
        
        # Generate alert if needed
        alert_config = actuation_service.get_alert_for_actuation(
            classification_result["clasificacion"]
        )
        alert_message = alert_config["mensaje_template"].format(tipo=tipo)
        
        alert = models.Alert(
            process_id=process_id,
            user_id=process.abogado_id,
            tipo=alert_config["tipo"],
            nivel=alert_config["nivel"],
            mensaje=alert_message,
            canal=alert_config["canal"]
        )
        db.add(alert)
        
        # Create audit log
        audit = models.AuditLog(
            user_id=current_user.id,
            process_id=process_id,
            action_type="sync_actuation",
            description=f"Sincronización de actuación: {tipo}",
            metadata_json=f'{{"tipo": "{tipo}", "clasificacion": "{classification_result["clasificacion"]}"}}'
        )
        db.add(audit)
        
        # Send email to abogado if ALTA criticality
        email_service = config.get_email_service()
        if classification_result["clasificacion"] == "ALTA" and email_service:
            try:
                abogado = db.query(models.User).filter(models.User.id == process.abogado_id).first()
                if abogado:
                    html_body = f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; color: #333;">
                            <div style="background-color: #141414; padding: 30px; border-radius: 8px; color: #FFFFFF;">
                                <h2 style="color: #84120C; margin-bottom: 20px;">⚠️ ALERTA CRÍTICA - Nueva Actuación</h2>
                                <p>Estimado/a <strong>{abogado.name}</strong>,</p>
                                <p>Se ha detectado una nueva actuación crítica en uno de tus casos:</p>
                                <div style="background-color: #1C1C1C; padding: 20px; border-left: 4px solid #84120C; margin: 20px 0;">
                                    <p><strong>Radicado:</strong> {process.radicado}</p>
                                    <p><strong>Tipo de Actuación:</strong> {tipo}</p>
                                    <p><strong>Descripción:</strong> {anotacion}</p>
                                    <p><strong>Urgencia:</strong> CRÍTICA</p>
                                </div>
                                <p>Por favor revisa el portal inmediatamente para tomar las acciones necesarias.</p>
                                <p>Accede aquí: <a href="http://localhost:5173/dashboard" style="color: #84120C;">Magic-Juris Portal</a></p>
                                <hr style="border: none; border-top: 1px solid #3A3A3A; margin: 20px 0;">
                                <p style="font-size: 12px; color: #D9D9D9;">Powered by Magic-Juris | Hurtado Gandini</p>
                            </div>
                        </body>
                    </html>
                    """
                    
                    text_body = f"""
ALERTA CRÍTICA - Nueva Actuación

Estimado/a {abogado.name},

Se ha detectado una nueva actuación crítica en uno de tus casos:

Radicado: {process.radicado}
Tipo de Actuación: {tipo}
Descripción: {anotacion}
Urgencia: CRÍTICA

Por favor revisa el portal inmediatamente para tomar las acciones necesarias.

Accede aquí: http://localhost:5173/dashboard

Powered by Magic-Juris | Hurtado Gandini
                    """
                    
                    success = email_service.send_email(
                        to_email=abogado.email,
                        subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                        html_body=html_body,
                        text_body=text_body
                    )
                    
                    # Log email
                    email_log = models.EmailLog(
                        to_email=abogado.email,
                        to_name=abogado.name,
                        subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                        email_type="actuation_alert",
                        process_id=process.id,
                        sent_successfully=success,
                        error_message=None if success else "Email send attempt made"
                    )
                    db.add(email_log)
                    
                    print(f"📧 Alert email sent to {abogado.email} for critical actuation in process {process.id}")
            except Exception as e:
                print(f"⚠️  Failed to send alert email: {str(e)}")
                try:
                    email_log = models.EmailLog(
                        to_email=abogado.email if 'abogado' in locals() and abogado else "unknown",
                        to_name=abogado.name if 'abogado' in locals() and abogado else "Unknown",
                        subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                        email_type="actuation_alert",
                        process_id=process.id,
                        sent_successfully=False,
                        error_message=str(e)
                    )
                    db.add(email_log)
                except:
                    pass
        
        created_count += 1
    
    db.commit()
    
    return {
        "message": f"Sincronización completada",
        "process_id": process_id,
        "actuations_created": created_count,
        "radicado": process.radicado
    }


@router.post("/", response_model=schemas.JudicialActuationResponse)
def create_actuation(
    actuation: schemas.JudicialActuationCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Create a judicial actuation. Only ADMINISTRATIVO and ABOGADO can create."""
    if current_user.role == "CLIENTE":
        raise HTTPException(status_code=403, detail="Clients cannot create actuations")
    
    process = db.query(models.Process).filter(models.Process.id == actuation.process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Classify if not provided
    if actuation.clasificacion == "BAJA":
        classification_result = actuation_service.classify_actuation(actuation.tipo, actuation.anotacion)
        actuation.clasificacion = classification_result["clasificacion"]
        if not actuation.urgencia:
            actuation.urgencia = classification_result["urgencia"]
    
    new_actuation = models.JudicialActuation(**actuation.dict())
    db.add(new_actuation)
    db.flush()
    
    # Generate alert
    alert_config = actuation_service.get_alert_for_actuation(actuation.clasificacion)
    alert_message = alert_config["mensaje_template"].format(tipo=actuation.tipo)
    
    alert = models.Alert(
        process_id=actuation.process_id,
        user_id=process.abogado_id,
        tipo=alert_config["tipo"],
        nivel=alert_config["nivel"],
        mensaje=alert_message,
        canal=alert_config["canal"]
    )
    db.add(alert)
    db.commit()
    db.refresh(new_actuation)
    
    # Send email to abogado if ALTA criticality
    email_service = config.get_email_service()
    if actuation.clasificacion == "ALTA" and email_service:
        try:
            abogado = db.query(models.User).filter(models.User.id == process.abogado_id).first()
            if abogado:
                html_body = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; color: #333;">
                        <div style="background-color: #141414; padding: 30px; border-radius: 8px; color: #FFFFFF;">
                            <h2 style="color: #84120C; margin-bottom: 20px;">⚠️ ALERTA CRÍTICA - Nueva Actuación</h2>
                            <p>Estimado/a <strong>{abogado.name}</strong>,</p>
                            <p>Se ha registrado una nueva actuación crítica en uno de tus casos:</p>
                            <div style="background-color: #1C1C1C; padding: 20px; border-left: 4px solid #84120C; margin: 20px 0;">
                                <p><strong>Radicado:</strong> {process.radicado}</p>
                                <p><strong>Tipo de Actuación:</strong> {actuation.tipo}</p>
                                <p><strong>Descripción:</strong> {actuation.anotacion}</p>
                                <p><strong>Urgencia:</strong> CRÍTICA</p>
                            </div>
                            <p>Por favor revisa el portal inmediatamente para tomar las acciones necesarias.</p>
                            <p>Accede aquí: <a href="http://localhost:5173/dashboard" style="color: #84120C;">Magic-Juris Portal</a></p>
                            <hr style="border: none; border-top: 1px solid #3A3A3A; margin: 20px 0;">
                            <p style="font-size: 12px; color: #D9D9D9;">Powered by Magic-Juris | Hurtado Gandini</p>
                        </div>
                    </body>
                </html>
                """
                
                text_body = f"""
ALERTA CRÍTICA - Nueva Actuación

Estimado/a {abogado.name},

Se ha registrado una nueva actuación crítica en uno de tus casos:

Radicado: {process.radicado}
Tipo de Actuación: {actuation.tipo}
Descripción: {actuation.anotacion}
Urgencia: CRÍTICA

Por favor revisa el portal inmediatamente para tomar las acciones necesarias.

Accede aquí: http://localhost:5173/dashboard

Powered by Magic-Juris | Hurtado Gandini
                """
                
                success = email_service.send_email(
                    to_email=abogado.email,
                    subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                    html_body=html_body,
                    text_body=text_body
                )
                
                # Log email
                email_log = models.EmailLog(
                    to_email=abogado.email,
                    to_name=abogado.name,
                    subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                    email_type="actuation_alert",
                    process_id=process.id,
                    sent_successfully=success,
                    error_message=None if success else "Email send attempt made"
                )
                db.add(email_log)
                db.commit()
                
                print(f"📧 Alert email sent to {abogado.email} for critical actuation in process {process.id}")
        except Exception as e:
            print(f"⚠️  Failed to send alert email: {str(e)}")
            try:
                email_log = models.EmailLog(
                    to_email=abogado.email if 'abogado' in locals() and abogado else "unknown",
                    to_name=abogado.name if 'abogado' in locals() and abogado else "Unknown",
                    subject=f"⚠️ ALERTA CRÍTICA - Actuación en caso {process.radicado}",
                    email_type="actuation_alert",
                    process_id=process.id,
                    sent_successfully=False,
                    error_message=str(e)
                )
                db.add(email_log)
                db.commit()
            except:
                pass
    
    return new_actuation

