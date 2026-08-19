import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

@tasks_bp.route("", methods=["GET"])
@token_required
def get_tasks():
    status = request.args.get("status")
    priority = request.args.get("priority")
    department = request.args.get("department")
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    
    query = {"festivalYear": festival_year}
    
    # If role is volunteer, default to assigned tasks unless requested
    if g.current_user["role"] == "volunteer":
        query["$or"] = [
            {"assignedToUserId": g.current_user["id"]},
            {"assignedToUsername": g.current_user["username"]}
        ]
        
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if department:
        query["department"] = department
        
    tasks = list(db.db.tasks.find(query).sort("dueDate", 1))
    return jsonify({"success": True, "tasks": serialize_docs(tasks)}), 200

@tasks_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "event_manager", "treasurer")
def create_task():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"success": False, "message": "कामाचे शीर्षक आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    task_doc = {
        "festivalYear": festival_year,
        "title": title,
        "description": data.get("description", "").strip(),
        "assignedToUserId": data.get("assignedToUserId", ""),
        "assignedToUsername": data.get("assignedToUsername", ""),
        "assignedToName": data.get("assignedToName", "सर्व कार्यकर्ते (All Volunteers)"),
        "department": data.get("department", "व्यवस्थापन / General"),
        "priority": data.get("priority", "Medium"), # Low, Medium, High, Urgent
        "dueDate": data.get("dueDate", ""),
        "status": "Pending", # Pending, In Progress, Completed, Cancelled
        "createdBy": g.current_user.get("id"),
        "createdByName": g.current_user.get("name"),
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.tasks.insert_one(task_doc)
    task_doc["_id"] = res.inserted_id
    
    return jsonify({
        "success": True,
        "message": "काम यशस्वीपणे नेमून दिले आहे",
        "task": serialize_doc(task_doc)
    }), 201

@tasks_bp.route("/<id>/status", methods=["PATCH"])
@token_required
def update_task_status(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status:
        return jsonify({"success": False, "message": "स्थिती आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    db.db.tasks.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": new_status, "updatedAt": now, "lastUpdatedBy": g.current_user["name"]}}
    )
    
    return jsonify({"success": True, "message": "कामाची स्थिती अद्यतनित झाली"}), 200

@tasks_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin")
def delete_task(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
    db.db.tasks.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "काम हटवले गेले"}), 200
