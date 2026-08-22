from flask import Blueprint, request, jsonify, g, send_file, Response
import io
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.receipt_service import create_receipt_record, cancel_receipt_record
from app.utils.pdf_generator import generate_receipt_pdf
from app.utils.helpers import serialize_doc, serialize_docs

receipts_bp = Blueprint("receipts", __name__, url_prefix="/api/receipts")

@receipts_bp.route("", methods=["GET"])
@token_required
def get_receipts():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()
    payment_mode = request.args.get("paymentMode", "").strip()
    festival_year = request.args.get("year")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    sort_by = request.args.get("sortBy", "createdAt")
    sort_order = -1 if request.args.get("sortOrder", "desc") == "desc" else 1

    query = {}
    if festival_year:
        query["festivalYear"] = int(festival_year)
    if status:
        query["status"] = status.upper()
    if payment_mode:
        query["paymentMode"] = payment_mode.lower()
        
    if search:
        query["$or"] = [
            {"receiptNumber": {"$regex": search, "$options": "i"}},
            {"donorName": {"$regex": search, "$options": "i"}},
            {"donorMobile": {"$regex": search, "$options": "i"}},
            {"transactionRef": {"$regex": search, "$options": "i"}}
        ]
        
    total = db.db.receipts.count_documents(query)
    receipts = list(
        db.db.receipts.find(query)
        .sort(sort_by, sort_order)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    
    return jsonify({
        "success": True,
        "receipts": serialize_docs(receipts),
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }), 200

@receipts_bp.route("/<id>", methods=["GET"])
@token_required
def get_receipt(id):
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"receiptNumber": id}
    receipt = db.db.receipts.find_one(query)
    if not receipt:
        return jsonify({"success": False, "message": "पावती आढळली नाही"}), 404
        
    return jsonify({"success": True, "receipt": serialize_doc(receipt)}), 200

@receipts_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer", "receipt_manager")
def create_receipt():
    data = request.get_json() or {}
    try:
        receipt = create_receipt_record(data, g.current_user)
        return jsonify({
            "success": True,
            "message": f"पावती क्र. {receipt['receiptNumber']} यशस्वीपणे तयार झाली आहे!",
            "receipt": serialize_doc(receipt)
        }), 201
    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"पावती तयार करण्यात त्रुटी: {str(e)}"}), 500

@receipts_bp.route("/<id>/cancel", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def cancel_receipt(id):
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()
    if not reason:
        return jsonify({"success": False, "message": "पावती रद्द करण्याचे कारण देणे अनिवार्य आहे"}), 400
        
    try:
        updated = cancel_receipt_record(id, reason, g.current_user)
        return jsonify({
            "success": True,
            "message": f"पावती क्र. {updated.get('receiptNumber')} यशस्वीपणे रद्द करण्यात आली आहे",
            "receipt": serialize_doc(updated)
        }), 200
    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"त्रुटी: {str(e)}"}), 500

@receipts_bp.route("/<id>/pdf", methods=["GET"])
def download_receipt_pdf(id):
    """Downloads PDF for given receipt ID or Receipt Number."""
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"receiptNumber": id}
    receipt = db.db.receipts.find_one(query)
    if not receipt:
        return jsonify({"success": False, "message": "पावती आढळली नाही"}), 404
        
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    mandal_info = {
        "name": settings.get("mandalName", Config.MANDAL_NAME),
        "tagline": settings.get("mandalTagline", Config.MANDAL_TAGLINE),
        "address": settings.get("address", "Pune, Maharashtra"),
        "contactNumber": settings.get("contactNumber", "+91 98765 43210")
    }
    
    # URL for QR verification
    host_url = request.host_url.rstrip("/")
    verify_url = f"{host_url}/verify/{receipt.get('receiptNumber')}"
    
    try:
        pdf_bytes = generate_receipt_pdf(receipt, mandal_info, verify_url=verify_url)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"Receipt_{receipt.get('receiptNumber')}.pdf"
        )
    except Exception as e:
        return jsonify({"success": False, "message": f"PDF तयार करताना त्रुटी आली: {str(e)}"}), 500

@receipts_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin")
def delete_receipt(id):
    database = db.get_db()
    if database is None:
        return jsonify({"success": False, "message": "डेटाबेस उपलब्ध नाही"}), 503
        
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"receiptNumber": id}
    receipt = database.receipts.find_one(query)
    if not receipt:
        return jsonify({"success": False, "message": "पावती आढळली नाही"}), 404
        
    rc_no = receipt.get("receiptNumber")
    database.income.delete_many({"receiptNumber": rc_no})
    database.receipts.delete_one(query)
    
    log_audit_action(
        user_info=g.current_user,
        action="RECEIPT_DELETED",
        target_type="receipt",
        target_id=rc_no,
        details={"receiptNumber": rc_no, "donorName": receipt.get("donorName"), "amount": receipt.get("amount")}
    )
    return jsonify({"success": True, "message": f"पावती क्र. {rc_no} कायमची हटवण्यात आली आहे."}), 200

