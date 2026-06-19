from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import auth_utils
import deps
import models
import schemas

router = APIRouter()


def _ensure_unique_email(db: Session, email: str, exclude_user_id: int | None = None):
    query = db.query(models.User).filter(models.User.email == email)
    if exclude_user_id is not None:
        query = query.filter(models.User.id != exclude_user_id)
    if query.first():
        raise HTTPException(status_code=400, detail="Email already registered")


def _upsert_lawyer_profile(db: Session, user_id: int, tarjeta_profesional: str | None):
    profile = db.query(models.LawyerProfile).filter(models.LawyerProfile.user_id == user_id).first()
    if profile:
        profile.tarjeta_profesional = tarjeta_profesional
    else:
        db.add(models.LawyerProfile(user_id=user_id, tarjeta_profesional=tarjeta_profesional))


@router.get("/", response_model=List[schemas.UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if current_user.role != "ADMINISTRATIVO" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register-request", response_model=schemas.UserRegistrationResponse)
def create_registration_request(request: schemas.UserRegistrationRequest, db: Session = Depends(deps.get_db)):
    if not request.accepted_policy:
        raise HTTPException(status_code=400, detail="Debe aceptar la politica de tratamiento de datos")

    _ensure_unique_email(db, request.email)

    new_user = models.User(
        name=request.name,
        email=request.email,
        password_hash=auth_utils.get_password_hash(request.password),
        role=request.role,
        is_active=False,
    )
    db.add(new_user)
    db.flush()

    if request.role == "ABOGADO":
        _upsert_lawyer_profile(db, new_user.id, request.tarjeta_profesional)

    db.add(
        models.AuditLog(
            user_id=new_user.id,
            process_id=None,
            action_type="register_request",
            description=f"Solicitud de registro creada para {request.email}",
            metadata_json=f'{{"role": "{request.role}", "approved": false}}',
        )
    )

    db.commit()
    return schemas.UserRegistrationResponse(
        message="Solicitud de registro recibida. Un administrador debera validar la cuenta antes de habilitar el acceso.",
        user_id=new_user.id,
    )


@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin),
):
    _ensure_unique_email(db, user.email)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth_utils.get_password_hash(user.password),
        role=user.role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    if user.role == "ABOGADO":
        _upsert_lawyer_profile(db, new_user.id, user.tarjeta_profesional)

    db.add(
        models.AuditLog(
            user_id=current_admin.id,
            process_id=None,
            action_type="user_created",
            description=f"Usuario {user.email} creado por administrativo",
            metadata_json=f'{{"new_user_id": {new_user.id}, "role": "{user.role}"}}',
        )
    )

    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.email is not None:
        _ensure_unique_email(db, user_update.email, exclude_user_id=user.id)
        user.email = user_update.email
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    if user.role == "ABOGADO" and user_update.tarjeta_profesional is not None:
        _upsert_lawyer_profile(db, user.id, user_update.tarjeta_profesional)

    db.add(
        models.AuditLog(
            user_id=current_admin.id,
            process_id=None,
            action_type="user_updated",
            description=f"Usuario {user.email} actualizado por administrativo",
        )
    )

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int,
    role_update: schemas.UserRoleUpdate,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    previous_role = user.role
    user.role = role_update.role
    if role_update.role == "ABOGADO":
        _upsert_lawyer_profile(db, user.id, None)

    db.add(
        models.AuditLog(
            user_id=current_admin.id,
            process_id=None,
            action_type="user_role_updated",
            description=f"Rol de usuario {user.email} cambiado de {previous_role} a {role_update.role}",
        )
    )
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/activate", response_model=schemas.UserResponse)
def activate_user(
    user_id: int,
    activation: schemas.UserActivationUpdate,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = activation.is_active
    action_type = "user_approved" if activation.is_active else "user_deactivated"
    description = (
        f"Cuenta {user.email} aprobada por administrativo"
        if activation.is_active
        else f"Cuenta {user.email} desactivada por administrativo"
    )
    db.add(
        models.AuditLog(
            user_id=current_admin.id,
            process_id=None,
            action_type=action_type,
            description=description,
        )
    )
    db.commit()
    db.refresh(user)
    return user
