import datetime
from typing import Optional

import models


def build_case_summary(process: models.Process, last_actuation: Optional[models.JudicialActuation] = None) -> str:
    stage = (process.etapa or "").strip()
    stage_map = {
        "Admitida": "El proceso fue admitido y se encuentra en etapa inicial de tramite.",
        "Notificacion": "El proceso se encuentra en etapa de notificacion a las partes.",
        "Notificación": "El proceso se encuentra en etapa de notificacion a las partes.",
        "Contestacion": "El proceso esta pendiente o en desarrollo de contestacion.",
        "Contestación": "El proceso esta pendiente o en desarrollo de contestacion.",
        "Pruebas": "El proceso se encuentra en etapa probatoria.",
        "Sentencia": "El proceso tiene una decision o se encuentra en etapa de sentencia.",
    }
    summary = stage_map.get(
        stage,
        f"El proceso se encuentra en etapa {stage or 'no especificada'} con estado {process.estado or 'sin actualizar'}.",
    )

    if last_actuation:
        anotacion = (last_actuation.anotacion or "").strip()
        suffix = f" Ultima actuacion registrada: {last_actuation.tipo or 'Sin tipo'}"
        if anotacion:
            suffix += f" - {anotacion}."
        else:
            suffix += "."
        summary += suffix

    return summary


def render_task_email(
    client_name: str,
    radicado: str,
    summary: str,
    title: str,
    description: str,
    priority: str,
    due_date: Optional[datetime.date],
) -> tuple[str, str]:
    due_text = due_date.isoformat() if due_date else "Sin fecha limite definida"
    subject = f"Hurtado Gandini | Nueva tarea asignada - Radicado {radicado}"
    body = (
        "HURTADO GANDINI\n"
        "Powered by MagicJuris\n\n"
        f"Radicado: {radicado}\n\n"
        f"Hola {client_name},\n\n"
        "Tu abogado ha asignado una nueva tarea relacionada con tu proceso.\n\n"
        "Resumen del caso:\n"
        f"{summary}\n\n"
        "Tarea asignada:\n"
        f"{title}\n\n"
        "Detalle:\n"
        f"{description}\n\n"
        "Prioridad:\n"
        f"{priority}\n\n"
        "Fecha limite:\n"
        f"{due_text}\n\n"
        "Este mensaje hace parte del seguimiento judicial de tu proceso.\n\n"
        "Atentamente,\n"
        "Hurtado Gandini\n"
        "Powered by MagicJuris"
    )
    return subject, body
