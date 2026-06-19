from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_actuaciones():
    return {"message": "Not implemented yet"}
