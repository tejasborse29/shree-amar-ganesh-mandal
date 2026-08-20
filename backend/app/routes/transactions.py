import datetime
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.audit_service import log_audit_action
from app.utils.helpers import serialize_doc, serialize_docs

transactions_bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")

@transactions_bp.route("", methods=["GET"])
@token_required
def get_transactions():
    """
    Returns a unified chronological feed of transactions:
    Types: 'all' | 'income' (जमा) | 'expense' (खर्च) | 'pending' (बाकी) | 'inkind' (वस्तू)
    """
    txn_type = request.args.get("type", "all").lower()
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    payment_mode = request.args.get("paymentMode", "").strip()
    worker = request.args.get("worker", "").strip()
    festival_year = request.args.get("year")
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 25))
    
    # 1. Fetch Income records
    income_query = {}
    if festival_year:
        income_query["festivalYear"] = int(festival_year)
    if payment_mode:
        income_query["paymentMode"] = payment_mode.lower()
    if category:
        income_query["category"] = {"$regex": category, "$options": "i"}
    if worker:
        income_query["$or"] = [
            {"collectedBy": worker},
            {"collectedByName": {"$regex": worker, "$options": "i"}}
        ]
    if start_date and end_date:
        try:
            sd = datetime.datetime.fromisoformat(start_date)
            ed = datetime.datetime.fromisoformat(end_date)
            income_query["date"] = {"$gte": sd, "$lte": ed}
        except Exception:
            pass
    if search:
        income_query["$or"] = [
            {"source": {"$regex": search, "$options": "i"}},
            {"donorName": {"$regex": search, "$options": "i"}},
            {"receiptNumber": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"transactionRef": {"$regex": search, "$options": "i"}}
        ]

    # 2. Fetch Expense records
    expense_query = {}
    if festival_year:
        expense_query["festivalYear"] = int(festival_year)
    if payment_mode:
        expense_query["paymentMode"] = payment_mode.lower()
    if category:
        expense_query["category"] = {"$regex": category, "$options": "i"}
    if worker:
        expense_query["$or"] = [
            {"createdBy": worker},
            {"createdByName": {"$regex": worker, "$options": "i"}}
        ]
    if start_date and end_date:
        try:
            sd = datetime.datetime.fromisoformat(start_date)
            ed = datetime.datetime.fromisoformat(end_date)
            expense_query["date"] = {"$gte": sd, "$lte": ed}
        except Exception:
            pass
    if search:
        expense_query["$or"] = [
            {"vendor": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"billNumber": {"$regex": search, "$options": "i"}}
        ]

    items = []

    # Include Incomes
    if txn_type in ["all", "income", "जमा"]:
        for inc in db.db.income.find(income_query):
            items.append({
                "id": str(inc["_id"]),
                "txnId": f"TXN-INC-{str(inc['_id'])[-6:].upper()}",
                "type": "income",
                "typeLabel": "जमा",
                "personName": inc.get("source") or inc.get("donorName") or "देणगीदार",
                "mobile": inc.get("donorMobile", ""),
                "amount": float(inc.get("amount", 0)),
                "category": inc.get("category", "वर्गणी"),
                "paymentMode": (inc.get("paymentMode") or "cash").upper(),
                "receiptNumber": inc.get("receiptNumber", ""),
                "date": inc.get("date") or inc.get("createdAt"),
                "collector": inc.get("collectedByName") or inc.get("collectedBy") or "समिती",
                "notes": inc.get("notes") or inc.get("description") or "",
                "status": inc.get("status", "ACTIVE"),
                "festivalYear": inc.get("festivalYear", 2026),
                "isIncome": True
            })

    # Include Expenses
    if txn_type in ["all", "expense", "खर्च"]:
        for exp in db.db.expenses.find(expense_query):
            items.append({
                "id": str(exp["_id"]),
                "txnId": f"TXN-EXP-{str(exp['_id'])[-6:].upper()}",
                "type": "expense",
                "typeLabel": "खर्च",
                "personName": exp.get("vendor") or "विक्रेता",
                "mobile": exp.get("vendorMobile", ""),
                "amount": float(exp.get("amount", 0)),
                "category": exp.get("category", "इतर खर्च"),
                "paymentMode": (exp.get("paymentMode") or "cash").upper(),
                "billNumber": exp.get("billNumber", ""),
                "receiptNumber": "",
                "date": exp.get("date") or exp.get("createdAt"),
                "collector": exp.get("createdByName") or exp.get("createdBy") or "समिती",
                "notes": exp.get("description", ""),
                "status": exp.get("status", "ACTIVE"),
                "festivalYear": exp.get("festivalYear", 2026),
                "isIncome": False
            })

    # Include Pending Collections
    if txn_type in ["all", "pending", "बाकी"]:
        pending_query = {"status": "pending"}
        if festival_year:
            pending_query["festivalYear"] = int(festival_year)
        if search:
            pending_query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"mobile": {"$regex": search, "$options": "i"}}
            ]
        for mem in db.db.members.find(pending_query):
            pending_amt = float(mem.get("pendingAmount", 0))
            if pending_amt > 0:
                items.append({
                    "id": str(mem["_id"]),
                    "txnId": f"TXN-PND-{str(mem['_id'])[-6:].upper()}",
                    "type": "pending",
                    "typeLabel": "बाकी",
                    "personName": mem.get("name", ""),
                    "mobile": mem.get("mobile", ""),
                    "amount": pending_amt,
                    "category": "बाकी वर्गणी",
                    "paymentMode": "बाकी",
                    "receiptNumber": "",
                    "date": mem.get("updatedAt") or mem.get("createdAt"),
                    "collector": mem.get("assignedCollector") or "मंडळ",
                    "notes": mem.get("notes", "बाकी वर्गणी नोंद"),
                    "status": "PENDING",
                    "festivalYear": mem.get("festivalYear", 2026),
                    "isIncome": False
                })

    # Sort all unified items descending by date
    def get_sort_key(item):
        d = item.get("date")
        if isinstance(d, datetime.datetime):
            return d.timestamp()
        if isinstance(d, str):
            try:
                return datetime.datetime.fromisoformat(d.replace("Z", "+00:00")).timestamp()
            except Exception:
                return 0
        return 0

    items.sort(key=get_sort_key, reverse=True)

    # Calculate financial summary metrics for this filter
    total_inc = sum(i["amount"] for i in items if i["type"] == "income" and i["status"] != "CANCELLED")
    total_exp = sum(i["amount"] for i in items if i["type"] == "expense" and i["status"] != "CANCELLED")
    total_pnd = sum(i["amount"] for i in items if i["type"] == "pending")
    net_bal = total_inc - total_exp

    total_records = len(items)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = items[start_idx:end_idx]

    # Format date strings for client
    for item in paginated_items:
        d = item.get("date")
        if isinstance(d, datetime.datetime):
            item["dateFormatted"] = d.strftime("%d %b %Y, %I:%M %p")
            item["dateIso"] = d.isoformat()
            item["dateDay"] = d.strftime("%Y-%m-%d")
        else:
            item["dateFormatted"] = str(d)
            item["dateIso"] = str(d)
            item["dateDay"] = str(d)[:10]

    return jsonify({
        "success": True,
        "transactions": paginated_items,
        "summary": {
            "totalIncome": total_inc,
            "totalExpenses": total_exp,
            "netBalance": net_bal,
            "totalPending": total_pnd,
            "totalCount": total_records
        },
        "pagination": {
            "total": total_records,
            "page": page,
            "limit": limit,
            "pages": (total_records + limit - 1) // limit if limit else 1
        }
    }), 200

@transactions_bp.route("/<id>/reverse", methods=["POST"])
@token_required
@role_required("super_admin", "treasurer")
def reverse_transaction(id):
    """
    Reverses or soft-cancels a transaction with mandatory audit trail log.
    Financial records are never erased.
    """
    data = request.get_json() or {}
    reason = data.get("reason", "समिती निर्णयानुसार रद्द").strip()
    txn_type = data.get("type", "income").lower()
    
    now = datetime.datetime.now(datetime.timezone.utc)
    
    if txn_type == "income":
        target = db.db.income.find_one({"_id": ObjectId(id)}) if ObjectId.is_valid(id) else None
        if not target:
            return jsonify({"success": False, "message": "जमा नोंद आढळली नाही"}), 404
            
        db.db.income.update_one(
            {"_id": target["_id"]},
            {"$set": {"status": "CANCELLED", "cancellationReason": reason, "cancelledAt": now, "cancelledBy": g.current_user["id"]}}
        )
        if target.get("receiptNumber"):
            db.db.receipts.update_one(
                {"receiptNumber": target["receiptNumber"]},
                {"$set": {"status": "CANCELLED", "cancellationReason": reason, "cancelledAt": now, "cancelledBy": g.current_user["id"]}}
            )
    else:
        target = db.db.expenses.find_one({"_id": ObjectId(id)}) if ObjectId.is_valid(id) else None
        if not target:
            return jsonify({"success": False, "message": "खर्च नोंद आढळली नाही"}), 404
            
        db.db.expenses.update_one(
            {"_id": target["_id"]},
            {"$set": {"status": "CANCELLED", "cancellationReason": reason, "cancelledAt": now, "cancelledBy": g.current_user["id"]}}
        )
        
    log_audit_action(
        action="TRANSACTION_REVERSE",
        target_entity="transactions",
        entity_id=str(id),
        details={"type": txn_type, "amount": target.get("amount"), "reason": reason},
        user_info=g.current_user
    )
    
    return jsonify({
        "success": True,
        "message": f"नोंद यशस्वीरीत्या रद्द (Reversed) करण्यात आली आहे."
    }), 200
