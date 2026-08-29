from app import create_app
from app.extensions import db

DEVANAGARI_TO_ASCII = str.maketrans('०१२३४५६७८९', '0123456789')

app = create_app()
with app.app_context():
    database = db.get_db()
    if database is not None:
        users = list(database.users.find({}))
        for u in users:
            mobile = u.get('mobile', '')
            if mobile:
                clean_mobile = str(mobile).translate(DEVANAGARI_TO_ASCII).strip()
                if clean_mobile != mobile:
                    database.users.update_one({'_id': u['_id']}, {'$set': {'mobile': clean_mobile}})
                    print(f"Normalized mobile for user {u.get('username')} -> {clean_mobile}")
        print("All user mobiles normalized in Atlas database!")
