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
    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503
    users = list(database.users.find({}, {"passwordHash": 0}).sort("createdAt", -1))
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
        
    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503

    existing = database.users.find_one({"username": username})
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
    
    res = database.users.insert_one(user_doc)
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
    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503

    existing_user = database.users.find_one({"_id": ObjectId(id)})
    if not existing_user:
        return jsonify({"success": False, "message": "वापरकर्ता सापडला नाही"}), 404

    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_doc = {
        "updatedAt": now
    }
    if "name" in data and data["name"].strip():
        update_doc["name"] = data["name"].strip()
    if "username" in data and data["username"].strip():
        new_username = data["username"].strip()
        # Check uniqueness if username changed
        if new_username != existing_user.get("username"):
            conflict = database.users.find_one({"username": new_username, "_id": {"$ne": ObjectId(id)}})
            if conflict:
                return jsonify({"success": False, "message": "हे वापरकर्तानाव आधीच वापरात आहे"}), 409
            update_doc["username"] = new_username
    if "role" in data:
        update_doc["role"] = data["role"]
    if "department" in data:
        update_doc["department"] = data["department"]
    if "mobile" in data:
        update_doc["mobile"] = str(data["mobile"]).strip()
    if "email" in data:
        update_doc["email"] = str(data["email"]).strip()
    if "isActive" in data:
        update_doc["isActive"] = bool(data["isActive"])
        
    if data.get("password") and len(str(data["password"]).strip()) > 0:
        update_doc["passwordHash"] = hash_password(str(data["password"]).strip())
        
    database.users.update_one({"_id": ObjectId(id)}, {"$set": update_doc})
    
    log_audit_action(
        user_info=g.current_user,
        action="USER_UPDATED",
        target_type="user",
        target_id=str(id),
        details={"name": update_doc.get("name"), "username": update_doc.get("username")}
    )
    return jsonify({"success": True, "message": "वापरकर्ता माहिती यशस्वीपणे अद्यतनित झाली!"}), 200

@users_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin")
def delete_user(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503

    user = database.users.find_one({"_id": ObjectId(id)})
    if not user:
        return jsonify({"success": False, "message": "वापरकर्ता सापडला नाही"}), 404
        
    if user.get("role") == "super_admin" and user.get("username") == "admin":
        return jsonify({"success": False, "message": "मुख्य ॲडमिन खाते हटवता येणार नाही"}), 400

    database.users.delete_one({"_id": ObjectId(id)})
    log_audit_action(
        user_info=g.current_user,
        action="USER_DELETED",
        target_type="user",
        target_id=str(id),
        details={"username": user.get("username"), "name": user.get("name")}
    )
    return jsonify({"success": True, "message": "वापरकर्ता यशस्वीरीत्या हटवला गेला."}), 200
