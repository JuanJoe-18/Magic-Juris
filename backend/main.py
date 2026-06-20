import os
import random
import sqlite3
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth_utils
import config
import models
from database import SessionLocal, engine
from email_service import EmailService
from routers import actuaciones, alerts, audit, auth, processes, tasks, users

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Magic-Juris API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(processes.router, prefix="/api/processes", tags=["processes"])
app.include_router(actuaciones.router, prefix="/api/actuaciones", tags=["actuaciones"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])


def ensure_client_tasks_schema():
    db_path = os.path.join(os.path.dirname(__file__), "magic_juris.db")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    try:
        columns = {
            row[1]: row for row in conn.execute("PRAGMA table_info(client_tasks)").fetchall()
        }
        if not columns:
            return

        if "client_id" not in columns:
            conn.execute("ALTER TABLE client_tasks ADD COLUMN client_id INTEGER")
            conn.execute("UPDATE client_tasks SET client_id = assigned_to_id WHERE client_id IS NULL")

        if "assigned_to_id" not in columns:
            conn.execute("ALTER TABLE client_tasks ADD COLUMN assigned_to_id INTEGER")
            conn.execute("UPDATE client_tasks SET assigned_to_id = client_id WHERE assigned_to_id IS NULL")

        if "priority" not in columns:
            conn.execute("ALTER TABLE client_tasks ADD COLUMN priority VARCHAR DEFAULT 'MEDIA'")

        conn.execute(
            """
            UPDATE client_tasks
            SET status = CASE
                WHEN lower(COALESCE(status, 'pendiente')) = 'pendiente' THEN 'PENDIENTE'
                WHEN lower(status) = 'en_proceso' THEN 'EN_PROCESO'
                WHEN lower(status) = 'completada' THEN 'COMPLETADA'
                WHEN lower(status) = 'vencida' THEN 'PENDIENTE'
                ELSE status
            END
            """
        )
        conn.execute("UPDATE client_tasks SET priority = COALESCE(priority, 'MEDIA')")
        conn.commit()
    finally:
        conn.close()


@app.on_event("startup")
def init_email_service():
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_enabled = os.getenv("SMTP_ENABLED", "false").lower() == "true" and bool(smtp_host)
    service = EmailService(
        smtp_host=smtp_host,
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_user=os.getenv("SMTP_USER", ""),
        smtp_password=os.getenv("SMTP_PASSWORD", ""),
        smtp_from=os.getenv("SMTP_FROM", "no-reply@magicjuris.local"),
        enabled=smtp_enabled,
    )
    config.set_email_service(service)
    print(f"Email service initialized in {'SMTP' if service.enabled else 'stub'} mode")


@app.on_event("startup")
def migrate_db():
    ensure_client_tasks_schema()


@app.on_event("startup")
def seed_db():
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            admin = models.User(
                name="Admin HG",
                email="administrativo@hg.com",
                password_hash=auth_utils.get_password_hash("demo123"),
                role="ADMINISTRATIVO",
            )
            abogado = models.User(
                name="Abogado HG",
                email="abogado@hg.com",
                password_hash=auth_utils.get_password_hash("demo123"),
                role="ABOGADO",
            )
            cliente = models.User(
                name="Cliente HG",
                email="cliente@hg.com",
                password_hash=auth_utils.get_password_hash("demo123"),
                role="CLIENTE",
            )
            cliente2 = models.User(
                name="Cliente 2 HG",
                email="cliente2@hg.com",
                password_hash=auth_utils.get_password_hash("demo123"),
                role="CLIENTE",
            )
            db.add_all([admin, abogado, cliente, cliente2])
            db.commit()

            db.add(models.LawyerProfile(user_id=abogado.id, tarjeta_profesional="TP-123456"))
            db.commit()

            processes_data = [
                ("11001310300520240012300", "civil", "DEMANDANTE", cliente.id, "Admitida", "E2"),
                ("76001310500320240008765", "laboral", "DEMANDADO", cliente.id, "Notificación", "E3"),
                ("05001310200420240045678", "penal", "DEMANDANTE", cliente2.id, "Contestación", "E4"),
                ("25001310100620240056789", "civil", "DEMANDADO", cliente2.id, "Pruebas", "E5"),
                ("08001310400820240067890", "mercantil", "DEMANDANTE", cliente.id, "Sentencia", "E6"),
            ]

            processes_list = []
            for radicado, jurisdiccion, tipo_part, cliente_id, etapa, estado in processes_data:
                process = models.Process(
                    radicado=radicado,
                    jurisdiccion=jurisdiccion,
                    tipo_participacion=tipo_part,
                    cliente_id=cliente_id,
                    abogado_id=abogado.id,
                    etapa=etapa,
                    estado=estado,
                    fuente="MANUAL",
                )
                db.add(process)
                processes_list.append(process)
            db.commit()

            actuation_data = [
                ("audiencia", "Audiencia de pruebas programada para el 15 de julio", "ALTA"),
                ("sentencia", "Sentencia dictada por el juzgado en favor", "ALTA"),
                ("traslado", "Traslado para contestación de demanda", "MEDIA"),
                ("prueba", "Presentación de pruebas documentales", "MEDIA"),
                ("memorial", "Memorial presentado por la defensa", "MEDIA"),
                ("constancia", "Constancia de recibido en despacho judicial", "BAJA"),
                ("actualización", "Actualización de datos de registro", "BAJA"),
                ("archivo", "Archivo temporal del expediente", "BAJA"),
            ]

            for index, (tipo, anotacion, clasificacion) in enumerate(actuation_data):
                process_idx = index % len(processes_list[:2])
                db.add(
                    models.JudicialActuation(
                        process_id=processes_list[process_idx].id,
                        fecha=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                        tipo=tipo,
                        anotacion=anotacion,
                        clasificacion=clasificacion,
                        urgencia="CRITICA" if clasificacion == "ALTA" else "IMPORTANTE" if clasificacion == "MEDIA" else "INFORMATIVA",
                        fuente="MOCK",
                        external_id=f"MOCK_{processes_list[process_idx].id}_{index}",
                    )
                )
            db.commit()

            alerts_data = [
                (processes_list[0].id, abogado.id, "actuacion_critica", "ALTA", "Audiencia critica programada - Requiere atencion inmediata"),
                (processes_list[1].id, abogado.id, "actuacion_importante", "MEDIA", "Traslado pendiente - Contestacion requerida"),
                (processes_list[2].id, abogado.id, "actuacion_informativa", "BAJA", "Actualizacion de estado disponible"),
            ]
            for process_id, user_id, tipo, nivel, mensaje in alerts_data:
                db.add(
                    models.Alert(
                        process_id=process_id,
                        user_id=user_id,
                        tipo=tipo,
                        nivel=nivel,
                        mensaje=mensaje,
                        canal="interno",
                    )
                )
            db.commit()

            audit_data = [
                (admin.id, processes_list[0].id, "create_process", "Proceso registrado en sistema"),
                (abogado.id, processes_list[0].id, "sync_actuation", "Sincronizacion de actuaciones"),
                (abogado.id, processes_list[1].id, "create_process", "Nuevo caso asignado"),
                (admin.id, None, "user_created", "Usuario de abogado creado"),
                (admin.id, None, "system_start", "Sistema iniciado con seed data"),
            ]
            for user_id, process_id, action_type, description in audit_data:
                db.add(
                    models.AuditLog(
                        user_id=user_id,
                        process_id=process_id,
                        action_type=action_type,
                        description=description,
                    )
                )
            db.commit()

            comm_data = [
                (processes_list[0].id, abogado.id, "cliente", "email", "Se ha programado audiencia para el 15 de julio. Favor confirmar asistencia."),
                (processes_list[1].id, abogado.id, "cliente", "portal", "Se requiere informacion adicional para contestacion de demanda."),
                (processes_list[0].id, abogado.id, "cliente", "email", "Su caso ha avanzado a etapa de pruebas. Se le enviara cronograma proximamente."),
            ]
            for process_id, user_id, audience, channel, message in comm_data:
                db.add(
                    models.CommunicationHistory(
                        process_id=process_id,
                        user_id=user_id,
                        audience=audience,
                        channel=channel,
                        message=message,
                    )
                )
            db.commit()

        if not db.query(models.ClientTask).first():
            abogado = db.query(models.User).filter(models.User.email == "abogado@hg.com").first()
            cliente = db.query(models.User).filter(models.User.email == "cliente@hg.com").first()
            seeded_processes = (
                db.query(models.Process)
                .filter(models.Process.cliente_id == cliente.id)
                .order_by(models.Process.id.asc())
                .limit(2)
                .all()
            )
            if abogado and cliente and len(seeded_processes) >= 2:
                db.add_all(
                    [
                        models.ClientTask(
                            process_id=seeded_processes[0].id,
                            assigned_by_id=abogado.id,
                            client_id=cliente.id,
                            assigned_to_id=cliente.id,
                            title="Enviar documentos pendientes",
                            description="Por favor enviar copia de los soportes solicitados para continuar con la revision del caso.",
                            priority="ALTA",
                            due_date=datetime.utcnow().date() + timedelta(days=12),
                            status="PENDIENTE",
                        ),
                        models.ClientTask(
                            process_id=seeded_processes[1].id,
                            assigned_by_id=abogado.id,
                            client_id=cliente.id,
                            assigned_to_id=cliente.id,
                            title="Confirmar disponibilidad para reunion",
                            description="Necesitamos confirmar tu disponibilidad para revisar la siguiente actuacion del proceso.",
                            priority="MEDIA",
                            due_date=datetime.utcnow().date() + timedelta(days=5),
                            status="EN_PROCESO",
                        ),
                    ]
                )
                db.commit()
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to Magic-Juris API"}
