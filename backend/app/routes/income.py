import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

income_bp = Blueprint("income", __name__, url_prefix="/api/income")

@income_bp.route("", methods=["GET"])
@token_required
def get_income_list():
    category = request.args.get("category")
    payment_mode = request.args.get("paymentMode")
    festival_year = request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR)
    search = request.args.get("search", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    
    query = {"festivalYear": int(festival_year)}
    if category:
        query["category"] = category
    if payment_mode:
        query["paymentMode"] = payment_mode.lower()
        
    if search:
        query["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"donorName": {"$regex": search, "$options": "i"}},
            {"referenceNumber": {"$regex": search, "$options": "i"}},
            {"receiptNumber": {"$regex": search, "$options": "i"}}
        ]
        
    total = db.db.income.count_documents(query)
    items = list(
        db.db.income.find(query)
        .sort("date", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    
    return jsonify({
        "success": True,
        "income": serialize_docs(items),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }), 200

@income_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def add_income():
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    category = data.get("category", "Vargani").strip()
    description = data.get("description", "").strip()
    
    if amount <= 0 or not category:
        return jsonify({"success": False, "message": "वैध रक्कम आणि प्रवर्ग आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    income_doc = {
        "festivalYear": festival_year,
        "date": datetime.datetime.fromisoformat(data.get("date")) if data.get("date") else now,
        "category": category,
        "amount": amount,
        "description": description,
        "paymentMode": data.get("paymentMode", "cash").lower(),
        "referenceNumber": data.get("referenceNumber", "").strip(),
        "donorName": data.get("donorName", "").strip(),
        "status": "ACTIVE",
        "addedBy": g.current_user.get("id"),
        "addedByName": g.current_user.get("name"),
        "createdAt": now
    }
    
    res = db.db.income.insert_one(income_doc)
    income_doc["_id"] = res.inserted_id
    
    log_audit_action(
        user_info=g.current_user,
        action="INCOME_ADDED",
        target_type="income",
        target_id=str(res.inserted_id),
        details={"amount": amount, "category": category, "description": description}
    )
    
    return jsonify({
        "success": True,
        "message": "जमा रक्कम यशस्वीपणे नोंदवली गेली आहे",
        "income": serialize_doc(income_doc)
    }), 201

@income_bp.route("/<id>/cancel", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def cancel_income(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()
    now = datetime.datetime.now(datetime.timezone.utc)
    
    db.db.income.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "CANCELLED",
                "cancelledBy": g.current_user.get("id"),
                "cancelledByName": g.current_user.get("name"),
                "cancelledReason": reason,
                "cancelledAt": now
            }
        }
    )
    
    log_audit_action(
        user_info=g.current_user,
        action="INCOME_CANCELLED",
        target_type="income",
        target_id=id,
        details={"reason": reason}
    )
    
    return jsonify({"success": True, "message": "जमा नोंद रद्द करण्यात आली"}), 200
