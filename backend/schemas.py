from pydantic import BaseModel, EmailStr
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
