from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["shree_amar_ganesh_db"]

res = db.settings.update_one(
    {"key": "mandal_settings"},
    {
        "$set": {
            "mapLocation": "https://maps.app.goo.gl/C6AwUKT4sz5xxSyP7",
            "socialLinks.instagram": "https://www.instagram.com/bappa_majha_offical_17?igsh=bnMyazE3aG91aTJv"
        }
    }
)

print(f"[OK] MongoDB Settings Updated: Matched {res.matched_count}, Modified {res.modified_count}")
