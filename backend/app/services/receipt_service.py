import datetime
from bson import ObjectId
from pymongo import ReturnDocument
from app.extensions import db
from app.config import Config
from app.services.audit_service import log_audit_action

def get_next_receipt_number(festival_year: int = 2026) -> str:
    """
    Atomically increments counter for festival year and returns e.g. AMGM-2026-000001
    """
    prefix = Config.MANDAL_RECEIPT_PREFIX
    counter_id = f"receipt_{prefix}_{festival_year}"
    
    counter = db.db.counters.find_one_and_update(
        {"_id": counter_id},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    
    seq = counter.get("seq", 1)
    return f"{prefix}-{festival_year}-{seq:06d}"

def create_receipt_record(data: dict, current_user: dict) -> dict:
    """
    Creates a new digital receipt, associates with member/donor, creates verified income record.
    """
    festival_year = int(data.get("festivalYear", Config.DEFAULT_FESTIVAL_YEAR))
    amount = float(data.get("amount", 0))
    if amount <= 0:
        raise ValueError("रक्कम शून्य किंवा त्याहून कमी असू शकत नाही (Amount must be positive)")
        
    receipt_number = get_next_receipt_number(festival_year)
    now = datetime.datetime.now(datetime.timezone.utc)
    
    donor_name = data.get("donorName", "").strip()
    donor_mobile = data.get("donorMobile", "").strip()
    donor_address = data.get("donorAddress", "").strip()
    donor_email = data.get("donorEmail", "").strip()
    payment_mode = data.get("paymentMode", "cash").lower()
    transaction_ref = data.get("transactionRef", "").strip()
    notes = data.get("notes", "").strip()
    
    # 1. Check or create/update Member record
    member_id = data.get("memberId")
    if donor_mobile:
        existing_member = db.db.members.find_one({"mobile": donor_mobile})
        if existing_member:
            member_id = str(existing_member["_id"])
            db.db.members.update_one(
                {"_id": existing_member["_id"]},
                {
                    "$inc": {"totalContribution": amount},
                    "$set": {"lastContributionDate": now, "updatedAt": now}
                }
            )
        else:
            # Auto-create member
            member_seq = db.db.counters.find_one_and_update(
                {"_id": f"member_{festival_year}"},
                {"$inc": {"seq": 1}},
                upsert=True,
                return_document=ReturnDocument.AFTER
            ).get("seq", 1)
            
            new_mem = {
                "memberId": f"MEM-{festival_year}-{member_seq:04d}",
                "name": donor_name,
                "mobile": donor_mobile,
                "address": donor_address,
                "email": donor_email,
                "area": data.get("area", "स्थानिक / Local"),
                "totalContribution": amount,
                "lastContributionDate": now,
                "assignedCollector": current_user.get("name", ""),
                "festivalYear": festival_year,
                "status": "active",
                "createdAt": now,
                "updatedAt": now
            }
            res = db.db.members.insert_one(new_mem)
            member_id = str(res.inserted_id)
            
    # 2. Create Receipt Document
    receipt_doc = {
        "receiptNumber": receipt_number,
        "festivalYear": festival_year,
        "donorName": donor_name,
        "donorMobile": donor_mobile,
        "donorAddress": donor_address,
        "donorEmail": donor_email,
        "memberId": member_id,
        "amount": amount,
        "paymentMode": payment_mode,
        "transactionRef": transaction_ref,
        "notes": notes,
        "status": "ACTIVE",
        "collectedBy": current_user.get("id"),
        "collectedByUsername": current_user.get("username"),
        "collectedByName": current_user.get("name"),
        "createdAt": now,
        "updatedAt": now
    }
    
    receipt_res = db.db.receipts.insert_one(receipt_doc)
    receipt_doc["_id"] = receipt_res.inserted_id
    receipt_doc["id"] = str(receipt_res.inserted_id)
    
    # 3. Create Corresponding Income Entry (Server-Authoritative)
    income_doc = {
        "festivalYear": festival_year,
        "date": now,
        "category": "Vargani",
        "amount": amount,
        "description": f"पावती क्र. {receipt_number} - {donor_name}",
        "paymentMode": payment_mode,
        "referenceNumber": transaction_ref or receipt_number,
        "receiptId": str(receipt_res.inserted_id),
        "receiptNumber": receipt_number,
        "donorName": donor_name,
        "status": "ACTIVE",
        "addedBy": current_user.get("id"),
        "addedByName": current_user.get("name"),
        "createdAt": now
    }
    db.db.income.insert_one(income_doc)
    
    # 4. Audit Log
    log_audit_action(
        user_info=current_user,
        action="RECEIPT_CREATED",
        target_type="receipt",
        target_id=str(receipt_res.inserted_id),
        details={"receiptNumber": receipt_number, "amount": amount, "donor": donor_name}
    )
    
    return receipt_doc

def cancel_receipt_record(receipt_id: str, reason: str, current_user: dict) -> dict:
    """
    Soft-cancels a receipt, adjusts member balance, and invalidates corresponding income record.
    """
    if not ObjectId.is_valid(receipt_id):
        raise ValueError("अवैध पावती ओळख (Invalid receipt ID)")
        
    receipt = db.db.receipts.find_one({"_id": ObjectId(receipt_id)})
    if not receipt:
        raise ValueError("पावती आढळली नाही (Receipt not found)")
        
    if receipt.get("status") == "CANCELLED":
        raise ValueError("ही पावती आधीच रद्द करण्यात आली आहे (Receipt already cancelled)")
        
    now = datetime.datetime.now(datetime.timezone.utc)
    amount = float(receipt.get("amount", 0))
    
    # Soft update receipt
    db.db.receipts.update_one(
        {"_id": ObjectId(receipt_id)},
        {
            "$set": {
                "status": "CANCELLED",
                "cancelledBy": current_user.get("id"),
                "cancelledByName": current_user.get("name"),
                "cancelReason": reason,
                "cancelledAt": now,
                "updatedAt": now
            }
        }
    )
    
    # Invalidate corresponding income
    db.db.income.update_one(
        {"receiptId": str(receipt_id)},
        {
            "$set": {
                "status": "CANCELLED",
                "cancelledBy": current_user.get("id"),
                "cancelledReason": reason,
                "cancelledAt": now
            }
        }
    )
    
    # Deduct total from member if applicable
    if receipt.get("donorMobile"):
        db.db.members.update_one(
            {"mobile": receipt.get("donorMobile")},
            {"$inc": {"totalContribution": -amount}}
        )
        
    # Audit log
    log_audit_action(
        user_info=current_user,
        action="RECEIPT_CANCELLED",
        target_type="receipt",
        target_id=str(receipt_id),
        details={"receiptNumber": receipt.get("receiptNumber"), "reason": reason, "amount": amount}
    )
    
    receipt["status"] = "CANCELLED"
    receipt["cancelReason"] = reason
    receipt["cancelledAt"] = now
    return receipt
