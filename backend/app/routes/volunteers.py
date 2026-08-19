import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db, hash_password
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

volunteers_bp = Blueprint("volunteers", __name__, url_prefix="/api/volunteers")

@volunteers_bp.route("", methods=["GET"])
@token_required
def get_volunteers():
    department = request.args.get("department")
    search = request.args.get("search", "").strip()
    
    query = {}
    if department:
        query["department"] = department
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"mobile": {"$regex": search, "$options": "i"}},
            {"role": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}}
        ]
        
    volunteers = list(db.db.users.find(query, {"passwordHash": 0}).sort("name", 1))
    
    # Enrich with task count
    for v in volunteers:
        v_id = str(v["_id"])
        tasks_pending = db.db.tasks.count_documents({
            "$or": [{"assignedToUserId": v_id}, {"assignedToUsername": v.get("username")}],
            "status": {"$in": ["Pending", "In Progress"]}
        })
        v["pendingTasksCount"] = tasks_pending
        
    return jsonify({"success": True, "volunteers": serialize_docs(volunteers)}), 200

@volunteers_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin")
def add_volunteer():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    username = data.get("username", "").strip() or mobile
    password = data.get("password", "Volunteer@AMGM2026")
    role = data.get("role", "volunteer")
    department = data.get("department", "मंडप व्यवस्थापन (Mandap)")
    
    if not name or not mobile:
        return jsonify({"success": False, "message": "नाव आणि मोबाईल नंबर आवश्यक आहे"}), 400
        
    existing = db.db.users.find_one({"$or": [{"username": username}, {"mobile": mobile}]})
    if existing:
        return jsonify({"success": False, "message": "या युजरनेम किंवा मोबाईलवर आधीच खाते अस्तित्वात आहे"}), 409
        
    now = datetime.datetime.now(datetime.timezone.utc)
    user_doc = {
        "name": name,
        "username": username,
        "mobile": mobile,
        "email": data.get("email", "").strip(),
        "passwordHash": hash_password(password),
        "role": role,
        "department": department,
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    del user_doc["passwordHash"]
    
    log_audit_action(
        user_info=g.current_user,
        action="VOLUNTEER_CREATED",
        target_type="user",
        target_id=str(res.inserted_id),
        details={"name": name, "role": role, "department": department}
    )
    
    return jsonify({
        "success": True,
        "message": "कार्यकर्ता यशस्वीपणे जोडला गेला आहे",
        "volunteer": serialize_doc(user_doc)
    }), 201

@volunteers_bp.route("/<id>", methods=["PUT"])
@token_required
@role_required("super_admin")
def update_volunteer(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_doc = {
        "name": data.get("name", "").strip(),
        "mobile": data.get("mobile", "").strip(),
        "email": data.get("email", "").strip(),
        "role": data.get("role", "volunteer"),
        "department": data.get("department", "मंडप"),
        "isActive": data.get("isActive", True),
        "updatedAt": now
    }
    
    if data.get("newPassword"):
        update_doc["passwordHash"] = hash_password(data.get("newPassword"))
        
    db.db.users.update_one({"_id": ObjectId(id)}, {"$set": update_doc})
    return jsonify({"success": True, "message": "कार्यकर्त्याची माहिती अद्यतनित झाली"}), 200
