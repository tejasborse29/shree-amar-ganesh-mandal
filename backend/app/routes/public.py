import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.services.receipt_service import create_receipt_record
from app.services.financial_service import get_financial_summary
from app.utils.helpers import serialize_doc, serialize_docs

public_bp = Blueprint("public", __name__, url_prefix="/api/public")

@public_bp.route("/config", methods=["GET"])
def get_public_config():
    """Returns general public settings, festival dates, countdown target date."""
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    
    # Defaults
    config = {
        "mandalName": settings.get("mandalName", Config.MANDAL_NAME),
        "mandalTagline": settings.get("mandalTagline", Config.MANDAL_TAGLINE),
        "festivalYear": settings.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR),
        "sthapanaDate": settings.get("sthapanaDate", "2026-08-28T09:00:00"), # 2026 Ganesh Chaturthi
        "visarjanDate": settings.get("visarjanDate", "2026-09-08T18:00:00"),
        "contactNumber": settings.get("contactNumber", "+91 98765 43210"),
        "email": settings.get("email", "contact@shreeamarganesh.org"),
        "address": settings.get("address", "अमर गणेश मंडळ चौक, मुख्य रस्ता, पुणे, महाराष्ट्र - ४११००१"),
        "mapLocation": settings.get("mapLocation", "https://maps.google.com"),
        "upiId": settings.get("upiId", "amarganesh@upi"),
        "bankDetails": {
            "accountName": settings.get("accountName", "Shree Amar Ganesh Mitra Mandal"),
            "accountNumber": settings.get("accountNumber", "XXXX-XXXX-XXXX-4589"),
            "ifsc": settings.get("ifsc", "MAHB0001234"),
            "bankName": settings.get("bankName", "Bank of Maharashtra")
        },
        "socialLinks": settings.get("socialLinks", {
            "facebook": "https://facebook.com",
            "instagram": "https://instagram.com",
            "youtube": "https://youtube.com"
        }),
        "transparencyEnabled": settings.get("transparencyEnabled", True)
    }
    return jsonify({"success": True, "config": config}), 200

@public_bp.route("/events", methods=["GET"])
def get_public_events():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    events = list(db.db.events.find(
        {"festivalYear": festival_year, "isPublished": True}
    ).sort("date", 1))
    return jsonify({"success": True, "events": serialize_docs(events)}), 200

@public_bp.route("/announcements", methods=["GET"])
def get_public_announcements():
    now = datetime.datetime.now(datetime.timezone.utc)
    announcements = list(db.db.announcements.find({
        "active": True,
        "$or": [
            {"expiryDate": {"$exists": False}},
            {"expiryDate": None},
            {"expiryDate": {"$gte": now}}
        ]
    }).sort("priority", -1).sort("publishDate", -1))
    return jsonify({"success": True, "announcements": serialize_docs(announcements)}), 200

@public_bp.route("/gallery", methods=["GET"])
def get_public_gallery():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    category = request.args.get("category")
    query = {"festivalYear": festival_year}
    if category and category != "all":
        query["category"] = category
        
    photos = list(db.db.gallery.find(query).sort("date", -1))
    return jsonify({"success": True, "gallery": serialize_docs(photos)}), 200

@public_bp.route("/social-activities", methods=["GET"])
def get_public_social_activities():
    activities = list(db.db.social_activities.find({"active": True}).sort("order", 1))
    return jsonify({"success": True, "activities": serialize_docs(activities)}), 200

@public_bp.route("/transparency", methods=["GET"])
def get_public_transparency():
    """
    Returns public-approved financial summary.
    Never exposes individual donor phone numbers or sensitive addresses.
    """
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    if not settings.get("transparencyEnabled", True):
        return jsonify({
            "success": False,
            "message": "पारदर्शक हिशोब सध्या सार्वजनिक पाहणीसाठी उपलब्ध नाही."
        }), 403
        
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    summary = get_financial_summary(festival_year)
    
    # Safe public response
    public_summary = {
        "festivalYear": festival_year,
        "totalCollection": summary["totalIncome"],
        "totalExpenses": summary["totalExpenses"],
        "netBalance": summary["currentBalance"],
        "totalReceipts": summary["receiptCount"],
        "activeVolunteers": summary["activeVolunteers"],
        "socialActivitiesCount": db.db.social_activities.count_documents({"active": True}),
        "eventsCount": summary["upcomingEvents"],
        "expenseByCategory": summary["expenseByCategory"]
    }
    return jsonify({"success": True, "transparency": public_summary}), 200

@public_bp.route("/vargani", methods=["POST"])
def submit_public_vargani():
    """
    Public digital vargani / donation form submission.
    Creates verified receipt record with system user.
    """
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    amount = float(data.get("amount", 0))
    address = data.get("address", "").strip()
    payment_mode = data.get("paymentMode", "online").lower()
    transaction_ref = data.get("transactionRef", "").strip()
    
    if not name or not mobile or amount <= 0:
        return jsonify({
            "success": False,
            "message": "कृपया नाव, वैध मोबाईल नंबर आणि रक्कम प्रविष्ट करा."
        }), 400
        
    system_collector = {
        "id": "public_portal",
        "username": "online_vargani",
        "name": "Digital Vargani Portal",
        "role": "system"
    }
    
    receipt_data = {
        "donorName": name,
        "donorMobile": mobile,
        "donorAddress": address or "Online Donor",
        "amount": amount,
        "paymentMode": payment_mode,
        "transactionRef": transaction_ref or f"ONLINE-{int(datetime.datetime.now().timestamp())}",
        "notes": "सार्वजनिक डिजिटल वर्गणी पोर्टल द्वारे भरणा (Online Vargani)",
        "festivalYear": Config.DEFAULT_FESTIVAL_YEAR
    }
    
    try:
        receipt = create_receipt_record(receipt_data, system_collector)
        return jsonify({
            "success": True,
            "message": "वर्गणी यशस्वीपणे नोंदवली गेली आहे! गणपती बाप्पा मोरया!",
            "receipt": serialize_doc(receipt)
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"वर्गणी नोंदवताना त्रुटी आली: {str(e)}"
        }), 500

@public_bp.route("/verify-receipt/<receipt_number>", methods=["GET"])
def verify_receipt(receipt_number):
    """
    Publicly verifies receipt authenticity.
    Returns sanitized non-private data.
    """
    receipt = db.db.receipts.find_one({"receiptNumber": receipt_number})
    if not receipt:
        return jsonify({
            "success": False,
            "verified": False,
            "message": "दिलेली पावती मंडळाच्या रेकॉर्डमध्ये आढळली नाही (Receipt not found)"
        }), 404
        
    # Mask donor phone for privacy: 98****3210
    raw_mobile = receipt.get("donorMobile", "")
    masked_mobile = f"{raw_mobile[:2]}******{raw_mobile[-2:]}" if len(raw_mobile) >= 8 else "****"
    
    safe_data = {
        "verified": True,
        "receiptNumber": receipt.get("receiptNumber"),
        "donorName": receipt.get("donorName"),
        "maskedMobile": masked_mobile,
        "amount": receipt.get("amount"),
        "paymentMode": receipt.get("paymentMode"),
        "date": receipt.get("createdAt").strftime("%d %B %Y") if receipt.get("createdAt") else "",
        "status": receipt.get("status", "ACTIVE"),
        "mandalName": Config.MANDAL_NAME,
        "collectedBy": receipt.get("collectedByName", "समिती")
    }
    return jsonify({"success": True, "receipt": safe_data}), 200

@public_bp.route("/contact", methods=["POST"])
def submit_contact_form():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    message = data.get("message", "").strip()
    
    if not name or not mobile or not message:
        return jsonify({
            "success": False,
            "message": "कृपया सर्व आवश्यक माहिती भरा."
        }), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    contact_doc = {
        "name": name,
        "mobile": mobile,
        "email": data.get("email", "").strip(),
        "subject": data.get("subject", "General Inquiry"),
        "message": message,
        "status": "new",
        "createdAt": now
    }
    db.db.contact_inquiries.insert_one(contact_doc)
    return jsonify({
        "success": True,
        "message": "आपला संदेश यशस्वीपणे मंडळाकडे पोहोचला आहे. धन्यवाद!"
    }), 201
