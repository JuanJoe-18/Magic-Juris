"""
Siembra el catálogo con RADICADOS REALES y limpia los datos demo.
Idempotente para usuarios; reemplaza por completo procesos/actuaciones/alertas/tareas.

Uso (con el venv activo y uvicorn DETENIDO):
    cd backend
    python seed_real.py
"""
from datetime import datetime, timedelta

import auth_utils
import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

# ── Radicados REALES (verificados en la Rama Judicial) ──
RADICADOS = [
    "11001400301620210108700",
    "11001400304120240045100",
    "76001310301920250029600",
    "76001311000720040022200",
    "76001400301620210024700",
    "76001233300820170102700",
    "76001233300920170024000",
    "76001220400020240123600",
    "76001430300820260015900",
    "76001400300820190020400",
    "76001310501520240022300",
]

# Valores iniciales de catálogo (se enriquecen con la consulta real a la Rama).
ETAPAS = ["Admitida", "Notificación", "Contestación", "Pruebas", "Sentencia"]
JURISDICCIONES = ["civil", "laboral", "mercantil", "administrativo", "civil"]
ESTADOS = ["E2", "E3", "E4", "E5", "E6"]

# Correo del equipo (bandeja real para verificar notificaciones).
TEAM_CLIENTE = ("Juan Jose Aponza", "aponzavalenciajuanjo@gmail.com")


def get_or_create_user(db, name, email, role, password="demo123", tarjeta=None):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            name=name,
            email=email,
            password_hash=auth_utils.get_password_hash(password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        if role == "ABOGADO" and tarjeta:
            db.add(models.LawyerProfile(user_id=user.id, tarjeta_profesional=tarjeta))
            db.commit()
    return user


def borrar_demo(db):
    """Limpia todo el dato demo relacionado con procesos (mantiene usuarios)."""
    for modelo in [
        "ClientTask",
        "CommunicationHistory",
        "EmailLog",
        "Alert",
        "JudicialActuation",
        "AuditLog",
        "Process",
    ]:
        cls = getattr(models, modelo, None)
        if cls is None:
            continue
        try:
            db.query(cls).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"  (aviso) no se pudo limpiar {modelo}: {e}")


def main():
    db = SessionLocal()
    try:
        # Usuarios base (idempotente)
        admin = get_or_create_user(db, "Admin HG", "administrativo@hg.com", "ADMINISTRATIVO")
        abogado = get_or_create_user(
            db, "Dra. Valentina Hurtado", "abogado@hg.com", "ABOGADO", tarjeta="TP-248915"
        )
        cliente = get_or_create_user(db, "Cliente HG", "cliente@hg.com", "CLIENTE")
        cliente_equipo = get_or_create_user(db, TEAM_CLIENTE[0], TEAM_CLIENTE[1], "CLIENTE")

        # Limpiar lo demo
        borrar_demo(db)

        # Crear procesos reales (alternando cliente del equipo / cliente demo)
        creados = []
        for i, radicado in enumerate(RADICADOS):
            titular = cliente_equipo if i % 2 == 0 else cliente
            proceso = models.Process(
                radicado=radicado,
                jurisdiccion=JURISDICCIONES[i % len(JURISDICCIONES)],
                tipo_participacion="DEMANDANTE" if i % 2 == 0 else "DEMANDADO",
                cliente_id=titular.id,
                abogado_id=abogado.id,
                etapa=ETAPAS[i % len(ETAPAS)],
                estado=ESTADOS[i % len(ESTADOS)],
                fuente="REAL",
            )
            db.add(proceso)
            creados.append(proceso)
        db.commit()

        # Un par de tareas reales del abogado al cliente del equipo
        if len(creados) >= 2 and hasattr(models, "ClientTask"):
            db.add_all([
                models.ClientTask(
                    process_id=creados[0].id,
                    assigned_by_id=abogado.id,
                    client_id=cliente_equipo.id,
                    assigned_to_id=cliente_equipo.id,
                    title="Adjuntar copia de la cédula y poder",
                    description="Necesitamos el documento de identidad y el poder firmado para continuar con el trámite.",
                    priority="ALTA",
                    due_date=datetime.utcnow().date() + timedelta(days=4),
                    status="PENDIENTE",
                ),
                models.ClientTask(
                    process_id=creados[2].id if len(creados) > 2 else creados[1].id,
                    assigned_by_id=abogado.id,
                    client_id=cliente_equipo.id,
                    assigned_to_id=cliente_equipo.id,
                    title="Confirmar disponibilidad para audiencia",
                    description="Por favor confirma tu disponibilidad para la próxima audiencia del proceso.",
                    priority="MEDIA",
                    due_date=datetime.utcnow().date() + timedelta(days=9),
                    status="EN_PROCESO",
                ),
            ])
            db.commit()

        total = db.query(models.Process).count()
        print(f"Listo. Procesos reales: {len(creados)} · Total en catálogo: {total}")
        print(f"Cliente del equipo (bandeja real): {TEAM_CLIENTE[1]}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
