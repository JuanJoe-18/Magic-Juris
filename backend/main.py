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
        
        db.add_all([admin, abogado, cliente])
        db.commit()
        
        # Create lawyer profile
        profile = models.LawyerProfile(user_id=abogado.id, tarjeta_profesional="TP-123456")
        db.add(profile)
        db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Magic-Juris API"}
