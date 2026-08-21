import certifi
import bcrypt
from pymongo import MongoClient

def update_admin():
    uri = "mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client["shree_amar_ganesh_db"]
    
    salt = bcrypt.gensalt(12)
    ph = bcrypt.hashpw(b"Admin@AMGM2026", salt).decode("utf-8")
    
    res = db.users.update_one(
        {"username": "admin"},
        {"$set": {"mobile": "9322957150", "passwordHash": ph}}
    )
    print(f"Updated admin user in MongoDB Atlas: {res.modified_count} modified.")
    
    user = db.users.find_one({"username": "admin"})
    print("Admin in DB now:", user.get("username"), "| Mobile:", user.get("mobile"), "| Role:", user.get("role"))

if __name__ == "__main__":
    update_admin()
