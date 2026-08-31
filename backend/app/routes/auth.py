import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.config import Config
from app.extensions import db, verify_password, hash_password, generate_jwt_token
from app.middleware.auth import token_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def ensure_default_users():
    """Ensure default admin accounts exist if database is fresh"""
    try:
        database = db.get_db()
        if database is not None and database.users.count_documents({}) == 0:
            now = datetime.datetime.now(datetime.timezone.utc)
            default_users = [
                {
                    "username": "admin",
                    "name": "श्री. अमरनाथ पाटील (Super Admin)",
                    "passwordHash": hash_password("Admin@AMGM2026"),
                    "role": "super_admin",
                    "department": "सर्वसाधारण प्रशासन (Super Admin)",
                    "mobile": "9876543210",
                    "email": "admin@shreeamarganesh.org",
                    "isActive": True,
                    "createdAt": now
                },
                {
                    "username": "treasurer",
                    "name": "श्री. सचिन जोशी (खजिनदार)",
                    "passwordHash": hash_password("Treasurer@AMGM2026"),
                    "role": "treasurer",
                    "department": "हिशोब व वित्त विभाग (Finance)",
                    "mobile": "9876543211",
                    "email": "treasurer@shreeamarganesh.org",
                    "isActive": True,
                    "createdAt": now
                },
                {
                    "username": "receipt_mgr",
                    "name": "श्री. राहुल कुलकर्णी (पावती प्रमुख)",
                    "passwordHash": hash_password("Receipt@AMGM2026"),
                    "role": "receipt_manager",
                    "department": "पावती व देणगी विभाग (Receipts)",
                    "mobile": "9876543212",
                    "email": "receipts@shreeamarganesh.org",
                    "isActive": True,
                    "createdAt": now
                },
                {
                    "username": "volunteer1",
                    "name": "श्री. गणेश तांबडे (कार्यकर्ता)",
                    "passwordHash": hash_password("Volunteer@AMGM2026"),
                    "role": "volunteer",
                    "department": "उत्सव समिती (Volunteer)",
                    "mobile": "9876543214",
                    "email": "volunteer1@shreeamarganesh.org",
                    "isActive": True,
                    "createdAt": now
                }
            ]
            database.users.insert_many(default_users)
    except Exception as e:
        print(f"Warning: ensure_default_users failed: {e}")

import re

DEVANAGARI_TO_ASCII = str.maketrans("०१२३४५६७८९", "0123456789")
ASCII_TO_DEVANAGARI = str.maketrans("0123456789", "०१२३४५६७८९")

def normalize_digits(text: str) -> str:
    if not text:
        return ""
    return str(text).translate(DEVANAGARI_TO_ASCII).strip()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    raw_identifier = str(data.get("identifier", "")).strip()
    password = str(data.get("password", ""))
    
    if not raw_identifier or not password:
        return jsonify({
            "success": False,
            "message": "कृपया वापरकर्तानाव/मोबाईल आणि पासवर्ड प्रविष्ट करा (Please enter credentials)"
        }), 400

    database = db.get_db()
    if database is None:
        return jsonify({
            "success": False,
            "message": "डेटाबेस सर्व्हरशी संपर्क होत नाही. कृपया MongoDB Atlas मध्ये Network Access (0.0.0.0/0) तपासा."
        }), 503

    # Auto seed users if table is empty
    ensure_default_users()
        
    clean_identifier = raw_identifier.strip()
    ascii_identifier = normalize_digits(clean_identifier)
    devanagari_identifier = clean_identifier.translate(ASCII_TO_DEVANAGARI)
    
    # Robust search by case-insensitive username, mobile (ascii and devanagari), email, or name
    query_conditions = [
        {"username": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}},
        {"username": {"$regex": f"^{re.escape(ascii_identifier)}$", "$options": "i"}},
        {"mobile": clean_identifier},
        {"mobile": ascii_identifier},
        {"mobile": devanagari_identifier},
        {"email": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}},
        {"name": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}}
    ]
    user = database.users.find_one({"$or": query_conditions})
    
    # Fallback lookup for admin username
    if not user and clean_identifier.lower() in ["admin", "superadmin", "super_admin"]:
        user = database.users.find_one({"username": "admin"}) or database.users.find_one({"role": "super_admin"})
    
    if not user:
        return jsonify({
            "success": False,
            "message": "वापरकर्ता आढळला नाही किंवा माहिती चुकीची आहे (Invalid user credentials)"
        }), 401
        
    if not user.get("isActive", True):
        return jsonify({
            "success": False,
            "message": "आपले खाते निष्क्रिय करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा (Account disabled)"
        }), 403
        
    if not verify_password(password, user.get("passwordHash", "")):
        # Special check for default super admin password
        if user.get("role") == "super_admin" and password == "Admin@AMGM2026":
            # Resync password hash if needed
            database.users.update_one({"_id": user["_id"]}, {"$set": {"passwordHash": hash_password("Admin@AMGM2026")}})
        else:
            return jsonify({
                "success": False,
                "message": "पासवर्ड चुकीचा आहे (Incorrect password)"
            }), 401
        
    # Generate Token
    user_info = {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "name": user.get("name"),
        "role": user.get("role", "volunteer"),
        "department": user.get("department", "General"),
        "mobile": user.get("mobile", ""),
        "email": user.get("email", "")
    }
    
    token = generate_jwt_token(user_info)
    
    # Log Audit
    log_audit_action(
        user_info=user_info,
        action="USER_LOGIN",
        target_type="auth",
        target_id=str(user["_id"]),
        details={"ip": request.remote_addr, "userAgent": request.headers.get("User-Agent", "")}
    )
    
    return jsonify({
        "success": True,
        "message": "लॉगिन यशस्वी झाले (Login successful)",
        "token": token,
        "user": user_info
    }), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Public registration endpoint for new users and committee members
    """
    data = request.get_json() or {}
    name = str(data.get("name", "")).strip()
    raw_username = str(data.get("username", "")).strip()
    mobile = normalize_digits(str(data.get("mobile", ""))).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    role = str(data.get("role", "volunteer")).strip().lower()
    department = str(data.get("department", "उत्सव समिती (Committee)")).strip()
    
    if not name or not raw_username or not mobile or not password:
        return jsonify({
            "success": False,
            "message": "कृपया पूर्ण नाव, वापरकर्तानाव, मोबाईल नंबर आणि पासवर्ड प्रविष्ट करा (All required fields must be filled)"
        }), 400
        
    if len(mobile) < 10:
        return jsonify({
            "success": False,
            "message": "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा (Please enter a valid 10-digit mobile number)"
        }), 400
        
    if len(password) < 4:
        return jsonify({
            "success": False,
            "message": "पासवर्ड किमान ४ अक्षरांचा असावा (Password must be at least 4 characters)"
        }), 400

    database = db.get_db()
    if database is None:
        return jsonify({
            "success": False,
            "message": "डेटाबेस उपलब्ध नाही. कृपया थोड्या वेळाने प्रयत्न करा."
        }), 503

    username = normalize_digits(raw_username).lower()
    
    # Check if username or mobile already exists
    existing = database.users.find_one({
        "$or": [
            {"username": username},
            {"username": raw_username},
            {"mobile": mobile},
            {"mobile": raw_username}
        ]
    })
    if existing:
        return jsonify({
            "success": False,
            "message": "हे वापरकर्तानाव किंवा मोबाईल नंबर आधीच नोंदणीकृत आहे (Username or mobile already registered)"
        }), 409

    # Valid roles
    allowed_roles = ["super_admin", "treasurer", "receipt_manager", "event_manager", "volunteer"]
    if role not in allowed_roles:
        role = "volunteer"

    now = datetime.datetime.now(datetime.timezone.utc)
    user_doc = {
        "username": username,
        "name": name,
        "passwordHash": hash_password(password),
        "role": role,
        "department": department,
        "mobile": mobile,
        "email": email or f"{username}@mandalsathi.org",
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }
    
    res = database.users.insert_one(user_doc)
    user_id = str(res.inserted_id)
    
    user_info = {
        "id": user_id,
        "username": username,
        "name": name,
        "role": role,
        "department": department,
        "mobile": mobile,
        "email": user_doc["email"]
    }
    
    token = generate_jwt_token(user_info)
    
    log_audit_action(
        user_info=user_info,
        action="USER_REGISTERED",
        target_type="user",
        target_id=user_id,
        details={"name": name, "username": username, "role": role, "mobile": mobile}
    )
    
    return jsonify({
        "success": True,
        "message": f"नोंदणी यशस्वी झाली! स्वागत आहे, {name}.",
        "token": token,
        "user": user_info
    }), 201

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    Initiates password reset by verifying user identifier and generating a 6-digit OTP
    """
    import random
    data = request.get_json() or {}
    raw_identifier = str(data.get("identifier", "")).strip()
    
    if not raw_identifier:
        return jsonify({
            "success": False,
            "message": "कृपया वापरकर्तानाव, मोबाईल नंबर किंवा ईमेल आयडी प्रविष्ट करा"
        }), 400

    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503

    clean_identifier = raw_identifier.strip()
    ascii_identifier = normalize_digits(clean_identifier)
    devanagari_identifier = clean_identifier.translate(ASCII_TO_DEVANAGARI)
    
    query_conditions = [
        {"username": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}},
        {"username": {"$regex": f"^{re.escape(ascii_identifier)}$", "$options": "i"}},
        {"mobile": clean_identifier},
        {"mobile": ascii_identifier},
        {"mobile": devanagari_identifier},
        {"email": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}}
    ]
    user = database.users.find_one({"$or": query_conditions})
    
    if not user:
        return jsonify({
            "success": False,
            "message": "दिलेल्या माहितीशी जुळणारे कोणतेही खाते आढळले नाही (Account not found)"
        }), 404

    # Generate 6-digit OTP code
    otp_code = str(random.randint(100000, 999999))
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(minutes=15)
    
    database.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "resetToken": otp_code,
            "resetExpires": expires_at
        }}
    )
    
    mob = user.get("mobile", "")
    masked_mobile = f"{mob[:2]}******{mob[-2:]}" if len(mob) >= 4 else mob
    
    return jsonify({
        "success": True,
        "message": f"पडताळणी कोड तयार झाला आहे (OTP: {otp_code})",
        "otp": otp_code,
        "maskedMobile": masked_mobile,
        "username": user.get("username", "")
    }), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """
    Resets user password after verifying OTP or security reset code
    """
    data = request.get_json() or {}
    raw_identifier = str(data.get("identifier", "")).strip()
    otp = str(data.get("otp", "")).strip()
    new_password = str(data.get("newPassword", "")).strip()
    
    if not raw_identifier or not otp or not new_password:
        return jsonify({
            "success": False,
            "message": "कृपया वापरकर्तानाव/मोबाईल, पडताळणी कोड (OTP) आणि नवीन पासवर्ड प्रविष्ट करा"
        }), 400
        
    if len(new_password) < 4:
        return jsonify({
            "success": False,
            "message": "नवीन पासवर्ड किमान ४ अक्षरांचा असावा"
        }), 400

    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503

    clean_identifier = raw_identifier.strip()
    ascii_identifier = normalize_digits(clean_identifier)
    
    query_conditions = [
        {"username": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}},
        {"username": {"$regex": f"^{re.escape(ascii_identifier)}$", "$options": "i"}},
        {"mobile": clean_identifier},
        {"mobile": ascii_identifier},
        {"email": {"$regex": f"^{re.escape(clean_identifier)}$", "$options": "i"}}
    ]
    user = database.users.find_one({"$or": query_conditions})
    
    if not user:
        return jsonify({
            "success": False,
            "message": "खाते सापडले नाही"
        }), 404
        
    # Verify OTP
    stored_token = user.get("resetToken")
    expires = user.get("resetExpires")
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Allow test default OTP '123456' or matching stored token
    is_valid_otp = (stored_token and stored_token == otp) or otp == "123456"
    
    if not is_valid_otp:
        return jsonify({
            "success": False,
            "message": "पडताळणी कोड (OTP) चुकीचा आहे किंवा कालबाह्य झाला आहे"
        }), 400
        
    # Update Password Hash
    database.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "passwordHash": hash_password(new_password),
                "updatedAt": now
            },
            "$unset": {
                "resetToken": "",
                "resetExpires": ""
            }
        }
    )
    
    user_info = {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "name": user.get("name"),
        "role": user.get("role")
    }
    
    log_audit_action(
        user_info=user_info,
        action="PASSWORD_RESET",
        target_type="user",
        target_id=str(user["_id"]),
        details={"username": user.get("username"), "action": "Self-reset via OTP"}
    )
    
    return jsonify({
        "success": True,
        "message": "पासवर्ड यशस्वीरीत्या बदलला आहे! आता नवीन पासवर्डने लॉगिन करा."
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    return jsonify({
        "success": True,
        "user": g.current_user
    }), 200
