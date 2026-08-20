import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

festivals_bp = Blueprint("festivals", __name__, url_prefix="/api/festivals")

DEFAULT_FESTIVALS = [
    {
        "name": "गणेशोत्सव",
        "code": "ganeshotsav",
        "financialYear": "2026-27",
        "festivalYear": 2026,
        "isActive": True,
        "isDefault": True,
        "startDate": "2026-08-28T09:00:00",
        "endDate": "2026-09-08T18:00:00",
        "description": "श्री अमर गणेश उत्सव २०२६ - सुवर्णमहोत्सवी वर्ष"
    },
    {
        "name": "नवरात्र",
        "code": "navratri",
        "financialYear": "2026-27",
        "festivalYear": 2026,
        "isActive": False,
        "isDefault": False,
        "startDate": "2026-10-11T09:00:00",
        "endDate": "2026-10-20T18:00:00",
        "description": "शारदीय नवरात्रौत्सव २०२६"
    },
    {
        "name": "शिवजयंती",
        "code": "shivjayanti",
        "financialYear": "2026-27",
        "festivalYear": 2027,
        "isActive": False,
        "isDefault": False,
        "startDate": "2027-02-19T09:00:00",
        "endDate": "2027-02-19T23:00:00",
        "description": "छत्रपती शिवाजी महाराज जयंती उत्सव"
    },
    {
        "name": "गुढीपाडवा",
        "code": "gudhipadwa",
        "financialYear": "2026-27",
        "festivalYear": 2027,
        "isActive": False,
        "isDefault": False,
        "startDate": "2027-03-29T07:00:00",
        "endDate": "2027-03-29T20:00:00",
        "description": "मराठी नववर्ष स्वागत यात्रा व उत्सव"
    }
]

def ensure_default_festivals():
    if db.db is None:
        return
    count = db.db.festivals.count_documents({})
    if count == 0:
        now = datetime.datetime.now(datetime.timezone.utc)
        for f in DEFAULT_FESTIVALS:
            f["createdAt"] = now
            f["updatedAt"] = now
            db.db.festivals.insert_one(f)

@festivals_bp.route("", methods=["GET"])
@token_required
def get_festivals():
    ensure_default_festivals()
    festivals = list(db.db.festivals.find().sort("festivalYear", -1))
    active_festival = db.db.festivals.find_one({"isActive": True}) or (festivals[0] if festivals else None)
    
    return jsonify({
        "success": True,
        "festivals": serialize_docs(festivals),
        "activeFestival": serialize_doc(active_festival)
    }), 200

@festivals_bp.route("/active", methods=["PATCH"])
@token_required
def set_active_festival():
    data = request.get_json() or {}
    festival_id = data.get("festivalId")
    festival_name = data.get("name")
    
    query = {}
    if festival_id and ObjectId.is_valid(festival_id):
        query["_id"] = ObjectId(festival_id)
    elif festival_name:
        query["name"] = festival_name
    else:
        return jsonify({"success": False, "message": "उत्सव आयडी किंवा नाव आवश्यक आहे"}), 400
        
    target = db.db.festivals.find_one(query)
    if not target:
        return jsonify({"success": False, "message": "उत्सव आढळला नाही"}), 404
        
    now = datetime.datetime.now(datetime.timezone.utc)
    # Set all festivals to inactive
    db.db.festivals.update_many({}, {"$set": {"isActive": False, "updatedAt": now}})
    # Set chosen festival to active
    db.db.festivals.update_one({"_id": target["_id"]}, {"$set": {"isActive": True, "updatedAt": now}})
    
    # Also update mandal active festival year in settings
    db.db.settings.update_one(
        {"key": "mandal_settings"},
        {"$set": {"activeFestival": target["name"], "festivalYear": target.get("festivalYear", 2026), "financialYear": target.get("financialYear", "2026-27")}},
        upsert=True
    )
    
    log_audit_action(
        action="FESTIVAL_SWITCH",
        target_entity="festivals",
        entity_id=str(target["_id"]),
        details={"festival": target["name"], "financialYear": target.get("financialYear")},
        user_info=g.current_user
    )
    
    target["isActive"] = True
    return jsonify({
        "success": True,
        "message": f"सध्याचा उत्सव '{target['name']} ({target.get('financialYear', '2026-27')})' सेट करण्यात आला आहे.",
        "activeFestival": serialize_doc(target)
    }), 200

@festivals_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer", "event_manager")
def create_festival():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    financial_year = data.get("financialYear", "2026-27").strip()
    festival_year = int(data.get("festivalYear", 2026))
    
    if not name:
        return jsonify({"success": False, "message": "उत्सवाचे नाव आवश्यक आहे"}), 400
        
    existing = db.db.festivals.find_one({"name": name, "financialYear": financial_year})
    if existing:
        return jsonify({"success": False, "message": f"'{name} ({financial_year})' हा उत्सव आधीच अस्तित्वात आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    new_fest = {
        "name": name,
        "code": name.lower().replace(" ", "_"),
        "financialYear": financial_year,
        "festivalYear": festival_year,
        "isActive": False,
        "isDefault": False,
        "startDate": data.get("startDate", now.isoformat()),
        "endDate": data.get("endDate", now.isoformat()),
        "description": data.get("description", f"{name} {financial_year}"),
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.festivals.insert_one(new_fest)
    new_fest["_id"] = res.inserted_id
    
    log_audit_action(
        action="FESTIVAL_CREATE",
        target_entity="festivals",
        entity_id=str(res.inserted_id),
        details={"name": name, "financialYear": financial_year},
        user_info=g.current_user
    )
    
    return jsonify({
        "success": True,
        "message": f"नवीन उत्सव '{name}' यशस्वीरीत्या जोडला गेला आहे!",
        "festival": serialize_doc(new_fest)
    }), 201
