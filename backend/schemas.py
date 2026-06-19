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

class UserCreate(UserBase):
    password: str
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

class UserRoleUpdate(BaseModel):
    role: str

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
