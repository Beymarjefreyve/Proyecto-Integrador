from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import auth, vault
from app.db.session import engine, Base

# Import models to ensure they are registered with SQLAlchemy
from app.models import user, vault as vault_model, device

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-device synchronization backend for SecureVault. Zero-Knowledge architecture.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Typical Vite dev server
    "http://localhost:3000",
    "*"  # Allows all origins for development. In production, restrict this.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(vault.router, prefix="/vault", tags=["vault"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SecureVault API"}
