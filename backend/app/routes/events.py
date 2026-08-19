import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

@events_bp.route("", methods=["GET"])
@token_required
def get_all_events():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    events = list(db.db.events.find({"festivalYear": festival_year}).sort("date", 1))
    return jsonify({"success": True, "events": serialize_docs(events)}), 200

@events_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "event_manager")
def create_event():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    date_str = data.get("date", "").strip()
    
    if not title or not date_str:
        return jsonify({"success": False, "message": "कार्यक्रमाचे नाव आणि दिनांक आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    event_doc = {
        "festivalYear": festival_year,
        "title": title,
        "description": data.get("description", "").strip(),
        "date": date_str,
        "startTime": data.get("startTime", "09:00 AM"),
        "endTime": data.get("endTime", "11:00 AM"),
        "location": data.get("location", "मंडप परिसर (Mandal Mandap)"),
        "mapUrl": data.get("mapUrl", ""),
        "organizer": data.get("organizer", "समिती"),
        "imageUrl": data.get("imageUrl", ""),
        "isPublished": data.get("isPublished", True),
        "status": data.get("status", "upcoming"),
        "createdBy": g.current_user.get("id"),
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.events.insert_one(event_doc)
    event_doc["_id"] = res.inserted_id
    
    log_audit_action(
        user_info=g.current_user,
        action="EVENT_CREATED",
        target_type="event",
        target_id=str(res.inserted_id),
        details={"title": title, "date": date_str}
    )
    
    return jsonify({
        "success": True,
        "message": "कार्यक्रम यशस्वीपणे जोडला गेला आहे",
        "event": serialize_doc(event_doc)
    }), 201

@events_bp.route("/<id>", methods=["PUT"])
@token_required
@role_required("super_admin", "event_manager")
def update_event(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_doc = {
        "title": data.get("title", "").strip(),
        "description": data.get("description", "").strip(),
        "date": data.get("date", "").strip(),
        "startTime": data.get("startTime", ""),
        "endTime": data.get("endTime", ""),
        "location": data.get("location", ""),
        "mapUrl": data.get("mapUrl", ""),
        "organizer": data.get("organizer", ""),
        "imageUrl": data.get("imageUrl", ""),
        "isPublished": data.get("isPublished", True),
        "status": data.get("status", "upcoming"),
        "updatedAt": now
    }
    
    db.db.events.update_one({"_id": ObjectId(id)}, {"$set": update_doc})
    return jsonify({"success": True, "message": "कार्यक्रम अद्यतनित झाला"}), 200

@events_bp.route("/<id>/publish", methods=["PATCH"])
@token_required
@role_required("super_admin", "event_manager")
def toggle_publish(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    event = db.db.events.find_one({"_id": ObjectId(id)})
    if not event:
        return jsonify({"success": False, "message": "कार्यक्रम आढळला नाही"}), 404
        
    new_state = not event.get("isPublished", True)
    db.db.events.update_one({"_id": ObjectId(id)}, {"$set": {"isPublished": new_state}})
    return jsonify({
        "success": True,
        "message": f"कार्यक्रम {'प्रकाशित' if new_state else 'अप्रकाशित'} केला आहे",
        "isPublished": new_state
    }), 200

@events_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin", "event_manager")
def delete_event(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
        
    db.db.events.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "कार्यक्रम हटवला गेला"}), 200
