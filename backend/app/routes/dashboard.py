from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required
from app.services.financial_service import get_financial_summary
from app.utils.helpers import serialize_docs

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/summary", methods=["GET"])
@token_required
def get_dashboard_summary():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    
    # Financial and KPI summary
    summary = get_financial_summary(festival_year)
    
    # User's pending tasks
    user_id = g.current_user["id"]
    user_role = g.current_user["role"]
    
    task_query = {"festivalYear": festival_year, "status": {"$in": ["Pending", "In Progress"]}}
    if user_role == "volunteer":
        task_query["$or"] = [
            {"assignedToUserId": user_id},
            {"assignedToUsername": g.current_user["username"]}
        ]
        
    pending_tasks = list(db.db.tasks.find(task_query).sort("dueDate", 1).limit(5))
    
    # Recent receipts for quick glance
    recent_receipts = list(db.db.receipts.find({"festivalYear": festival_year}).sort("createdAt", -1).limit(5))
    
    # Recent announcements
    recent_announcements = list(db.db.announcements.find({"active": True}).sort("createdAt", -1).limit(3))

    return jsonify({
        "success": True,
        "summary": summary,
        "pendingTasks": serialize_docs(pending_tasks),
        "recentReceipts": serialize_docs(recent_receipts),
        "recentAnnouncements": serialize_docs(recent_announcements),
        "userRole": user_role
    }), 200
