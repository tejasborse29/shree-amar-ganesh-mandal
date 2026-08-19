import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db, hash_password
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

users_bp = Blueprint("users", __name__, url_prefix="/api/users")

@users_bp.route("", methods=["GET"])
@token_required
@role_required("super_admin")
def get_all_users():
    users = list(db.db.users.find({}, {"passwordHash": 0}).sort("createdAt", -1))
    return jsonify({"success": True, "users": serialize_docs(users)}), 200

@users_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin")
def create_user():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    name = data.get("name", "").strip()
    password = data.get("password", "")
    role = data.get("role", "volunteer")
    
    if not username or not name or not password:
        return jsonify({"success": False, "message": "वापरकर्तानाव, नाव आणि पासवर्ड आवश्यक आहे"}), 400
        
    existing = db.db.users.find_one({"username": username})
    if existing:
        return jsonify({"success": False, "message": "हे वापरकर्तानाव आधीच वापरात आहे"}), 409
        
    now = datetime.datetime.now(datetime.timezone.utc)
    user_doc = {
        "username": username,
        "name": name,
        "passwordHash": hash_password(password),
        "role": role,
        "department": data.get("department", "General"),
        "mobile": data.get("mobile", "").strip(),
        "email": data.get("email", "").strip(),
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    del user_doc["passwordHash"]
    
    log_audit_action(
        user_info=g.current_user,
        action="USER_CREATED",
        target_type="user",
        target_id=str(res.inserted_id),
        details={"username": username, "role": role, "name": name}
    )
    
    return jsonify({"success": True, "message": "वापरकर्ता तयार झाला", "user": serialize_doc(user_doc)}), 201

@users_bp.route("/<id>", methods=["PUT"])
@token_required
@role_required("super_admin")
def update_user(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_doc = {
        "name": data.get("name", "").strip(),
        "role": data.get("role"),
        "department": data.get("department", "General"),
        "mobile": data.get("mobile", "").strip(),
        "email": data.get("email", "").strip(),
        "isActive": data.get("isActive", True),
        "updatedAt": now
    }
    
    if data.get("password"):
        update_doc["passwordHash"] = hash_password(data.get("password"))
        
    db.db.users.update_one({"_id": ObjectId(id)}, {"$set": update_doc})
    return jsonify({"success": True, "message": "वापरकर्ता अद्यतनित झाला"}), 200
