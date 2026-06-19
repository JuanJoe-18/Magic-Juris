from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, deps, actuation_service, config
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
    
    # Send email notification to client
    email_service = config.get_email_service()
    if email_service:
        try:
            # Generate case summary based on stage
            etapa_summaries = {
                "Admitida": "Tu caso ha sido admitido por el juzgado. El siguiente paso será la notificación de la demanda al demandado.",
                "Notificación": "Se está notificando al demandado sobre la demanda. Próximamente tendremos la contestación.",
                "Contestación": "El demandado ha presentado su contestación. Ahora pasaremos a la etapa de pruebas.",
                "Pruebas": "Estamos en la etapa de presentación de pruebas. Se recopilarán documentos y testimonios relevantes.",
                "Sentencia": "El caso está en sentencia. El juzgado está revisando toda la evidencia para dictar la sentencia final.",
                "Ejecución": "Sentencia dictada. Procedemos a la ejecución de la sentencia."
            }
            
            case_summary = etapa_summaries.get(
                new_process.etapa,
                f"Tu caso está en etapa de {new_process.etapa}. Tu abogado te informará de los próximos pasos."
            )
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #141414; padding: 30px; border-radius: 8px; color: #FFFFFF;">
                        <h1 style="color: #84120C; margin-bottom: 10px; font-size: 28px;">🔔 Nuevo Caso Asignado</h1>
                        <p style="color: #D9D9D9; margin-bottom: 30px;">Estimado/a <strong>{cliente.name}</strong>,</p>
                        
                        <!-- RADICADO PROMINENTE -->
                        <div style="background-color: #84120C; padding: 20px; border-radius: 4px; margin-bottom: 30px; text-align: center;">
                            <p style="margin: 0; color: #FFFFFF; font-size: 12px;">NÚMERO DE RADICADO</p>
                            <p style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 24px; font-weight: bold; font-family: monospace;">{new_process.radicado}</p>
                        </div>
                        
                        <!-- DETALLES DEL CASO -->
                        <div style="background-color: #1C1C1C; padding: 20px; border-left: 4px solid #84120C; margin-bottom: 30px;">
                            <h3 style="color: #84120C; margin-top: 0;">Información de tu Caso</h3>
                            <table style="width: 100%; border-collapse: collapse; color: #FFFFFF;">
                                <tr style="border-bottom: 1px solid #3A3A3A;">
                                    <td style="padding: 10px; width: 40%;"><strong>Jurisdicción:</strong></td>
                                    <td style="padding: 10px;">{new_process.jurisdiccion.capitalize()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #3A3A3A;">
                                    <td style="padding: 10px;"><strong>Tu Rol:</strong></td>
                                    <td style="padding: 10px;">{new_process.tipo_participacion.upper()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #3A3A3A;">
                                    <td style="padding: 10px;"><strong>Tu Abogado:</strong></td>
                                    <td style="padding: 10px;">{abogado.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px;"><strong>Etapa Actual:</strong></td>
                                    <td style="padding: 10px;">{new_process.etapa}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- RESUMEN DEL CASO -->
                        <div style="background-color: #1C1C1C; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                            <h3 style="color: #84120C; margin-top: 0;">¿Qué es lo que está pasando con tu caso?</h3>
                            <p style="line-height: 1.6; color: #D9D9D9;">{case_summary}</p>
                        </div>
                        
                        <!-- PRÓXIMOS PASOS -->
                        <div style="background-color: #1C1C1C; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                            <h3 style="color: #84120C; margin-top: 0;">¿Qué debes hacer ahora?</h3>
                            <ul style="line-height: 1.8; color: #D9D9D9;">
                                <li>Mantente atento a comunicaciones de tu abogado</li>
                                <li>Prepara cualquier documentación que se te solicite</li>
                                <li>Responde prontamente a requerimientos del juzgado</li>
                                <li>Consulta con tu abogado ante cualquier duda</li>
                            </ul>
                        </div>
                        
                        <!-- CTA -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <a href="http://localhost:5173/dashboard" style="background-color: #84120C; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                                Ver Detalles en Portal
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
║         NUEVO CASO ASIGNADO                ║
╚════════════════════════════════════════════╝

Estimado/a {cliente.name},

Se le ha asignado un nuevo caso judicial.

═══ NÚMERO DE RADICADO ═══
{new_process.radicado}

═══ INFORMACIÓN DE TU CASO ═══
Jurisdicción:        {new_process.jurisdiccion.capitalize()}
Tu Rol:              {new_process.tipo_participacion.upper()}
Tu Abogado:          {abogado.name}
Etapa Actual:        {new_process.etapa}

═══ ¿QUÉ ESTÁ PASANDO? ═══
{case_summary}

═══ ¿QUÉ DEBES HACER? ═══
• Mantente atento a comunicaciones de tu abogado
• Prepara cualquier documentación que se te solicite
• Responde prontamente a requerimientos del juzgado
• Consulta con tu abogado ante cualquier duda

═══ ACCESO AL PORTAL ═══
http://localhost:5173/dashboard

────────────────────────────────────────────
Magic-Juris - Sistema de Seguimiento Judicial
Powered by Hurtado Gandini
            """
            
            success = email_service.send_email(
                to_email=cliente.email,
                subject=f"Nuevo Caso Asignado - Radicado {new_process.radicado}",
                html_body=html_body,
                text_body=text_body
            )
            
            # Log email in database
            email_log = models.EmailLog(
                to_email=cliente.email,
                to_name=cliente.name,
                subject=f"Nuevo Caso Asignado - Radicado {new_process.radicado}",
                email_type="process_assigned",
                process_id=new_process.id,
                sent_successfully=success,
                error_message=None if success else "Email send attempt made"
            )
            db.add(email_log)
            db.commit()
            
            print(f"📧 Email notification sent to {cliente.email} for process {new_process.id}")
        except Exception as e:
            print(f"⚠️  Failed to send email to {cliente.email}: {str(e)}")
            error_log = models.EmailLog(
                to_email=cliente.email,
                to_name=cliente.name,
                subject=f"Nuevo Caso Asignado - Radicado {new_process.radicado}",
                email_type="process_assigned",
                process_id=new_process.id,
                sent_successfully=False,
                error_message=str(e)
            )
            db.add(error_log)
            db.commit()
    
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
