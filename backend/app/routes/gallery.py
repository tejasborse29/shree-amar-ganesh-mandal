import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.utils.helpers import serialize_doc, serialize_docs

gallery_bp = Blueprint("gallery", __name__, url_prefix="/api/gallery")

@gallery_bp.route("", methods=["GET"])
@token_required
def get_admin_gallery():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    category = request.args.get("category")
    query = {"festivalYear": festival_year}
    if category and category != "all":
        query["category"] = category
    photos = list(db.db.gallery.find(query).sort("createdAt", -1))
    return jsonify({"success": True, "gallery": serialize_docs(photos)}), 200

@gallery_bp.route("", methods=["POST"])
@token_required
@role_required("super_admin", "event_manager")
def add_gallery_photo():
    data = request.get_json() or {}
    image_url = data.get("imageUrl", "").strip()
    caption = data.get("caption", "").strip()
    category = data.get("category", "Ganesh Sthapana").strip()
    
    if not image_url:
        return jsonify({"success": False, "message": "फोटो URL आवश्यक आहे"}), 400
        
    now = datetime.datetime.now(datetime.timezone.utc)
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    
    photo_doc = {
        "festivalYear": festival_year,
        "imageUrl": image_url,
        "caption": caption,
        "category": category, # Arrival, Sthapana, Aarti, Cultural, Social, Mahaprasad, Visarjan, Memories
        "date": data.get("date", now.strftime("%Y-%m-%d")),
        "isFeatured": data.get("isFeatured", False),
        "uploadedBy": g.current_user.get("name"),
        "createdAt": now
    }
    
    res = db.db.gallery.insert_one(photo_doc)
    photo_doc["_id"] = res.inserted_id
    
    return jsonify({
        "success": True,
        "message": "फोटो गॅलरीमध्ये यशस्वीपणे जोडला गेला आहे",
        "photo": serialize_doc(photo_doc)
    }), 201

@gallery_bp.route("/<id>", methods=["DELETE"])
@token_required
@role_required("super_admin", "event_manager")
def delete_gallery_photo(id):
    if not ObjectId.is_valid(id):
        return jsonify({"success": False, "message": "अवैध ओळख"}), 400
    db.db.gallery.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "फोटो हटवला गेला"}), 200
