from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, processes, actuaciones, alerts, audit
import models
from database import engine, SessionLocal
import auth_utils

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Magic-Juris API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
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

@app.on_event("startup")
def seed_db():
    db = SessionLocal()
    try:
        # Check if users exist
        if db.query(models.User).first():
            return
        
        # Create users
        admin = models.User(name="Admin HG", email="administrativo@hg.com", password_hash=auth_utils.get_password_hash("demo123"), role="ADMINISTRATIVO")
        abogado = models.User(name="Abogado HG", email="abogado@hg.com", password_hash=auth_utils.get_password_hash("demo123"), role="ABOGADO")
        cliente = models.User(name="Cliente HG", email="cliente@hg.com", password_hash=auth_utils.get_password_hash("demo123"), role="CLIENTE")
        cliente2 = models.User(name="Cliente 2 HG", email="cliente2@hg.com", password_hash=auth_utils.get_password_hash("demo123"), role="CLIENTE")
        
        db.add_all([admin, abogado, cliente, cliente2])
        db.commit()
        
        # Create lawyer profile
        profile = models.LawyerProfile(user_id=abogado.id, tarjeta_profesional="TP-123456")
        db.add(profile)
        db.commit()
        
        # Create 5 processes
        processes_data = [
            ("11001310300520240012300", "civil", "DEMANDANTE", cliente.id, "Admitida", "E2"),
            ("76001310500320240008765", "laboral", "DEMANDADO", cliente.id, "Notificación", "E3"),
            ("05001310200420240045678", "penal", "DEMANDANTE", cliente2.id, "Contestación", "E4"),
            ("25001310100620240056789", "civil", "DEMANDADO", cliente2.id, "Pruebas", "E5"),
            ("08001310400820240067890", "mercantil", "DEMANDANTE", cliente.id, "Sentencia", "E6"),
        ]
        
        processes_list = []
        for radicado, jurisdiccion, tipo_part, cliente_id, etapa, estado in processes_data:
            p = models.Process(
                radicado=radicado,
                jurisdiccion=jurisdiccion,
                tipo_participacion=tipo_part,
                cliente_id=cliente_id,
                abogado_id=abogado.id,
                etapa=etapa,
                estado=estado,
                fuente="MANUAL"
            )
            db.add(p)
            processes_list.append(p)
        
        db.commit()
        
        # Create 8 judicial actuations with mix of classifications
        actuation_data = [
            # ALTA
            ("audiencia", "Audiencia de pruebas programada para el 15 de julio", "ALTA"),
            ("sentencia", "Sentencia dictada por el juzgado en favor", "ALTA"),
            # MEDIA
            ("traslado", "Traslado para contestación de demanda", "MEDIA"),
            ("prueba", "Presentación de pruebas documentales", "MEDIA"),
            ("memorial", "Memorial presentado por la defensa", "MEDIA"),
            # BAJA
            ("constancia", "Constancia de recibido en despacho judicial", "BAJA"),
            ("actualización", "Actualización de datos de registro", "BAJA"),
            ("archivo", "Archivo temporal del expediente", "BAJA"),
        ]
        
        # Add actuations to first 2 processes
        for i, (tipo, anotacion, clasificacion) in enumerate(actuation_data):
            process_idx = i % len(processes_list[:2])
            actuation = models.JudicialActuation(
                process_id=processes_list[process_idx].id,
                fecha=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                tipo=tipo,
                anotacion=anotacion,
                clasificacion=clasificacion,
                urgencia="CRÍTICA" if clasificacion == "ALTA" else "IMPORTANTE" if clasificacion == "MEDIA" else "INFORMATIVA",
                fuente="MOCK",
                external_id=f"MOCK_{processes_list[process_idx].id}_{i}"
            )
            db.add(actuation)
        
        db.commit()
        
        # Create 3 alerts
        alerts_data = [
            (processes_list[0].id, abogado.id, "actuacion_critica", "ALTA", "Audiencia crítica programada - Requiere atención inmediata"),
            (processes_list[1].id, abogado.id, "actuacion_importante", "MEDIA", "Traslado pendiente - Contestación requerida"),
            (processes_list[2].id, abogado.id, "actuacion_informativa", "BAJA", "Actualización de estado disponible"),
        ]
        
        for process_id, user_id, tipo, nivel, mensaje in alerts_data:
            alert = models.Alert(
                process_id=process_id,
                user_id=user_id,
                tipo=tipo,
                nivel=nivel,
                mensaje=mensaje,
                canal="interno"
            )
            db.add(alert)
        
        db.commit()
        
        # Create 5 audit logs
        audit_data = [
            (admin.id, processes_list[0].id, "create_process", "Proceso registrado en sistema"),
            (abogado.id, processes_list[0].id, "sync_actuation", "Sincronización de actuaciones"),
            (abogado.id, processes_list[1].id, "create_process", "Nuevo caso asignado"),
            (admin.id, None, "user_created", "Usuario de abogado creado"),
            (admin.id, None, "system_start", "Sistema iniciado con seed data"),
        ]
        
        for user_id, process_id, action_type, description in audit_data:
            audit = models.AuditLog(
                user_id=user_id,
                process_id=process_id,
                action_type=action_type,
                description=description
            )
            db.add(audit)
        
        db.commit()
        
        # Create 3 communication history records
        comm_data = [
            (processes_list[0].id, abogado.id, "cliente", "email", "Se ha programado audiencia para el 15 de julio. Favor confirmar asistencia."),
            (processes_list[1].id, abogado.id, "cliente", "portal", "Se requiere información adicional para contestación de demanda."),
            (processes_list[0].id, abogado.id, "cliente", "email", "Su caso ha avanzado a etapa de pruebas. Se le enviará cronograma próximamente."),
        ]
        
        for process_id, user_id, audience, channel, message in comm_data:
            comm = models.CommunicationHistory(
                process_id=process_id,
                user_id=user_id,
                audience=audience,
                channel=channel,
                message=message
            )
            db.add(comm)
        
        db.commit()
        
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Magic-Juris API"}

