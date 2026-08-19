import datetime
from app.config import Config
from app.extensions import hash_password, db
from app import create_app

def seed_database():
    app = create_app()
    with app.app_context():
        if db.db is None:
            print("Error: Database not connected. Cannot seed.")
            return

        print("Seeding database for Shree Amar Ganesh Mitra Mandal...")
        now = datetime.datetime.now(datetime.timezone.utc)
        year = 2026

        # 1. Seed Users
        users = [
            {
                "username": "admin",
                "name": "श्री. अमरनाथ पाटील (Admin)",
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
                "username": "event_mgr",
                "name": "श्री. प्रशांत शिंदे (कार्यक्रम प्रमुख)",
                "passwordHash": hash_password("Events@AMGM2026"),
                "role": "event_manager",
                "department": "सांस्कृतिक व उत्सव व्यवस्थापन (Events)",
                "mobile": "9876543213",
                "email": "events@shreeamarganesh.org",
                "isActive": True,
                "createdAt": now
            },
            {
                "username": "volunteer1",
                "name": "श्री. ओंकार गायकवाड (कार्यकर्ता)",
                "passwordHash": hash_password("Volunteer@AMGM2026"),
                "role": "volunteer",
                "department": "मंडप व सुरक्षा व्यवस्था (Mandap & Security)",
                "mobile": "9876543214",
                "email": "volunteer1@shreeamarganesh.org",
                "isActive": True,
                "createdAt": now
            }
        ]

        for u in users:
            db.db.users.update_one(
                {"username": u["username"]},
                {"$set": u},
                upsert=True
            )
        print("[OK] Users seeded successfully (Admin, Treasurer, Receipt Manager, Event Manager, Volunteer).")

        # 2. Seed Settings
        settings_doc = {
            "key": "mandal_settings",
            "mandalName": "श्री अमर गणेश मित्र मंडळ",
            "mandalTagline": "भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!",
            "festivalYear": year,
            "receiptPrefix": "AMGM",
            "sthapanaDate": "2026-08-28T09:00:00",
            "visarjanDate": "2026-09-08T18:00:00",
            "contactNumber": "+91 98765 43210",
            "email": "contact@shreeamarganesh.org",
            "address": "अमर गणेश चौक, शनिवार पेठ, पुणे, महाराष्ट्र - ४११ ०३०",
            "mapLocation": "https://maps.app.goo.gl/C6AwUKT4sz5xxSyP7",
            "upiId": "amarganesh@upi",
            "accountName": "Shree Amar Ganesh Mitra Mandal",
            "accountNumber": "9876002100045890",
            "ifsc": "MAHB0000123",
            "bankName": "Bank of Maharashtra, Pune Main Branch",
            "transparencyEnabled": True,
            "socialLinks": {
                "facebook": "https://facebook.com/ShreeAmarGanesh",
                "instagram": "https://www.instagram.com/bappa_majha_offical_17?igsh=bnMyazE3aG91aTJv",
                "youtube": "https://youtube.com/@ShreeAmarGanesh"
            },
            "updatedAt": now
        }
        db.db.settings.update_one({"key": "mandal_settings"}, {"$set": settings_doc}, upsert=True)
        print("[OK] Settings seeded successfully.")

        # 3. Seed Events
        db.db.events.delete_many({"festivalYear": year})
        events = [
            {
                "festivalYear": year,
                "title": "श्री गणेश स्थापना व प्रतिष्ठापना महापूजा",
                "description": "पारंपरिक वाद्यांच्या गजरात बाप्पांचे भव्य आगमन आणि विधिवत प्रतिष्ठापना पूजा.",
                "date": "2026-08-28",
                "startTime": "०९:०० AM",
                "endTime": "१२:३० PM",
                "location": "मुख्य मंडप, अमर गणेश चौक",
                "organizer": "पूजा व धार्मिक समिती",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "दैनिक महाआरती व भजन संध्या",
                "description": "दररोज सकाळी ८:०० व संध्याकाळी ८:०० वाजता महाआरती, त्यानंतर स्थानिक कलाकारांचे भजन.",
                "date": "2026-08-29",
                "startTime": "०८:०० PM",
                "endTime": "१०:०० PM",
                "location": "मुख्य मंडप",
                "organizer": "सांस्कृतिक विभाग",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "भव्य रक्तदान व मोफत आरोग्य तपासणी शिबिर",
                "description": "मंडळाच्या सामाजिक बांधिलकी अंतर्गत ससून रक्तपेढीच्या सहकार्याने भव्य रक्तदान शिबिर.",
                "date": "2026-08-31",
                "startTime": "१०:०० AM",
                "endTime": "०४:०० PM",
                "location": "मंडप सभागृह",
                "organizer": "सामाजिक उपक्रम समिती",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "महिलांसाठी हळदी-कुंकू व रांगोळी स्पर्धा",
                "description": "परिसरातील माता-भगिनींसाठी भव्य हळदी-कुंकू समारंभ आणि पारितोषिक वितरण.",
                "date": "2026-09-02",
                "startTime": "०५:०० PM",
                "endTime": "०८:३० PM",
                "location": "महिला विकास केंद्र",
                "organizer": "महिला आघाडी",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "अन्नदान व भव्य महाप्रसाद वाटप",
                "description": "भक्तांसाठी अखंड महाप्रसादाचे आयोजन. ५,००० हून अधिक भाविक प्रसादाचा लाभ घेतील.",
                "date": "2026-09-05",
                "startTime": "१२:०० PM",
                "endTime": "०६:०० PM",
                "location": "महाप्रसाद मंडप",
                "organizer": "प्रसाद व स्वयंपाक समिती",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "भव्य विसर्जन मिरवणूक (ध्वज-ढोल-ताशा पथक)",
                "description": "पारंपरिक ढोल-ताशा पथक, लेझीम आणि गुलालाच्या उधळणीत बाप्पांना भावपूर्ण निरोप.",
                "date": "2026-09-08",
                "startTime": "०४:०० PM",
                "endTime": "११:०० PM",
                "location": "अमर गणेश चौक ते विसर्जन घाट",
                "organizer": "मिरवणूक समिती",
                "isPublished": True,
                "status": "upcoming",
                "createdAt": now
            }
        ]
        db.db.events.insert_many(events)
        print("[OK] Events seeded successfully.")

        # 4. Seed Social Activities
        db.db.social_activities.delete_many({})
        social_acts = [
            {
                "title": "रक्तदान शिबिर (Blood Donation)",
                "statNumber": "150+",
                "statLabel": "रक्तदात्यांचा सहभाग",
                "description": "दरवर्षी ससून जनरल हॉस्पिटल व स्थानिक रक्तपेढ्यांच्या सहकार्याने यशस्वी रक्तदान शिबिर.",
                "order": 1,
                "active": True,
                "createdAt": now
            },
            {
                "title": "वृक्षारोपण मोहीम (Tree Plantation)",
                "statNumber": "300+",
                "statLabel": "लागवड व संवर्धन केलेली झाडे",
                "description": "पर्यावरणपूरक गणेशोत्सवाचा संदेश देत टेकडी व कॉलनी परिसरात वृक्षारोपण मोहीम.",
                "order": 2,
                "active": True,
                "createdAt": now
            },
            {
                "title": "शैक्षणिक मदत (Student Support)",
                "statNumber": "85+",
                "statLabel": "विद्यार्थ्यांना वह्या-पुस्तके वाटप",
                "description": "गरजू आणि हुशार शालेय विद्यार्थ्यांना शैक्षणिक साहित्य, वह्या आणि दप्तरांचे वाटप.",
                "order": 3,
                "active": True,
                "createdAt": now
            },
            {
                "title": "आरोग्य व नेत्र तपासणी (Health Camp)",
                "statNumber": "450+",
                "statLabel": "ज्येष्ठ नागरिक तपासणी",
                "description": "परिसरातील नागरिकांसाठी तज्ज्ञ डॉक्टरांच्या उपस्थितीत मोफत बीपी, शुगर आणि नेत्र तपासणी.",
                "order": 4,
                "active": True,
                "createdAt": now
            }
        ]
        db.db.social_activities.insert_many(social_acts)
        print("[OK] Social Activities seeded successfully.")

        # 5. Seed Announcements
        db.db.announcements.delete_many({})
        announcements = [
            {
                "festivalYear": year,
                "title": "🔔 कार्यकर्त्यांची नियोजन बैठक",
                "message": "गणेशोत्सव २०२६ च्या नियोजनासाठी सर्व पदाधिकारी व कार्यकर्त्यांची बैठक उद्या रात्री ८ वाजता मंडपात आयोजित केली आहे.",
                "priority": "high",
                "active": True,
                "publishDate": now,
                "createdBy": "Admin",
                "createdAt": now
            },
            {
                "festivalYear": year,
                "title": "🌺 डिजिटल वर्गणी पोर्टल सुरू",
                "message": "मंडळाने यंदा डिजिटल पावती व ऑनलाइन वर्गणी सुविधा सुरू केली आहे. आपले सहकार्य नोंदवा व त्वरित अधिकृत पावती मिळवा.",
                "priority": "medium",
                "active": True,
                "publishDate": now,
                "createdBy": "Treasurer",
                "createdAt": now
            }
        ]
        db.db.announcements.insert_many(announcements)
        print("[OK] Announcements seeded successfully.")

        # 6. Seed Realistic Members & Receipts
        db.db.members.delete_many({"festivalYear": year})
        db.db.receipts.delete_many({"festivalYear": year})
        db.db.income.delete_many({"festivalYear": year})
        db.db.expenses.delete_many({"festivalYear": year})
        db.db.counters.delete_many({})

        # Initial sample members
        sample_members = [
            {"name": "श्री. विजय रामचंद्र कुलकर्णी", "mobile": "9822011223", "address": "फ्लॅट क्र. ४, गणेश रेसिडेन्सी, शनिवार पेठ", "area": "शनिवार पेठ", "amount": 5001.0, "mode": "online"},
            {"name": "सौ. सुप्रिया प्रकाश देसाई", "mobile": "9822044556", "address": "घर क्र. १२८, अमर चौक", "area": "अमर चौक", "amount": 2500.0, "mode": "cash"},
            {"name": "श्री. मंगेश दत्तात्रय माने", "mobile": "9822077889", "address": "सदाशिव पेठ, पुणे", "area": "सदाशिव पेठ", "amount": 10001.0, "mode": "online"},
            {"name": "श्री. आनंद बाळकृष्ण जोशी", "mobile": "9822099001", "address": "लक्ष्मी रोड, पुणे", "area": "लक्ष्मी रोड", "amount": 1100.0, "mode": "cash"},
            {"name": "मे. समर्थ ऑटोमोबाईल्स (प्रायोजक)", "mobile": "9822033445", "address": "शिवाजी नगर, पुणे", "area": "शिवाजी नगर", "amount": 25000.0, "mode": "online"}
        ]

        for i, sm in enumerate(sample_members, 1):
            receipt_no = f"AMGM-{year}-{i:06d}"
            mem_id = f"MEM-{year}-{i:04d}"
            
            # Member
            mem_doc = {
                "memberId": mem_id,
                "name": sm["name"],
                "mobile": sm["mobile"],
                "address": sm["address"],
                "area": sm["area"],
                "totalContribution": sm["amount"],
                "lastContributionDate": now,
                "assignedCollector": "श्री. सचिन जोशी (खजिनदार)",
                "festivalYear": year,
                "status": "active",
                "createdAt": now,
                "updatedAt": now
            }
            m_res = db.db.members.insert_one(mem_doc)
            
            # Receipt
            rec_doc = {
                "receiptNumber": receipt_no,
                "festivalYear": year,
                "donorName": sm["name"],
                "donorMobile": sm["mobile"],
                "donorAddress": sm["address"],
                "memberId": str(m_res.inserted_id),
                "amount": sm["amount"],
                "paymentMode": sm["mode"],
                "transactionRef": f"TXN-2026-{1000+i}",
                "notes": "वार्षिक गणेशोत्सव वर्गणी २०२६",
                "status": "ACTIVE",
                "collectedBy": "system",
                "collectedByName": "श्री. सचिन जोशी (खजिनदार)",
                "createdAt": now,
                "updatedAt": now
            }
            r_res = db.db.receipts.insert_one(rec_doc)
            
            # Income
            inc_doc = {
                "festivalYear": year,
                "date": now,
                "category": "Sponsorship" if "प्रायोजक" in sm["name"] else "Vargani",
                "amount": sm["amount"],
                "description": f"पावती क्र. {receipt_no} - {sm['name']}",
                "paymentMode": sm["mode"],
                "referenceNumber": rec_doc["transactionRef"],
                "receiptId": str(r_res.inserted_id),
                "receiptNumber": receipt_no,
                "donorName": sm["name"],
                "status": "ACTIVE",
                "addedByName": "श्री. सचिन जोशी (खजिनदार)",
                "createdAt": now
            }
            db.db.income.insert_one(inc_doc)

        db.db.counters.insert_one({"_id": f"receipt_AMGM_{year}", "seq": len(sample_members)})
        db.db.counters.insert_one({"_id": f"member_{year}", "seq": len(sample_members)})
        print(f"[OK] {len(sample_members)} Members, Receipts and Incomes seeded.")

        # 7. Seed Sample Expenses
        sample_expenses = [
            {"category": "Decoration", "amount": 18500.0, "vendor": "रंगोली डेकोरेटर्स", "desc": "मंडप अंतर्गत कापडी सजावट व थर्माकोल डिझाईन", "bill": "BILL-101"},
            {"category": "Sound", "amount": 12000.0, "vendor": "स्वरधारा साऊंड सिस्टिम्स", "desc": "उत्सव १० दिवसांची साऊंड सिस्टिम व माईक्स", "bill": "BILL-102"},
            {"category": "Lighting", "amount": 8500.0, "vendor": "ओम इलेक्ट्रिकल्स", "desc": "मंडप व प्रवेशद्वार रोषणाई", "bill": "BILL-103"},
            {"category": "Puja material", "amount": 3400.0, "vendor": "श्री पूजा भंडार", "desc": "गणेश स्थापना व दैनिक पूजा साहित्य", "bill": "BILL-104"},
            {"category": "Prasad", "amount": 4200.0, "vendor": "चितळे स्वीट्स", "desc": "मोदक व पेढे प्रसाद", "bill": "BILL-105"}
        ]

        for exp in sample_expenses:
            db.db.expenses.insert_one({
                "festivalYear": year,
                "date": now,
                "category": exp["category"],
                "amount": exp["amount"],
                "description": exp["desc"],
                "vendor": exp["vendor"],
                "billNumber": exp["bill"],
                "paymentMode": "online",
                "status": "ACTIVE",
                "addedByName": "श्री. सचिन जोशी (खजिनदार)",
                "createdAt": now
            })
        print(f"[OK] {len(sample_expenses)} Initial Expenses seeded.")

        # 8. Seed Tasks
        db.db.tasks.delete_many({"festivalYear": year})
        sample_tasks = [
            {"title": "मंडप उभारणीची पाहणी व विद्युत तपासणी", "desc": "मुख्य मंडपाची सुरक्षितता व वीज कनेक्शनचे ऑडिट करणे.", "dept": "मंडप व्यवस्थापन", "priority": "Urgent", "status": "Pending", "due": "2026-08-25"},
            {"title": "ससून हॉस्पिटलशी संपर्क करून रक्तदान शिबिर जागा निश्चिती", "desc": "डॉक्टरांचे पथक व रक्त संकलन युनिटची वेळ निश्चित करणे.", "dept": "सामाजिक उपक्रम", "priority": "High", "status": "In Progress", "due": "2026-08-26"},
            {"title": "आरती पुस्तिका व डिजिटल क्यूआर स्टँडीज छपाई", "desc": "मंडपात ठेवण्यासाठी ५०० आरती पुस्तिका व ५ क्यूआर स्टँडीज आणणे.", "dept": "प्रचार व प्रसार", "priority": "Medium", "status": "Completed", "due": "2026-08-24"},
            {"title": "विसर्जन मिरवणूक पोलीस व वाहतूक परवानगी घेणे", "desc": "विश्रामबाग पोलीस ठाण्याकडून मिरवणूक परवानगी पत्र घेणे.", "dept": "सुरक्षा व प्रशासन", "priority": "High", "status": "Pending", "due": "2026-08-27"}
        ]
        for t in sample_tasks:
            db.db.tasks.insert_one({
                "festivalYear": year,
                "title": t["title"],
                "description": t["desc"],
                "department": t["dept"],
                "priority": t["priority"],
                "status": t["status"],
                "dueDate": t["due"],
                "assignedToName": "श्री. ओंकार गायकवाड (कार्यकर्ता)",
                "createdByName": "Admin",
                "createdAt": now,
                "updatedAt": now
            })
        print(f"[OK] {len(sample_tasks)} Tasks seeded.")

        # 9. Seed Gallery with real assets
        db.db.gallery.delete_many({"festivalYear": year})
        gallery_items = [
            {"imageUrl": "/assets/Ganpanti Bappa Photo (5).jpg", "caption": "श्री अमर गणेश उत्सव - बाप्पांचे विलोभनीय रूप", "category": "Ganesh Sthapana", "isFeatured": True},
            {"imageUrl": "/assets/Memories Photo 1.jpg", "caption": "मंडळ सुवर्णमहोत्सव आठवणी व महाआरती", "category": "Aarti", "isFeatured": True},
            {"imageUrl": "/assets/Memories Photo (6).jpg", "caption": "भव्य विसर्जन मिरवणूक व जल्लोष", "category": "Visarjan", "isFeatured": True},
            {"imageUrl": "/assets/Memories Photo (4).jpg", "caption": "सांस्कृतिक कार्यक्रम व पारितोषिक वितरण", "category": "Cultural Events", "isFeatured": False},
            {"imageUrl": "/assets/Memories Photo (3).jpg", "caption": "रक्तदान शिबिर व सामाजिक उपक्रम", "category": "Social Activities", "isFeatured": False},
            {"imageUrl": "/assets/Memories Photo (2).jpg", "caption": "कार्यकर्त्यांची एकजूट व मंडप उभारणी", "category": "Memories", "isFeatured": False},
            {"imageUrl": "/assets/Memories Photo (5).jpg", "caption": "अखंड महाप्रसाद वाटप व भाविकांची उपस्थिती", "category": "Mahaprasad", "isFeatured": False}
        ]
        for g in gallery_items:
            db.db.gallery.insert_one({
                "festivalYear": year,
                "imageUrl": g["imageUrl"],
                "caption": g["caption"],
                "category": g["category"],
                "date": "2026-08-20",
                "isFeatured": g["isFeatured"],
                "uploadedBy": "Admin",
                "createdAt": now
            })
        print(f"[OK] {len(gallery_items)} Gallery photos seeded.")

        print("\n=======================================================")
        print("[OK] ALL DATABASE TABLES AND SEED DATA INITIALIZED!")
        print("=======================================================")
        print("Default Accounts Created:")
        print("1. Super Admin:     admin        / Admin@AMGM2026")
        print("2. Treasurer:       treasurer    / Treasurer@AMGM2026")
        print("3. Receipt Manager: receipt_mgr  / Receipt@AMGM2026")
        print("4. Event Manager:   event_mgr    / Events@AMGM2026")
        print("5. Volunteer:       volunteer1   / Volunteer@AMGM2026")
        print("=======================================================\n")

if __name__ == "__main__":
    seed_database()
