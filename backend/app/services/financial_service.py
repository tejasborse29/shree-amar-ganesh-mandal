import datetime
from app.extensions import db
from app.config import Config

def get_financial_summary(festival_year: int = 2026, start_date=None, end_date=None) -> dict:
    """
    Returns server-authoritative financial totals and chart distributions
    for the active festival year and optional date range.
    Formula: Current Balance = Total Income - Total Expenses
    """
    if db.db is None:
        return {
            "totalIncome": 0,
            "totalExpenses": 0,
            "currentBalance": 0,
            "totalPendingCollection": 0,
            "receiptCount": 0,
            "activeMembers": 0,
            "activeVolunteers": 0,
            "upcomingEvents": 0,
            "incomeByCategory": [],
            "expenseByCategory": [],
            "paymentModeDistribution": [],
            "workerWiseCollection": [],
            "dateWiseTrend": [],
            "monthlyTrend": []
        }
    
    # 1. Base Match Query
    match_income = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    match_expense = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    
    if start_date and end_date:
        try:
            sd = datetime.datetime.fromisoformat(start_date)
            ed = datetime.datetime.fromisoformat(end_date)
            match_income["date"] = {"$gte": sd, "$lte": ed}
            match_expense["date"] = {"$gte": sd, "$lte": ed}
        except Exception:
            pass

    # 1. Total Active Income
    income_res = list(db.db.income.aggregate([
        {"$match": match_income},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]))
    total_income = float(income_res[0]["total"]) if income_res else 0.0

    # 2. Total Active Expenses
    expense_res = list(db.db.expenses.aggregate([
        {"$match": match_expense},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]))
    total_expenses = float(expense_res[0]["total"]) if expense_res else 0.0
    
    # Strict Mathematical Rule: Balance = Income - Expenses
    current_balance = total_income - total_expenses

    # 3. Pending Collections Calculation
    pending_res = list(db.db.members.aggregate([
        {"$match": {"festivalYear": festival_year, "status": "pending"}},
        {"$group": {"_id": None, "total": {"$sum": "$pendingAmount"}}}
    ]))
    total_pending = float(pending_res[0]["total"]) if pending_res else 0.0

    # 4. Receipt Counts
    active_receipts = db.db.receipts.count_documents({"festivalYear": festival_year, "status": "ACTIVE"})
    cancelled_receipts = db.db.receipts.count_documents({"festivalYear": festival_year, "status": "CANCELLED"})

    # 5. Member and Volunteer Counts
    active_members = db.db.members.count_documents({"status": "active"})
    active_volunteers = db.db.users.count_documents({"isActive": True})
    upcoming_events = db.db.events.count_documents({"festivalYear": festival_year, "isPublished": True})

    # 6. Income by Category (Head-wise)
    income_cat_pipeline = [
        {"$match": match_income},
        {"$group": {"_id": "$category", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    income_by_category = [
        {"category": item["_id"] or "वर्गणी", "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.income.aggregate(income_cat_pipeline)
    ]

    # 7. Expense by Category (Head-wise)
    expense_cat_pipeline = [
        {"$match": match_expense},
        {"$group": {"_id": "$category", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    expense_by_category = [
        {"category": item["_id"] or "इतर खर्च", "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.expenses.aggregate(expense_cat_pipeline)
    ]

    # 8. Payment Mode Distribution (Mode-wise)
    pay_mode_pipeline = [
        {"$match": match_income},
        {"$group": {"_id": "$paymentMode", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    payment_mode_dist = [
        {"mode": (item["_id"] or "cash").upper(), "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.income.aggregate(pay_mode_pipeline)
    ]

    # 9. Worker-wise Collection
    worker_pipeline = [
        {"$match": match_income},
        {"$group": {"_id": "$collectedByName", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    worker_wise = [
        {"workerName": item["_id"] or "समिती", "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.income.aggregate(worker_pipeline)
    ]

    # 10. Monthly Trend (Income vs Expenses)
    trend_income = {
        item["_id"]: float(item["amount"])
        for item in db.db.income.aggregate([
            {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m", "date": "$date"}}, "amount": {"$sum": "$amount"}}}
        ]) if item["_id"]
    }
    
    trend_expense = {
        item["_id"]: float(item["amount"])
        for item in db.db.expenses.aggregate([
            {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m", "date": "$date"}}, "amount": {"$sum": "$amount"}}}
        ]) if item["_id"]
    }

    all_months = sorted(list(set(trend_income.keys()) | set(trend_expense.keys())))
    monthly_trend = [
        {
            "month": m,
            "income": trend_income.get(m, 0.0),
            "expense": trend_expense.get(m, 0.0),
            "balance": trend_income.get(m, 0.0) - trend_expense.get(m, 0.0)
        }
        for m in all_months
    ]

    return {
        "festivalYear": festival_year,
        "financialYear": f"{festival_year}-{str(festival_year+1)[-2:]}",
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "currentBalance": current_balance,
        "totalPendingCollection": total_pending,
        "receiptCount": active_receipts,
        "cancelledReceiptCount": cancelled_receipts,
        "activeMembers": active_members,
        "activeVolunteers": active_volunteers,
        "upcomingEvents": upcoming_events,
        "incomeByCategory": income_by_category,
        "expenseByCategory": expense_by_category,
        "paymentModeDistribution": payment_mode_dist,
        "workerWiseCollection": worker_wise,
        "monthlyTrend": monthly_trend
    }
