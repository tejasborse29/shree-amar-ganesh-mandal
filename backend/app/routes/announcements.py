import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.utils.helpers import serialize_doc, serialize_docs

announcements_bp = Blueprint("announcements", __name__, url_prefix="/api/announcements")

@announcements_bp.route("", methods=["GET"])
@token_required
def get_announcements():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    items = list(db.db.announcements.find({"festivalYear": festival_year}).sort("createdAt", -1))
    return jsonify({"success": True, "announcements": serialize_docs(items)}), 200

@announcements_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "event_manager")
def create_announcement():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    message = data.get("message", "").strip()
    
    if not title or not message:
        return jsonify({"success": False, "message": "शीर्षक आणि संदेश आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    announcement_doc = {
        "festivalYear": festival_year,
        "title": title,
        "message": message,
        "priority": data.get("priority", "medium"), # low, medium, high, urgent
        "active": data.get("active", True),
        "publishDate": now,
        "expiryDate": datetime.datetime.fromisoformat(data.get("expiryDate")) if data.get("expiryDate") else None,
        "createdBy": g.current_user.get("name"),
        "createdAt": now
    }
    
    res = db.db.announcements.insert_one(announcement_doc)
    announcement_doc["_id"] = res.inserted_id
    
    return jsonify({
        "success": True,
        "message": "सूचना यशस्वीपणे प्रसिद्ध करण्यात आली",
        "announcement": serialize_doc(announcement_doc)
    }), 201

@announcements_bp.route("/<id>/toggle", methods=["PATCH"])
@token_required
@role_required("super_admin", "event_manager")
def toggle_announcement(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    item = db.db.announcements.find_one({"_id": ObjectId(id)})
    if not item:
        return jsonify({"success": False, "message": "सूचना आढळली नाही"}), 404
        
    new_state = not item.get("active", True)
    db.db.announcements.update_one({"_id": ObjectId(id)}, {"$set": {"active": new_state}})
    return jsonify({"success": True, "active": new_state}), 200

@announcements_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin", "event_manager")
def delete_announcement(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
    db.db.announcements.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "सूचना हटवली गेली"}), 200
