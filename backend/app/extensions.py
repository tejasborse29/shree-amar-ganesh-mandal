import datetime
import jwt
import bcrypt
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import Config

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False

    def init_app(self, app):
        mongo_uri = app.config.get("MONGO_URI", Config.MONGO_URI)
        db_name = app.config.get("DB_NAME", Config.DB_NAME)
        
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=15000, connectTimeoutMS=15000)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            self.is_connected = True
            app.logger.info(f"Connected to MongoDB: {db_name}")
            self.create_indexes()
        except Exception as e:
            app.logger.error(f"MongoDB connection failed: {e}")
            self.is_connected = False
            # Still initialize db handle so operations can fail gracefully or fallback
            self.db = self.client[db_name] if self.client else None

    def create_indexes(self):
        if self.db is None:
            return
        try:
            # Users unique index
            self.db.users.create_index("username", unique=True)
            self.db.users.create_index("email", sparse=True)
            
            # Receipts unique index
            self.db.receipts.create_index("receiptNumber", unique=True)
            self.db.receipts.create_index("donorMobile")
            self.db.receipts.create_index("festivalYear")
            self.db.receipts.create_index("createdAt")
            
            # Members unique index
            self.db.members.create_index("memberId", unique=True)
            self.db.members.create_index("mobile")
            
            # Financial indexes
            self.db.income.create_index("festivalYear")
            self.db.income.create_index("date")
            self.db.expenses.create_index("festivalYear")
            self.db.expenses.create_index("category")
            
            # Tasks indexes
            self.db.tasks.create_index("assignedTo")
            self.db.tasks.create_index("status")
            
            # Events & Announcements
            self.db.events.create_index("festivalYear")
            self.db.announcements.create_index("active")
            self.db.gallery.create_index("festivalYear")
            
            # Audit log
            self.db.audit_logs.create_index("timestamp")
        except Exception as e:
            print(f"Warning: Index creation partial error: {e}")

db = Database()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    if not hashed_password or not password:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_jwt_token(user_data: dict, expires_in_hours: int = 24) -> str:
    payload = {
        "sub": str(user_data.get("_id") or user_data.get("id")),
        "username": user_data.get("username"),
        "role": user_data.get("role"),
        "name": user_data.get("name"),
        "department": user_data.get("department", "General"),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=expires_in_hours),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}
