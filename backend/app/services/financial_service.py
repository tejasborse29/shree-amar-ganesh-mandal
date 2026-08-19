from app.extensions import db
from app.config import Config

def get_financial_summary(festival_year: int = 2026) -> dict:
    """
    Returns server-authoritative financial totals and chart distributions.
    """
    if db.db is None:
        return {
            "totalIncome": 0,
            "totalExpenses": 0,
            "currentBalance": 0,
            "receiptCount": 0,
            "activeMembers": 0,
            "activeVolunteers": 0,
            "upcomingEvents": 0,
            "incomeByCategory": [],
            "expenseByCategory": [],
            "paymentModeDistribution": [],
            "monthlyTrend": []
        }
    
    # 1. Total Active Income
    income_pipeline = [
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    income_res = list(db.db.income.aggregate(income_pipeline))
    total_income = float(income_res[0]["total"]) if income_res else 0.0

    # 2. Total Active Expenses
    expense_pipeline = [
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    expense_res = list(db.db.expenses.aggregate(expense_pipeline))
    total_expenses = float(expense_res[0]["total"]) if expense_res else 0.0
    
    # Balance
    current_balance = total_income - total_expenses

    # 3. Receipt Counts
    active_receipts = db.db.receipts.count_documents({"festivalYear": festival_year, "status": "ACTIVE"})
    cancelled_receipts = db.db.receipts.count_documents({"festivalYear": festival_year, "status": "CANCELLED"})

    # 4. Member and Volunteer Counts
    active_members = db.db.members.count_documents({"status": "active"})
    active_volunteers = db.db.users.count_documents({"isActive": True})
    upcoming_events = db.db.events.count_documents({"festivalYear": festival_year, "isPublished": True})

    # 5. Income by Category
    income_cat_pipeline = [
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {"$group": {"_id": "$category", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    income_by_category = [
        {"category": item["_id"] or "Other", "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.income.aggregate(income_cat_pipeline)
    ]

    # 6. Expense by Category
    expense_cat_pipeline = [
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {"$group": {"_id": "$category", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}}
    ]
    expense_by_category = [
        {"category": item["_id"] or "Miscellaneous", "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.expenses.aggregate(expense_cat_pipeline)
    ]

    # 7. Payment Mode Distribution
    pay_mode_pipeline = [
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {"$group": {"_id": "$paymentMode", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    payment_mode_dist = [
        {"mode": (item["_id"] or "cash").upper(), "amount": float(item["amount"]), "count": item["count"]}
        for item in db.db.income.aggregate(pay_mode_pipeline)
    ]

    # 8. Monthly Trend (Income vs Expenses)
    # Aggregate by month string YYYY-MM
    trend_income = db.db.income.aggregate([
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$date"}},
                "income": {"$sum": "$amount"}
            }
        }
    ])
    trend_expense = db.db.expenses.aggregate([
        {"$match": {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$date"}},
                "expense": {"$sum": "$amount"}
            }
        }
    ])
    
    monthly_map = {}
    for item in trend_income:
        m = item["_id"] or "2026-08"
        monthly_map.setdefault(m, {"month": m, "income": 0, "expense": 0})
        monthly_map[m]["income"] = float(item["income"])
        
    for item in trend_expense:
        m = item["_id"] or "2026-08"
        monthly_map.setdefault(m, {"month": m, "income": 0, "expense": 0})
        monthly_map[m]["expense"] = float(item["expense"])
        
    monthly_trend = sorted(monthly_map.values(), key=lambda x: x["month"])

    return {
        "festivalYear": festival_year,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "currentBalance": current_balance,
        "receiptCount": active_receipts,
        "cancelledReceipts": cancelled_receipts,
        "activeMembers": active_members,
        "activeVolunteers": active_volunteers,
        "upcomingEvents": upcoming_events,
        "incomeByCategory": income_by_category,
        "expenseByCategory": expense_by_category,
        "paymentModeDistribution": payment_mode_dist,
        "monthlyTrend": monthly_trend
    }
