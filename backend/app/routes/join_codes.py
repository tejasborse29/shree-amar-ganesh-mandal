import datetime
import random
import string
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

join_codes_bp = Blueprint("join_codes", __name__, url_prefix="/api/join-codes")

DEFAULT_MANDAL_CODE = {
    "code": "MND-AMGM",
    "role": "worker",
    "roleLabel": "मंडळ कार्यकर्ता (Worker)",
    "description": "श्री अमर गणेश मित्र मंडळ मुख्य जॉइन कोड २०२६",
    "isActive": True,
    "maxUses": 100,
    "usedCount": 5,
    "createdBy": "Super Admin"
}

def ensure_default_join_code():
    if db.db is None:
        return
    count = db.db.join_codes.count_documents({})
    if count == 0:
        now = datetime.datetime.now(datetime.timezone.utc)
        doc = dict(DEFAULT_MANDAL_CODE)
        doc["createdAt"] = now
        doc["updatedAt"] = now
        db.db.join_codes.insert_one(doc)

@join_codes_bp.route("", methods=["GET"])
@token_required
@role_required("super_admin", "admin")
def get_join_codes():
    ensure_default_join_code()
    codes = list(db.db.join_codes.find().sort("createdAt", -1))
    return jsonify({
        "success": True,
        "joinCodes": serialize_docs(codes),
        "primaryMandalCode": "MND-AMGM"
    }), 200

@join_codes_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin")
def create_join_code():
    data = request.get_json() or {}
    role = data.get("role", "volunteer")
    description = data.get("description", "नवीन कार्यकर्ता जॉइन कोड")
    max_uses = int(data.get("maxUses", 50))
    
    # Generate randomized 4-char suffix e.g. MND-AMGM-8721
    suffix = ''.join(random.choices(string.digits + string.ascii_uppercase, k=4))
    code = f"MND-AMGM-{suffix}"
    
    role_labels = {
        "volunteer": "मंडळ कार्यकर्ता (Worker)",
        "receipt_manager": "पावती प्रमुख (Receipt Mgr)",
        "event_manager": "कार्यक्रम प्रमुख (Event Mgr)",
        "treasurer": "खजिनदार (Treasurer)",
        "viewer": "वाचक (Viewer)"
    }
    
    now = datetime.datetime.now(datetime.timezone.utc)
    new_code = {
        "code": code,
        "role": role,
        "roleLabel": role_labels.get(role, "कार्यकर्ता"),
        "description": description,
        "isActive": True,
        "maxUses": max_uses,
        "usedCount": 0,
        "createdBy": g.current_user.get("name", "Admin"),
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.join_codes.insert_one(new_code)
    new_code["_id"] = res.inserted_id
    
    log_audit_action(
        action="JOIN_CODE_CREATE",
        target_entity="join_codes",
        entity_id=str(res.inserted_id),
        details={"code": code, "role": role},
        user_info=g.current_user
    )
    
    return jsonify({
        "success": True,
        "message": f"नवीन जॉइन कोड '{code}' तयार झाला आहे!",
        "joinCode": serialize_doc(new_code)
    }), 201

@join_codes_bp.route("/<id>/toggle", methods=["PATCH"])
@token_required
@role_required("super_admin")
def toggle_join_code(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध आयडी"}), 400
        
    code_doc = db.db.join_codes.find_one({"_id": ObjectId(id)})
    if not code_doc:
        return jsonify({"success": False, "message": "कोड आढळला नाही"}), 404
        
    new_status = not code_doc.get("isActive", True)
    now = datetime.datetime.now(datetime.timezone.utc)
    db.db.join_codes.update_one({"_id": ObjectId(id)}, {"$set": {"isActive": new_status, "updatedAt": now}})
    
    return jsonify({
        "success": True,
        "message": f"कोड {'सक्रिय' if new_status else 'निष्क्रिय'} करण्यात आला आहे.",
        "isActive": new_status
    }), 200
