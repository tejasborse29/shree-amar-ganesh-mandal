import datetime
from flask import request
from app.extensions import db

def log_audit_action(user_info=None, action="ACTION", target_type="general", target_id="", details=None, **kwargs):
    """
    Creates an immutable audit log entry in the database.
    Supports both user_info dict and keyword arguments (user_id, username, role, entity_type, etc.)
    """
    database = db.get_db()
    if database is None:
        return
        
    try:
        ip_addr = "127.0.0.1"
        try:
            if request:
                ip_addr = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1").split(",")[0].strip()
        except Exception:
            pass

        u_id = "system"
        u_name = "System"
        u_username = "system"
        u_role = "system"

        if isinstance(user_info, dict):
            u_id = str(user_info.get("id") or user_info.get("_id") or "system")
            u_name = user_info.get("name", "System")
            u_username = user_info.get("username", "system")
            u_role = user_info.get("role", "system")
        elif kwargs.get("user_id"):
            u_id = str(kwargs.get("user_id"))
            u_username = kwargs.get("username", "system")
            u_name = kwargs.get("name", u_username)
            u_role = kwargs.get("role", "system")

        t_type = target_type or kwargs.get("entity_type", "general")
        t_id = str(target_id or kwargs.get("entity_id", ""))
        d_info = details or kwargs.get("details", {})

        log_entry = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "userId": u_id,
            "username": u_username,
            "userName": u_name,
            "userRole": u_role,
            "action": action,
            "targetType": t_type,
            "targetId": t_id,
            "ipAddress": ip_addr,
            "details": d_info
        }
        database.audit_logs.insert_one(log_entry)
    except Exception as e:
        print(f"Warning: Audit log error: {e}")
