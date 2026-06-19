from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import config
import deps
import models
import schemas
from task_service import build_case_summary, render_task_email

router = APIRouter()


def _get_process_for_user(process_id: int, db: Session, current_user: models.User) -> models.Process:
    process = db.query(models.Process).filter(models.Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    if current_user.role == "CLIENTE" and process.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para este proceso")
    if current_user.role == "ABOGADO" and process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para este proceso")

    return process


@router.post("/", response_model=schemas.ClientTaskCreateResponse)
def create_task(
    payload: schemas.ClientTaskCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if current_user.role != "ABOGADO":
        raise HTTPException(status_code=403, detail="Solo un abogado puede asignar tareas")

    process = db.query(models.Process).filter(models.Process.radicado == payload.radicado).first()
    if not process:
        raise HTTPException(status_code=404, detail=f"No existe un proceso con radicado {payload.radicado}")
    if process.abogado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puede asignar tareas sobre procesos que no tiene asignados")

    client = db.query(models.User).filter(models.User.id == process.cliente_id).first()
    if not client or client.role != "CLIENTE":
        raise HTTPException(status_code=400, detail="El proceso no tiene un cliente valido asociado")

    last_actuation = (
        db.query(models.JudicialActuation)
        .filter(models.JudicialActuation.process_id == process.id)
        .order_by(models.JudicialActuation.fecha.desc())
        .first()
    )
    summary = build_case_summary(process, last_actuation)
    subject, email_body = render_task_email(
        client_name=client.name,
        radicado=process.radicado,
        summary=summary,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
    )

    new_task = models.ClientTask(
        process_id=process.id,
        assigned_by_id=current_user.id,
        client_id=client.id,
        assigned_to_id=client.id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        status="PENDIENTE",
    )
    db.add(new_task)
    db.flush()

    email_service = config.get_email_service()
    sent = False
    if email_service:
        try:
            sent = email_service.send_email(
                to_email=client.email,
                subject=subject,
                text_body=email_body,
            )
        except Exception as exc:
            print(f"[EMAIL_ERROR] {client.email}: {exc}")
            sent = False

    communication = models.CommunicationHistory(
        process_id=process.id,
        user_id=current_user.id,
        audience="cliente",
        channel="email" if sent else "email_stub",
        message=email_body,
    )
    db.add(communication)
    db.flush()

    alert = models.Alert(
        process_id=process.id,
        user_id=client.id,
        tipo="task_assigned",
        nivel=payload.priority,
        mensaje=f"Nueva tarea asignada al cliente en radicado {process.radicado}",
        canal="interno",
    )
    db.add(alert)

    audit = models.AuditLog(
        user_id=current_user.id,
        process_id=process.id,
        action_type="task_assigned",
        description=f"Tarea asignada al cliente para el radicado {process.radicado}",
        metadata_json=(
            f'{{"task_id": {new_task.id}, "priority": "{payload.priority}", '
            f'"channel": "{communication.channel}"}}'
        ),
    )
    db.add(audit)

    email_log = models.EmailLog(
        to_email=client.email,
        to_name=client.name,
        subject=subject,
        email_type="task_assigned",
        process_id=process.id,
        sent_successfully=sent,
        error_message=None if sent else "SMTP disabled or email delivery skipped",
    )
    db.add(email_log)

    db.commit()
    db.refresh(new_task)

    return schemas.ClientTaskCreateResponse(
        task=new_task,
        communication_id=communication.id,
        communication_channel=communication.channel,
        email_subject=subject,
        email_preview=email_body,
    )


@router.get("/", response_model=List[schemas.ClientTaskResponse])
def get_tasks(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    query = db.query(models.ClientTask)
    if current_user.role == "CLIENTE":
        query = query.filter(models.ClientTask.client_id == current_user.id)
    elif current_user.role == "ABOGADO":
        query = query.join(models.Process, models.ClientTask.process_id == models.Process.id).filter(
            models.Process.abogado_id == current_user.id
        )

    return query.order_by(models.ClientTask.created_at.desc()).all()


@router.get("/process/{process_id}", response_model=List[schemas.ClientTaskResponse])
def get_tasks_by_process(
    process_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    _get_process_for_user(process_id, db, current_user)
    return (
        db.query(models.ClientTask)
        .filter(models.ClientTask.process_id == process_id)
        .order_by(models.ClientTask.created_at.desc())
        .all()
    )


@router.get("/radicado/{radicado}", response_model=List[schemas.ClientTaskResponse])
def get_tasks_by_radicado(
    radicado: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    process = db.query(models.Process).filter(models.Process.radicado == radicado).first()
    if not process:
        raise HTTPException(status_code=404, detail=f"No existe un proceso con radicado {radicado}")
    _get_process_for_user(process.id, db, current_user)
    return (
        db.query(models.ClientTask)
        .filter(models.ClientTask.process_id == process.id)
        .order_by(models.ClientTask.created_at.desc())
        .all()
    )


@router.patch("/{task_id}/status", response_model=schemas.ClientTaskResponse)
def update_task_status(
    task_id: int,
    payload: schemas.ClientTaskStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    task = db.query(models.ClientTask).filter(models.ClientTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    if current_user.role != "CLIENTE" or task.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el cliente asignado puede cambiar el estado de la tarea")

    if payload.status not in {"EN_PROCESO", "COMPLETADA"}:
        raise HTTPException(status_code=400, detail="El cliente solo puede cambiar el estado a EN_PROCESO o COMPLETADA")

    task.status = payload.status

    audit = models.AuditLog(
        user_id=current_user.id,
        process_id=task.process_id,
        action_type="task_status_updated",
        description=f"Cliente actualizo tarea {task.id} a estado {payload.status}",
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    return task
