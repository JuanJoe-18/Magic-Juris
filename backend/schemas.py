from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import datetime

class LawyerProfileBase(BaseModel):
    tarjeta_profesional: Optional[str] = None

class LawyerProfileResponse(LawyerProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

    @validator("role")
    def validate_role(cls, value):
        allowed = {"ADMINISTRATIVO", "ABOGADO", "CLIENTE"}
        if value not in allowed:
            raise ValueError(f"role debe ser uno de: {', '.join(sorted(allowed))}")
        return value

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    tarjeta_profesional: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime
    lawyer_profile: Optional[LawyerProfileResponse] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    tarjeta_profesional: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

    @validator("role")
    def validate_role(cls, value):
        allowed = {"ADMINISTRATIVO", "ABOGADO", "CLIENTE"}
        if value not in allowed:
            raise ValueError(f"role debe ser uno de: {', '.join(sorted(allowed))}")
        return value


class UserRegistrationRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=140)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str
    tarjeta_profesional: Optional[str] = None
    accepted_policy: bool = False

    @validator("role")
    def validate_registration_role(cls, value):
        allowed = {"ABOGADO", "CLIENTE"}
        if value not in allowed:
            raise ValueError("Solo se permiten solicitudes para CLIENTE o ABOGADO")
        return value


class UserRegistrationResponse(BaseModel):
    message: str
    user_id: int
    requires_admin_approval: bool = True


class UserActivationUpdate(BaseModel):
    is_active: bool

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProcessBase(BaseModel):
    radicado: str = Field(..., min_length=23, max_length=23, description="Debe tener exactamente 23 dígitos")
    jurisdiccion: str
    tipo_participacion: str
    cliente_id: int
    abogado_id: int
    etapa: str
    estado: str
    fuente: str = "MANUAL"
    
    @validator('radicado')
    def validate_radicado(cls, v):
        if not v.isdigit():
            raise ValueError('El radicado debe contener solo números')
        return v

class ProcessCreate(ProcessBase):
    pass

class ProcessUpdate(BaseModel):
    etapa: Optional[str] = None
    estado: Optional[str] = None

class ProcessResponse(ProcessBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class JudicialActuationBase(BaseModel):
    tipo: str
    anotacion: str
    documento: Optional[str] = None
    clasificacion: str = "BAJA"
    urgencia: Optional[str] = None
    fuente: str = "MOCK"
    external_id: Optional[str] = None

class JudicialActuationCreate(JudicialActuationBase):
    process_id: int

class JudicialActuationResponse(JudicialActuationBase):
    id: int
    process_id: int
    fecha: datetime.datetime
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    tipo: str
    nivel: str
    mensaje: str
    canal: str = "interno"

class AlertCreate(AlertBase):
    process_id: int
    user_id: int

class AlertResponse(AlertBase):
    id: int
    process_id: int
    user_id: int
    leida: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    leida: bool

class NotificationPreferenceBase(BaseModel):
    email_enabled: bool = True
    whatsapp_enabled: bool = False
    preferred_channel: str = "interno"

class NotificationPreferenceCreate(NotificationPreferenceBase):
    user_id: int

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    action_type: str
    description: str
    metadata_json: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: int
    process_id: Optional[int] = None

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: int
    process_id: Optional[int]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CommunicationHistoryBase(BaseModel):
    audience: str
    channel: str
    message: str

class CommunicationHistoryCreate(CommunicationHistoryBase):
    process_id: int
    user_id: int

class CommunicationHistoryResponse(CommunicationHistoryBase):
    id: int
    process_id: int
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class EmailLogBase(BaseModel):
    to_email: str
    to_name: str
    subject: str
    email_type: str
    sent_successfully: bool = False
    error_message: Optional[str] = None

class EmailLogCreate(EmailLogBase):
    process_id: Optional[int] = None

class EmailLogResponse(EmailLogBase):
    id: int
    process_id: Optional[int]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ClientTaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=5, max_length=1500)
    priority: str = Field(default="MEDIA")
    due_date: Optional[datetime.date] = None

    @validator("priority")
    def validate_priority(cls, value):
        allowed = {"ALTA", "MEDIA", "BAJA"}
        if value not in allowed:
            raise ValueError(f"priority debe ser uno de: {', '.join(sorted(allowed))}")
        return value


class ClientTaskCreate(ClientTaskBase):
    radicado: str = Field(..., min_length=23, max_length=23)

    @validator("radicado")
    def validate_task_radicado(cls, value):
        if not value.isdigit():
            raise ValueError("El radicado debe contener solo numeros")
        return value


class ClientTaskStatusUpdate(BaseModel):
    status: str

    @validator("status")
    def validate_status(cls, value):
        allowed = {"PENDIENTE", "EN_PROCESO", "COMPLETADA"}
        if value not in allowed:
            raise ValueError(f"status debe ser uno de: {', '.join(sorted(allowed))}")
        return value


class ClientTaskResponse(ClientTaskBase):
    id: int
    process_id: int
    assigned_by_id: int
    client_id: int
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class ClientTaskCreateResponse(BaseModel):
    task: ClientTaskResponse
    communication_id: int
    communication_channel: str
    email_subject: str
    email_preview: str
