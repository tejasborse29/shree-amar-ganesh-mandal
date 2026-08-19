import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

members_bp = Blueprint("members", __name__, url_prefix="/api/members")

@members_bp.route("", methods=["GET"])
@token_required
def get_members():
    search = request.args.get("search", "").strip()
    area = request.args.get("area", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    sort_by = request.args.get("sortBy", "createdAt")
    sort_order = -1 if request.args.get("sortOrder", "desc") == "desc" else 1
    
    query = {}
    if area:
        query["area"] = area
        
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"mobile": {"$regex": search, "$options": "i"}},
            {"memberId": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]
        
    total = db.db.members.count_documents(query)
    members = list(
        db.db.members.find(query)
        .sort(sort_by, sort_order)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    
    return jsonify({
        "success": True,
        "members": serialize_docs(members),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }), 200

@members_bp.route("/<id>", methods=["GET"])
@token_required
def get_member(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध सभासद ओळख"}), 400
        
    member = db.db.members.find_one({"_id": ObjectId(id)})
    if not member:
        return jsonify({"success": False, "message": "सभासद आढळला नाही"}), 404
        
    # Also fetch member's receipts history
    receipts = list(db.db.receipts.find({"donorMobile": member.get("mobile")}).sort("createdAt", -1))
    
    res = serialize_doc(member)
    res["receipts"] = serialize_docs(receipts)
    return jsonify({"success": True, "member": res}), 200

@members_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer", "receipt_manager")
def create_member():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    
    if not name or not mobile:
        return jsonify({"success": False, "message": "नाव आणि मोबाईल नंबर आवश्यक आहे"}), 400
        
    existing = db.db.members.find_one({"mobile": mobile})
    if existing:
        return jsonify({"success": False, "message": f"या मोबाईल नंबरवर आधीच सभासद अस्तित्वात आहे ({existing.get('name')})"}), 409
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    # Counter for member ID
    member_seq = db.db.counters.find_one_and_update(
        {"_id": f"member_{festival_year}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    ).get("seq", 1)
    
    member_doc = {
        "memberId": f"MEM-{festival_year}-{member_seq:04d}",
        "name": name,
        "mobile": mobile,
        "email": data.get("email", "").strip(),
        "address": data.get("address", "").strip(),
        "area": data.get("area", "स्थानिक / Local"),
        "totalContribution": 0.0,
        "assignedCollector": data.get("assignedCollector", g.current_user.get("name")),
        "notes": data.get("notes", "").strip(),
        "status": "active",
        "festivalYear": festival_year,
        "createdAt": now,
        "updatedAt": now
    }
    
    ins = db.db.members.insert_one(member_doc)
    member_doc["_id"] = ins.inserted_id
    
    log_audit_action(
        user_info=g.current_user,
        action="MEMBER_CREATED",
        target_type="member",
        target_id=str(ins.inserted_id),
        details={"name": name, "mobile": mobile, "memberId": member_doc["memberId"]}
    )
    
    return jsonify({
        "success": True,
        "message": "सभासद यशस्वीपणे जोडला गेला आहे",
        "member": serialize_doc(member_doc)
    }), 201

@members_bp.route("/<id>", methods=["PUT"])
@token_required
@role_required("super_admin", "treasurer", "receipt_manager")
def update_member(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध सभासद ओळख"}), 400
        
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_fields = {
        "name": data.get("name", "").strip(),
        "email": data.get("email", "").strip(),
        "address": data.get("address", "").strip(),
        "area": data.get("area", "").strip(),
        "assignedCollector": data.get("assignedCollector", "").strip(),
        "notes": data.get("notes", "").strip(),
        "status": data.get("status", "active"),
        "updatedAt": now
    }
    
    db.db.members.update_one({"_id": ObjectId(id)}, {"$set": update_fields})
    
    log_audit_action(
        user_info=g.current_user,
        action="MEMBER_UPDATED",
        target_type="member",
        target_id=id,
        details=update_fields
    )
    
    return jsonify({"success": True, "message": "सभासदाची माहिती अद्यतनित झाली"}), 200
