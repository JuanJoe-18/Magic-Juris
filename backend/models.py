from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
