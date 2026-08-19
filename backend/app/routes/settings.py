import datetime
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

@settings_bp.route("", methods=["GET"])
@token_required
@role_required("super_admin")
def get_settings():
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    settings.pop("_id", None)
    
    # Fill defaults if missing
    if "mandalName" not in settings:
        settings["mandalName"] = Config.MANDAL_NAME
    if "mandalTagline" not in settings:
        settings["mandalTagline"] = Config.MANDAL_TAGLINE
    if "festivalYear" not in settings:
        settings["festivalYear"] = Config.DEFAULT_FESTIVAL_YEAR
    if "receiptPrefix" not in settings:
        settings["receiptPrefix"] = Config.MANDAL_RECEIPT_PREFIX
    if "sthapanaDate" not in settings:
        settings["sthapanaDate"] = "2026-08-28T09:00:00"
    if "visarjanDate" not in settings:
        settings["visarjanDate"] = "2026-09-08T18:00:00"
    if "transparencyEnabled" not in settings:
        settings["transparencyEnabled"] = True
        
    return jsonify({"success": True, "settings": settings}), 200

@settings_bp.route("", methods=["PUT"])
@token_required
@role_required("super_admin")
def update_settings():
    data = request.get_json() or {}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    update_data = {
        "key": "mandal_settings",
        "mandalName": data.get("mandalName", Config.MANDAL_NAME),
        "mandalTagline": data.get("mandalTagline", Config.MANDAL_TAGLINE),
        "festivalYear": int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR)),
        "receiptPrefix": data.get("receiptPrefix", Config.MANDAL_RECEIPT_PREFIX).upper(),
        "sthapanaDate": data.get("sthapanaDate", "2026-08-28T09:00:00"),
        "visarjanDate": data.get("visarjanDate", "2026-09-08T18:00:00"),
        "contactNumber": data.get("contactNumber", "+91 98765 43210"),
        "email": data.get("email", "contact@shreeamarganesh.org"),
        "address": data.get("address", "पुणे, महाराष्ट्र"),
        "mapLocation": data.get("mapLocation", ""),
        "upiId": data.get("upiId", "amarganesh@upi"),
        "accountName": data.get("accountName", "Shree Amar Ganesh Mitra Mandal"),
        "accountNumber": data.get("accountNumber", ""),
        "ifsc": data.get("ifsc", ""),
        "bankName": data.get("bankName", ""),
        "transparencyEnabled": bool(data.get("transparencyEnabled", True)),
        "socialLinks": data.get("socialLinks", {}),
        "updatedAt": now
    }
    
    db.db.settings.update_one(
        {"key": "mandal_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    log_audit_action(
        user_info=g.current_user,
        action="SETTINGS_UPDATED",
        target_type="settings",
        target_id="mandal_settings",
        details=update_data
    )
    
    return jsonify({"success": True, "message": "मंडळाच्या सेटिंग्ज यशस्वीपणे अद्यतनित झाल्या आहेत"}), 200
