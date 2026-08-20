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
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    
    summary = get_financial_summary(festival_year, start_date=start_date, end_date=end_date)
    
    # Optional detailed lists
    income_query = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    expense_query = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    
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
    report_type = request.args.get("type", "all")
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    if report_type in ["income", "all"]:
        writer.writerow(["--- INCOME RECORDS (जमा नोंदी) ---"])
        writer.writerow(["Date", "Category", "Donor/Source", "Amount", "Mode", "Reference", "Added By", "Status"])
        incomes = db.db.income.find({"festivalYear": festival_year}).sort("date", -1)
        for inc in incomes:
            writer.writerow([
                str(inc.get("date", ""))[:10],
                inc.get("category", ""),
                inc.get("donorName", ""),
                inc.get("amount", 0),
                inc.get("paymentMode", ""),
                inc.get("referenceNumber", ""),
                inc.get("addedByName", ""),
                inc.get("status", "")
            ])
        writer.writerow([])
        
    if report_type in ["expense", "all"]:
        writer.writerow(["--- EXPENSE RECORDS (खर्च नोंदी) ---"])
        writer.writerow(["Date", "Category", "Description", "Vendor", "Amount", "Mode", "Bill No", "Status"])
        expenses = db.db.expenses.find({"festivalYear": festival_year}).sort("date", -1)
        for exp in expenses:
            writer.writerow([
                str(exp.get("date", ""))[:10],
                exp.get("category", ""),
                exp.get("description", ""),
                exp.get("vendor", ""),
                exp.get("amount", 0),
                exp.get("paymentMode", ""),
                exp.get("billNumber", ""),
                exp.get("status", "")
            ])
            
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
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
