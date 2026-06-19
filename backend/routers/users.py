from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth_utils, deps

router = APIRouter()

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db), current_admin: models.User = Depends(deps.get_current_admin)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role != "ADMINISTRATIVO" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db), current_admin: models.User = Depends(deps.get_current_admin)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, password_hash=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if user.role == "ABOGADO":
        profile = models.LawyerProfile(user_id=new_user.id, tarjeta_profesional=user.tarjeta_profesional)
        db.add(profile)
        db.commit()
        db.refresh(new_user)
        
    return new_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(deps.get_db), current_admin: models.User = Depends(deps.get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
        
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(user_id: int, role_update: schemas.UserRoleUpdate, db: Session = Depends(deps.get_db), current_admin: models.User = Depends(deps.get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user
