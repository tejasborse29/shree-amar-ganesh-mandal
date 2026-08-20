import os
import datetime
from flask import Blueprint, request, jsonify, g, send_from_directory
from bson import ObjectId
from werkzeug.utils import secure_filename
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

DEFAULT_DOCUMENTS = [
    {
        "title": "पोलीस ठाणे मंडप व मिरवणूक परवानगी २०२६",
        "category": "PERMISSIONS",
        "categoryLabel": "शासकीय परवानगी",
        "fileType": "pdf",
        "fileName": "police_permission_2026.pdf",
        "fileUrl": "/assets/police_permission_placeholder.pdf",
        "fileSize": "1.2 MB",
        "festivalYear": 2026,
        "uploadedBy": "श्री. अमरनाथ पाटील (Admin)",
        "description": "शनिवार पेठ पोलीस चौकी अधिकृत मंडप ध्वनिक्षेपक व मिरवणूक परवानगी पत्र."
    },
    {
        "title": "महापालिका (PMC) रस्ता व जागा ना हरकत प्रमाणपत्र (NOC)",
        "category": "PERMISSIONS",
        "categoryLabel": "शासकीय परवानगी",
        "fileType": "pdf",
        "fileName": "pmc_noc_2026.pdf",
        "fileUrl": "/assets/pmc_noc_placeholder.pdf",
        "fileSize": "840 KB",
        "festivalYear": 2026,
        "uploadedBy": "श्री. अमरनाथ पाटील (Admin)",
        "description": "पुणे महानगरपालिका मंडप उभारणी व वाहतूक ना-हरकत प्रमाणपत्र."
    },
    {
        "title": "महावितरण तात्पुरती वीज जोडणी पावती व मंजुरी",
        "category": "PERMISSIONS",
        "categoryLabel": "शासकीय परवानगी",
        "fileType": "pdf",
        "fileName": "mseb_light_approval.pdf",
        "fileSize": "520 KB",
        "festivalYear": 2026,
        "uploadedBy": "श्री. प्रशांत शिंदे",
        "description": "उत्सवासाठी तात्पुरते वीज मीटर व सुरक्षितता प्रमाणपत्र."
    },
    {
        "title": "श्रींची मूर्ती घडणावळ व सजावट अधिकृत जीएसटी बिल",
        "category": "BILLS_EXPENSES",
        "categoryLabel": "खर्च बिले",
        "fileType": "pdf",
        "fileName": "murti_tax_bill_2026.pdf",
        "fileSize": "1.8 MB",
        "festivalYear": 2026,
        "uploadedBy": "श्री. सचिन जोशी (खजिनदार)",
        "description": "अमर गणेश बाप्पा मूर्ती घडणावळ मूळ पावती व कर बिल."
    },
    {
        "title": "मंडळाची घटना व कार्यकारिणी नियमावली",
        "category": "MANDAL_DOCS",
        "categoryLabel": "मंडळ कागदपत्रे",
        "fileType": "pdf",
        "fileName": "mandal_constitution.pdf",
        "fileSize": "2.4 MB",
        "festivalYear": 2026,
        "uploadedBy": "श्री. अमरनाथ पाटील (Admin)",
        "description": "श्री अमर गणेश मित्र मंडळाची अधिकृत घटना, नियम व ठराव नोंदवही."
    }
]

def ensure_default_documents():
    if db.db is None:
        return
    count = db.db.documents.count_documents({})
    if count == 0:
        now = datetime.datetime.now(datetime.timezone.utc)
        for doc in DEFAULT_DOCUMENTS:
            doc["createdAt"] = now
            doc["updatedAt"] = now
            db.db.documents.insert_one(doc)

@documents_bp.route("", methods=["GET"])
@token_required
def get_documents():
    ensure_default_documents()
    category = request.args.get("category")
    festival_year = request.args.get("year")
    search = request.args.get("search", "").strip()
    
    query = {}
    if category and category != "ALL":
        query["category"] = category
    if festival_year:
        query["festivalYear"] = int(festival_year)
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"fileName": {"$regex": search, "$options": "i"}}
        ]
        
    docs = list(db.db.documents.find(query).sort("createdAt", -1))
    return jsonify({
        "success": True,
        "documents": serialize_docs(docs),
        "totalCount": len(docs)
    }), 200

@documents_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer", "event_manager")
def upload_document():
    title = request.form.get("title", "").strip()
    category = request.form.get("category", "MANDAL_DOCS")
    description = request.form.get("description", "").strip()
    festival_year = int(request.form.get("festivalYear", 2026))
    
    if not title:
        return jsonify({"success": False, "message": "दस्तऐवजाचे शीर्षक आवश्यक आहे"}), 400
        
    uploaded_file = request.files.get("file")
    now = datetime.datetime.now(datetime.timezone.utc)
    
    file_name = "document.pdf"
    file_url = "/assets/police_permission_placeholder.pdf"
    file_size = "500 KB"
    
    if uploaded_file and uploaded_file.filename:
        filename = secure_filename(uploaded_file.filename)
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        uploaded_file.save(file_path)
        file_name = filename
        file_url = f"/api/documents/download/{filename}"
        file_size = f"{round(os.path.getsize(file_path) / 1024, 1)} KB"
        
    category_labels = {
        "MANDAL_DOCS": "मंडळ कागदपत्रे",
        "PERMISSIONS": "शासकीय परवानगी",
        "BILLS_EXPENSES": "खर्च बिले",
        "EVENTS": "उत्सव कार्यक्रम",
        "OTHER": "इतर पुरावे"
    }
    
    new_doc = {
        "title": title,
        "category": category,
        "categoryLabel": category_labels.get(category, "इतर"),
        "description": description,
        "fileName": file_name,
        "fileUrl": file_url,
        "fileSize": file_size,
        "fileType": file_name.split(".")[-1].lower() if "." in file_name else "pdf",
        "festivalYear": festival_year,
        "uploadedBy": g.current_user.get("name", "समिती"),
        "uploadedByUserId": g.current_user.get("id"),
        "createdAt": now,
        "updatedAt": now
    }
    
    res = db.db.documents.insert_one(new_doc)
    new_doc["_id"] = res.inserted_id
    
    log_audit_action(
        action="DOCUMENT_UPLOAD",
        target_entity="documents",
        entity_id=str(res.inserted_id),
        details={"title": title, "category": category},
        user_info=g.current_user
    )
    
    return jsonify({
        "success": True,
        "message": "दस्तऐवज यशस्वीरीत्या जोडला गेला!",
        "document": serialize_doc(new_doc)
    }), 201

@documents_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin")
def delete_document(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध आयडी"}), 400
        
    doc = db.db.documents.find_one({"_id": ObjectId(id)})
    if not doc:
        return jsonify({"success": False, "message": "दस्तऐवज आढळला नाही"}), 404
        
    db.db.documents.delete_one({"_id": ObjectId(id)})
    log_audit_action(
        action="DOCUMENT_DELETE",
        target_entity="documents",
        entity_id=str(id),
        details={"title": doc.get("title")},
        user_info=g.current_user
    )
    
    return jsonify({"success": True, "message": "दस्तऐवज हटवला गेला"}), 200
