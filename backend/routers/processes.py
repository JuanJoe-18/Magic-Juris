from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_processes():
    return {"message": "Not implemented yet"}
