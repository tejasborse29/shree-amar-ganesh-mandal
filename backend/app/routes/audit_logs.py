from flask import Blueprint, request, jsonify
from app.extensions import db
from app.middleware.auth import token_required, role_required
from app.utils.helpers import serialize_docs

audit_bp = Blueprint("audit_logs", __name__, url_prefix="/api/audit-logs")

@audit_bp.route("", methods=["GET"])
@token_required
@role_required("super_admin")
def get_audit_logs():
    action = request.args.get("action")
    user = request.args.get("user")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    
    query = {}
    if action:
        query["action"] = action
    if user:
        query["$or"] = [
            {"username": {"$regex": user, "$options": "i"}},
            {"userName": {"$regex": user, "$options": "i"}}
        ]
        
    total = db.db.audit_logs.count_documents(query)
    logs = list(
        db.db.audit_logs.find(query)
        .sort("timestamp", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    
    return jsonify({
        "success": True,
        "logs": serialize_docs(logs),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }), 200
