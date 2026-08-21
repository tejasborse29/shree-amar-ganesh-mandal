import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from app.extensions import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend
    CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "Accept"], methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    
    # Initialize DB
    db.init_app(app)
    
    # Ensure Uploads directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    
    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.public import public_bp
    from app.routes.members import members_bp
    from app.routes.receipts import receipts_bp
    from app.routes.income import income_bp
    from app.routes.expenses import expenses_bp
    from app.routes.events import events_bp
    from app.routes.tasks import tasks_bp
    from app.routes.volunteers import volunteers_bp
    from app.routes.announcements import announcements_bp
    from app.routes.gallery import gallery_bp
    from app.routes.social_activities import social_bp
    from app.routes.reports import reports_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.audit_logs import audit_bp
    from app.routes.settings import settings_bp
    from app.routes.users import users_bp
    from app.routes.festivals import festivals_bp
    from app.routes.transactions import transactions_bp
    from app.routes.documents import documents_bp
    from app.routes.join_codes import join_codes_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(members_bp)
    app.register_blueprint(receipts_bp)
    app.register_blueprint(income_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(volunteers_bp)
    app.register_blueprint(announcements_bp)
    app.register_blueprint(gallery_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(festivals_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(join_codes_bp)
    
    # Route for uploaded files
    @app.route("/uploads/<filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
        
    # Healthcheck
    @app.route("/api/health")
    def health_check():
        database = db.get_db()
        return jsonify({
            "status": "healthy",
            "mandal": Config.MANDAL_NAME,
            "festivalYear": Config.DEFAULT_FESTIVAL_YEAR,
            "dbConnected": database is not None and db.is_connected
        }), 200

    # Custom Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "message": "विनंती चुकीची आहे (Bad request)",
            "error": str(error)
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "message": "मागितलेले पान किंवा माहिती आढळली नाही (Resource not found)"
        }), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({
            "success": False,
            "message": "काहीतरी समस्या आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. (Internal server error)"
        }), 500
        
    return app
