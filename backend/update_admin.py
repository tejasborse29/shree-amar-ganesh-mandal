from app import create_app
from app.extensions import db, hash_password

app = create_app()
with app.app_context():
    database = db.get_db()
    if database is not None:
        ph = hash_password("Admin@AMGM2026")
        res = database.users.update_one(
            {"username": "admin"},
            {"$set": {"mobile": "9876543210", "passwordHash": ph}}
        )
        print("Updated admin mobile and password hash:", res.modified_count)
