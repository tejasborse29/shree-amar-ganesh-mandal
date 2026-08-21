from functools import wraps
from flask import request, jsonify, g
from bson import ObjectId
from app.extensions import decode_jwt_token, db

# Role Hierarchy / Group Permissions
ROLE_PERMISSIONS = {
    "super_admin": ["all"],
    "treasurer": ["finance", "receipts", "reports", "dashboard", "members", "events_view", "tasks"],
    "receipt_manager": ["receipts", "members", "collection_view", "dashboard"],
    "event_manager": ["events", "announcements", "gallery", "tasks", "dashboard"],
    "volunteer": ["tasks", "dashboard", "events_view"]
}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({
                "success": False,
                "message": "प्रमाणीकरण आवश्यक आहे (Authentication token missing)",
                "error_code": "AUTH_REQUIRED"
            }), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "message": "अवैध टोकन स्वरूप (Invalid token format)",
                "error_code": "INVALID_TOKEN_FORMAT"
            }), 401
        
        token = parts[1]
        decoded = decode_jwt_token(token)
        if not decoded or "error" in decoded or "sub" not in decoded:
            err_msg = decoded.get("error", "Invalid token") if isinstance(decoded, dict) else "Invalid token"
            return jsonify({
                "success": False,
                "message": f"टोकन त्रुटी: {err_msg} (Session expired, please login again)",
                "error_code": "TOKEN_INVALID"
            }), 401
        
        # Load user from db to ensure active status
        try:
            database = db.get_db()
            user = None
            if database is not None:
                try:
                    user = database.users.find_one({"_id": ObjectId(decoded["sub"])})
                except Exception:
                    user = database.users.find_one({"username": decoded.get("username")})
            
            # If user found in database
            if user:
                if not user.get("isActive", True):
                    return jsonify({
                        "success": False,
                        "message": "वापरकर्ता निष्क्रिय करण्यात आला आहे (User deactivated)",
                        "error_code": "USER_INACTIVE"
                    }), 403
                
                user_id = str(user["_id"])
                user_info = {
                    "id": user_id,
                    "username": user.get("username", decoded.get("username")),
                    "name": user.get("name", decoded.get("name", "User")),
                    "role": user.get("role", decoded.get("role", "volunteer")),
                    "department": user.get("department", decoded.get("department", "General")),
                    "mobile": user.get("mobile", "")
                }
            else:
                # Fallback to token payload if db is temporarily reconnecting
                user_id = str(decoded.get("sub", ""))
                user_info = {
                    "id": user_id,
                    "username": decoded.get("username", "user"),
                    "name": decoded.get("name", "User"),
                    "role": decoded.get("role", "volunteer"),
                    "department": decoded.get("department", "General"),
                    "mobile": decoded.get("mobile", "")
                }
            
            # Attach user to Flask context g
            g.user_id = user_id
            g.user = user
            g.current_user = user_info
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"प्रमाणीकरणात त्रुटी आली: {str(e)}",
                "error_code": "AUTH_DB_ERROR"
            }), 500
            
        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, "current_user") or not g.current_user:
                return jsonify({
                    "success": False,
                    "message": "प्रमाणीकरण आवश्यक आहे",
                    "error_code": "UNAUTHORIZED"
                }), 401
            
            user_role = g.current_user.get("role")
            if user_role == "super_admin":
                return f(*args, **kwargs) # Super admin can do anything
            
            if allowed_roles and user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "या कृतीसाठी आपल्याकडे परवानगी नाही (Insufficient permissions for role: " + str(user_role) + ")",
                    "error_code": "FORBIDDEN"
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
