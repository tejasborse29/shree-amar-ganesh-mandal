from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db, verify_password, hash_password, generate_jwt_token
from app.middleware.auth import token_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")
    
    if not identifier or not password:
        return jsonify({
            "success": False,
            "message": "कृपया वापरकर्तानाव/मोबाईल आणि पासवर्ड प्रविष्ट करा (Please enter credentials)"
        }), 400
        
    # Find user by username, mobile, or email
    user = db.db.users.find_one({
        "$or": [
            {"username": identifier},
            {"mobile": identifier},
            {"email": identifier}
        ]
    })
    
    if not user:
        return jsonify({
            "success": False,
            "message": "वापरकर्ता आढळला नाही किंवा माहिती चुकीची आहे (Invalid user credentials)"
        }), 401
        
    if not user.get("isActive", True):
        return jsonify({
            "success": False,
            "message": "आपले खाते निष्क्रिय करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा (Account disabled)"
        }), 403
        
    if not verify_password(password, user.get("passwordHash", "")):
        return jsonify({
            "success": False,
            "message": "पासवर्ड चुकीचा आहे (Incorrect password)"
        }), 401
        
    # Generate Token
    user_info = {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "name": user.get("name"),
        "role": user.get("role", "volunteer"),
        "department": user.get("department", "General"),
        "mobile": user.get("mobile", ""),
        "email": user.get("email", "")
    }
    
    token = generate_jwt_token(user_info)
    
    # Audit log
    log_audit_action(
        user_info=user_info,
        action="LOGIN",
        target_type="user",
        target_id=str(user["_id"]),
        details={"identifier": identifier}
    )
    
    return jsonify({
        "success": True,
        "message": f"स्वागत आहे, {user.get('name')}!",
        "token": token,
        "user": user_info
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    user = db.db.users.find_one({"_id": ObjectId(g.current_user["id"])}, {"passwordHash": 0})
    return jsonify({
        "success": True,
        "user": serialize_doc(user)
    }), 200

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.get_json() or {}
    old_password = data.get("oldPassword", "")
    new_password = data.get("newPassword", "")
    
    if not old_password or not new_password or len(new_password) < 6:
        return jsonify({
            "success": False,
            "message": "नवीन पासवर्ड किमान 6 अक्षरांचा असावा (New password must be at least 6 characters)"
        }), 400
        
    user = db.db.users.find_one({"_id": ObjectId(g.current_user["id"])})
    if not verify_password(old_password, user.get("passwordHash", "")):
        return jsonify({
            "success": False,
            "message": "जुना पासवर्ड चुकीचा आहे (Old password incorrect)"
        }), 400
        
    new_hash = hash_password(new_password)
    db.db.users.update_one(
        {"_id": ObjectId(g.current_user["id"])},
        {"$set": {"passwordHash": new_hash}}
    )
    
    log_audit_action(
        user_info=g.current_user,
        action="PASSWORD_CHANGED",
        target_type="user",
        target_id=g.current_user["id"]
    )
    
    return jsonify({
        "success": True,
        "message": "पासवर्ड यशस्वीपणे बदलला आहे (Password updated successfully)"
    }), 200
