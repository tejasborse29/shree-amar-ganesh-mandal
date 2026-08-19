import datetime
from flask import request
from app.extensions import db

def log_audit_action(user_info: dict, action: str, target_type: str, target_id: str = "", details: dict = None):
    """
    Creates an immutable audit log entry in the database.
    user_info: { id, username, name, role }
    action: e.g. 'LOGIN', 'RECEIPT_CREATED', 'RECEIPT_CANCELLED', 'EXPENSE_ADDED', etc.
    """
    if db.db is None:
        return
        
    try:
        ip_addr = request.remote_addr if request else "system"
        log_entry = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "userId": user_info.get("id") if user_info else "system",
            "username": user_info.get("username") if user_info else "system",
            "userName": user_info.get("name") if user_info else "System",
            "userRole": user_info.get("role") if user_info else "system",
            "action": action,
            "targetType": target_type,
            "targetId": str(target_id),
            "ipAddress": ip_addr,
            "details": details or {}
        }
        db.db.audit_logs.insert_one(log_entry)
    except Exception as e:
        print(f"Warning: Audit log error: {e}")
