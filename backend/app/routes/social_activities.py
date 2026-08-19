import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.middleware.auth import token_required, role_required
from app.utils.helpers import serialize_doc, serialize_docs

social_bp = Blueprint("social", __name__, url_prefix="/api/social-activities")

@social_bp.route("", methods=["GET"])
@token_required
def get_all_social_activities():
    activities = list(db.db.social_activities.find().sort("order", 1))
    return jsonify({"success": True, "activities": serialize_docs(activities)}), 200

@social_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "event_manager")
def create_social_activity():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    stat_number = data.get("statNumber", "").strip()
    stat_label = data.get("statLabel", "").strip()
    
    if not title or not stat_number:
        return jsonify({"success": False, "message": "उपक्रमाचे नाव आणि आकडेवारी आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    doc = {
        "title": title,
        "statNumber": stat_number, # e.g. "120+"
        "statLabel": stat_label,   # e.g. "रक्तदाते (Blood Donors)"
        "description": data.get("description", "").strip(),
        "imageUrl": data.get("imageUrl", ""),
        "active": data.get("active", True),
        "order": int(data.get("order", 0)),
        "createdAt": now
    }
    
    res = db.db.social_activities.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    return jsonify({
        "success": True,
        "message": "सामाजिक उपक्रम यशस्वीपणे जोडला गेला",
        "activity": serialize_doc(doc)
    }), 201

@social_bp.route("/<id>", methods=["PUT"])
@token_required
@role_required("super_admin", "event_manager")
def update_social_activity(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    update_doc = {
        "title": data.get("title", "").strip(),
        "statNumber": data.get("statNumber", "").strip(),
        "statLabel": data.get("statLabel", "").strip(),
        "description": data.get("description", "").strip(),
        "imageUrl": data.get("imageUrl", ""),
        "active": data.get("active", True),
        "order": int(data.get("order", 0))
    }
    db.db.social_activities.update_one({"_id": ObjectId(id)}, {"$set": update_doc})
    return jsonify({"success": True, "message": "उपक्रम अद्यतनित झाला"}), 200

@social_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin")
def delete_social_activity(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
    db.db.social_activities.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "उपक्रम हटवला गेला"}), 200
