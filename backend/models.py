from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # ADMINISTRATIVO, ABOGADO, CLIENTE
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lawyer_profile = relationship("LawyerProfile", back_populates="user", uselist=False)

class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    tarjeta_profesional = Column(String, nullable=True)

    user = relationship("User", back_populates="lawyer_profile")

class Process(Base):
    __tablename__ = "processes"
    
    id = Column(Integer, primary_key=True, index=True)
    radicado = Column(String(23), unique=True, index=True)
    jurisdiccion = Column(String)
    tipo_participacion = Column(String) # DEMANDANTE, DEMANDADO
    cliente_id = Column(Integer, ForeignKey("users.id"))
    abogado_id = Column(Integer, ForeignKey("users.id"))
    etapa = Column(String)
    estado = Column(String)
    fuente = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class JudicialActuation(Base):
    __tablename__ = "judicial_actuations"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), index=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    tipo = Column(String) # "audiencia", "vencimiento", "fallo", etc.
    anotacion = Column(String)
    documento = Column(String, nullable=True)
    clasificacion = Column(String) # ALTA, MEDIA, BAJA
    urgencia = Column(String, nullable=True) # internal classification
    fuente = Column(String) # "MOCK", "RAMA_JUDICIAL"
    external_id = Column(String, nullable=True, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    tipo = Column(String) # "actuacion", "vencimiento", "comunicacion"
    nivel = Column(String) # ALTA, MEDIA, BAJA
    mensaje = Column(String)
    canal = Column(String) # "interno", "correo", "whatsapp"
    leida = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    email_enabled = Column(Boolean, default=True)
    whatsapp_enabled = Column(Boolean, default=False)
    preferred_channel = Column(String, default="interno")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), index=True, nullable=True)
    action_type = Column(String) # "login", "create_process", "sync_actuations", etc.
    description = Column(String)
    metadata_json = Column(String, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CommunicationHistory(Base):
    __tablename__ = "communication_history"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    audience = Column(String) # "cliente", "abogado", "juzgado"
    channel = Column(String) # "email", "sms", "portal", "whatsapp"
    message = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EmailLog(Base):
    __tablename__ = "email_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    to_email = Column(String, index=True)
    to_name = Column(String)
    subject = Column(String)
    email_type = Column(String) # "process_assigned", "communication", "actuation_alert"
    process_id = Column(Integer, ForeignKey("processes.id"), nullable=True, index=True)
    sent_successfully = Column(Boolean, default=False)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ClientTask(Base):
    __tablename__ = "client_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), index=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), index=True)  # Abogado
    client_id = Column(Integer, ForeignKey("users.id"), index=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)  # Legacy alias
    title = Column(String)
    description = Column(String)
    priority = Column(String, default="MEDIA")  # ALTA, MEDIA, BAJA
    due_date = Column(Date, nullable=True)
    status = Column(String, default="PENDIENTE")  # PENDIENTE, EN_PROCESO, COMPLETADA
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
