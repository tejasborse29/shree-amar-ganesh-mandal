import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

expenses_bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")

@expenses_bp.route("", methods=["GET"])
@token_required
def get_expenses():
    category = request.args.get("category")
    vendor = request.args.get("vendor")
    festival_year = request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR)
    search = request.args.get("search", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    
    query = {"festivalYear": int(festival_year)}
    if category:
        query["category"] = category
    if vendor:
        query["vendor"] = {"$regex": vendor, "$options": "i"}
        
    if search:
        query["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"vendor": {"$regex": search, "$options": "i"}},
            {"billNumber": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
        
    total = db.db.expenses.count_documents(query)
    expenses = list(
        db.db.expenses.find(query)
        .sort("date", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    
    return jsonify({
        "success": True,
        "expenses": serialize_docs(expenses),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }), 200

@expenses_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def add_expense():
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()
    vendor = data.get("vendor", "").strip()
    
    if amount <= 0 or not category or not description:
        return jsonify({"success": False, "message": "वैध रक्कम, प्रवर्ग आणि तपशील आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    expense_doc = {
        "festivalYear": festival_year,
        "date": datetime.datetime.fromisoformat(data.get("date")) if data.get("date") else now,
        "category": category,
        "amount": amount,
        "description": description,
        "vendor": vendor,
        "billNumber": data.get("billNumber", "").strip(),
        "paymentMode": data.get("paymentMode", "cash").lower(),
        "billAttachmentUrl": data.get("billAttachmentUrl", ""),
        "status": "ACTIVE",
        "addedBy": g.current_user.get("id"),
        "addedByName": g.current_user.get("name"),
        "createdAt": now
    }
    
    res = db.db.expenses.insert_one(expense_doc)
    expense_doc["_id"] = res.inserted_id
    
    log_audit_action(
        user_info=g.current_user,
        action="EXPENSE_ADDED",
        target_type="expense",
        target_id=str(res.inserted_id),
        details={"amount": amount, "category": category, "vendor": vendor, "description": description}
    )
    
    return jsonify({
        "success": True,
        "message": "खर्च यशस्वीपणे नोंदवला गेला आहे",
        "expense": serialize_doc(expense_doc)
    }), 201

@expenses_bp.route("/<id>/cancel", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def cancel_expense(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()
    now = datetime.datetime.now(datetime.timezone.utc)
    
    db.db.expenses.update_one(
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
        action="EXPENSE_CANCELLED",
        target_type="expense",
        target_id=id,
        details={"reason": reason}
    )
    
    return jsonify({"success": True, "message": "खर्च नोंद रद्द करण्यात आली"}), 200
