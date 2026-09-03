import io
import csv
import datetime
from flask import Blueprint, request, jsonify, g, send_file, Response

from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.financial_service import get_financial_summary
from app.utils.helpers import serialize_docs, format_inr
from app.utils.pdf_generator import generate_financial_report_pdf, generate_ledger_pdf

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/financial", methods=["GET"])
@token_required
@role_required("super_admin", "treasurer")
def get_financial_report():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    festival_name = request.args.get("festival", "").strip()
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    
    summary = get_financial_summary(festival_year, start_date=start_date, end_date=end_date, festival_name=festival_name if festival_name else None)
    
    # Optional detailed lists
    income_query = {"status": {"$ne": "CANCELLED"}}
    expense_query = {"status": {"$ne": "CANCELLED"}}

    if festival_name and festival_name != "सर्व उत्सव" and festival_year > 0:
        income_query["festivalName"] = festival_name
        income_query["festivalYear"] = festival_year
        expense_query["festivalName"] = festival_name
        expense_query["festivalYear"] = festival_year
    elif festival_name and festival_name != "सर्व उत्सव":
        income_query["festivalName"] = festival_name
        expense_query["festivalName"] = festival_name
    elif festival_year > 0:
        income_query["festivalYear"] = festival_year
        expense_query["festivalYear"] = festival_year
    
    if start_date and end_date:
        try:
            s_dt = datetime.datetime.fromisoformat(start_date)
            e_dt = datetime.datetime.fromisoformat(end_date) + datetime.timedelta(days=1)
            income_query["date"] = {"$gte": s_dt, "$lt": e_dt}
            expense_query["date"] = {"$gte": s_dt, "$lt": e_dt}
        except Exception:
            pass
        
    income_records = list(db.db.income.find(income_query).sort("date", -1).limit(100))
    expense_records = list(db.db.expenses.find(expense_query).sort("date", -1).limit(100))
    
    return jsonify({
        "success": True,
        "summary": summary,
        "recentIncome": serialize_docs(income_records),
        "recentExpenses": serialize_docs(expense_records)
    }), 200

@reports_bp.route("/export-csv", methods=["GET"])
@token_required
@role_required("super_admin", "treasurer")
def export_csv_report():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    mandal_name = settings.get("mandalName", Config.MANDAL_NAME)
    
    output = io.StringIO()
    # Write UTF-8 BOM so Microsoft Excel and spreadsheet tools display Marathi correctly
    output.write('\ufeff')
    writer = csv.writer(output)
    
    # Unified Professional Table Columns (Row 1 Header for Excel Table compatibility)
    writer.writerow([
        "अ.क्र. (Sr No)",
        "दिनांक (Date)",
        "प्रकार (Type)",
        "प्रवर्ग (Category)",
        "तपशील / नाव / विक्रेता (Party / Description)",
        "जमा रक्कम (Credit ₹)",
        "खर्च रक्कम (Debit ₹)",
        "भरणा पद्धत (Mode)",
        "पावती / संदर्भ (Receipt/Bill No)",
        "नोंद कर्ता (Added By)",
        "स्थिती (Status)"
    ])
    
    incomes = list(db.db.income.find({"festivalYear": festival_year}))
    expenses = list(db.db.expenses.find({"festivalYear": festival_year}))
    
    # Merge and sort chronologically
    combined = []
    for inc in incomes:
        combined.append({
            "date": str(inc.get("date", ""))[:10],
            "type": "जमा (INCOME)",
            "category": inc.get("category", "वर्गणी"),
            "party": inc.get("donorName", "") or inc.get("source", ""),
            "credit": float(inc.get("amount", 0)),
            "debit": 0.0,
            "mode": inc.get("paymentMode", "CASH"),
            "ref": inc.get("receiptNumber", "") or inc.get("referenceNumber", ""),
            "addedBy": inc.get("addedByName", ""),
            "status": inc.get("status", "ACTIVE")
        })
    for exp in expenses:
        combined.append({
            "date": str(exp.get("date", ""))[:10],
            "type": "खर्च (EXPENSE)",
            "category": exp.get("category", "इतर खर्च"),
            "party": f"{exp.get('vendor', '')} - {exp.get('description', '')}".strip(" -"),
            "credit": 0.0,
            "debit": float(exp.get("amount", 0)),
            "mode": exp.get("paymentMode", "CASH"),
            "ref": exp.get("billNumber", "") or "बिल",
            "addedBy": exp.get("addedByName", ""),
            "status": exp.get("status", "APPROVED")
        })
        
    combined.sort(key=lambda x: x["date"])
    
    total_credit = 0.0
    total_debit = 0.0
    
    for idx, row in enumerate(combined, 1):
        total_credit += row["credit"]
        total_debit += row["debit"]
        writer.writerow([
            idx,
            row["date"],
            row["type"],
            row["category"],
            row["party"],
            row["credit"] if row["credit"] > 0 else "0",
            row["debit"] if row["debit"] > 0 else "0",
            row["mode"].upper(),
            row["ref"],
            row["addedBy"],
            row["status"]
        ])
        
    # Table Summary / Total Row
    writer.writerow([])
    writer.writerow([
        "",
        "",
        "एकूण (TOTAL)",
        "",
        "",
        f"₹ {total_credit:,.2f}",
        f"₹ {total_debit:,.2f}",
        "",
        "",
        "",
        f"शिल्लक: ₹ {(total_credit - total_debit):,.2f}"
    ])
    writer.writerow([])
    writer.writerow(["स्वाक्षरी: अध्यक्ष / President", "", "", "", "", "स्वाक्षरी: खजिनदार / Treasurer"])
            
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename=AMGM_Financial_Report_{festival_year}.csv"}
    )

@reports_bp.route("/export-pdf", methods=["GET"])
@reports_bp.route("/download-pdf", methods=["GET"])
@token_required
@role_required("super_admin", "treasurer")
def export_pdf_report():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    summary = get_financial_summary(festival_year)
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {
        "mandalName": Config.MANDAL_NAME,
        "mandalTagline": Config.MANDAL_TAGLINE
    }
    
    mandal_info = {
        "name": settings.get("mandalName", Config.MANDAL_NAME),
        "tagline": settings.get("mandalTagline", Config.MANDAL_TAGLINE)
    }
    
    pdf_bytes = generate_financial_report_pdf(summary, mandal_info, festival_year)
    
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"AMGM_Financial_Statement_{festival_year}.pdf"
    )

@reports_bp.route("/ledger-pdf", methods=["GET"])
@token_required
@role_required("super_admin", "treasurer")
def download_ledger_pdf():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {
        "mandalName": Config.MANDAL_NAME,
        "mandalTagline": Config.MANDAL_TAGLINE
    }
    
    # Fetch all incomes and expenses for festival year
    incomes = list(db.db.income.find({"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}))
    expenses = list(db.db.expenses.find({"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}))
    
    items = []
    for inc in incomes:
        items.append({
            "type": "income",
            "isIncome": True,
            "amount": float(inc.get("amount", 0)),
            "personName": inc.get("source") or inc.get("donorName") or "देणगीदार",
            "category": inc.get("category", "वर्गणी"),
            "receiptNumber": inc.get("receiptNumber", ""),
            "date": inc.get("date") or inc.get("createdAt"),
            "dateDay": str(inc.get("date") or inc.get("createdAt") or "")[:10]
        })
    for exp in expenses:
        items.append({
            "type": "expense",
            "isIncome": False,
            "amount": float(exp.get("amount", 0)),
            "personName": exp.get("vendor") or "खर्च",
            "category": exp.get("category", "इतर"),
            "billNumber": exp.get("billNumber", ""),
            "receiptNumber": "",
            "date": exp.get("date") or exp.get("createdAt"),
            "dateDay": str(exp.get("date") or exp.get("createdAt") or "")[:10]
        })
        
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
    
    mandal_info = {
        "name": settings.get("mandalName", Config.MANDAL_NAME),
        "tagline": settings.get("mandalTagline", Config.MANDAL_TAGLINE)
    }
    
    pdf_bytes = generate_ledger_pdf(items, mandal_info, festival_year)
    
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"AMGM_General_Ledger_{festival_year}.pdf"
    )
