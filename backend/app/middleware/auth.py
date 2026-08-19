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
        if "error" in decoded:
            return jsonify({
                "success": False,
                "message": f"टोकन त्रुटी: {decoded['error']} (Session expired, please login again)",
                "error_code": "TOKEN_INVALID"
            }), 401
        
        # Load user from db to ensure active status
        try:
            user = db.db.users.find_one({"_id": ObjectId(decoded["sub"])})
            if not user or not user.get("isActive", True):
                return jsonify({
                    "success": False,
                    "message": "वापरकर्ता निष्क्रिय किंवा अस्तित्वात नाही (User deactivated)",
                    "error_code": "USER_INACTIVE"
                }), 403
            
            # Attach user to Flask context g
            g.current_user = {
                "id": str(user["_id"]),
                "username": user.get("username"),
                "name": user.get("name"),
                "role": user.get("role", "volunteer"),
                "department": user.get("department", "General"),
                "mobile": user.get("mobile", "")
            }
        except Exception as e:
            return jsonify({
                "success": False,
                "message": "प्रमाणीकरणात त्रुटी आली (Database lookup error)",
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
                    "message": "या कृतीसाठी आपल्याकडे परवानगी नाही (Insufficient permissions for role: " + user_role + ")",
                    "error_code": "FORBIDDEN"
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
