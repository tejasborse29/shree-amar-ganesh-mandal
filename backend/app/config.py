import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "AMGM_SUPER_SECRET_KEY_2026_GANESH_UTSAV_MANDAL_SECURE_AUTH")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "AMGM_JWT_SECRET_TOKEN_AUTH_2026_SECURE_SHA256_KEY")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    
    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db?retryWrites=true&w=majority&appName=Cluster0")
    DB_NAME = os.getenv("DB_NAME", "shree_amar_ganesh_db")
    
    # Uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)) # 16 MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "pdf"}
    
    # Defaults
    DEFAULT_FESTIVAL_YEAR = int(os.getenv("DEFAULT_FESTIVAL_YEAR", 2026))
    MANDAL_NAME = "श्री अमर गणेश मित्र मंडळ"
    MANDAL_TAGLINE = "भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!"
    MANDAL_RECEIPT_PREFIX = "AMGM"
