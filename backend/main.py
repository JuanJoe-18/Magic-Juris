from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, processes, actuaciones, alerts, audit

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Magic-Juris API"}
