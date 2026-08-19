import io
import csv
import datetime
from flask import Blueprint, request, jsonify, g, send_file, Response
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

from app.extensions import db
from app.config import Config
from app.middleware.auth import token_required, role_required
from app.services.financial_service import get_financial_summary
from app.utils.helpers import serialize_docs, format_inr

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/financial", methods=["GET"])
@token_required
@role_required("super_admin", "treasurer")
def get_financial_report():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    
    summary = get_financial_summary(festival_year)
    
    # Optional detailed lists
    income_query = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    expense_query = {"festivalYear": festival_year, "status": {"$ne": "CANCELLED"}}
    
    if start_date and end_date:
        s_dt = datetime.datetime.fromisoformat(start_date)
        e_dt = datetime.datetime.fromisoformat(end_date) + datetime.timedelta(days=1)
        income_query["date"] = {"$gte": s_dt, "$lt": e_dt}
        expense_query["date"] = {"$gte": s_dt, "$lt": e_dt}
        
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
    report_type = request.args.get("type", "all") # income, expense, receipts, all
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
@token_required
@role_required("super_admin", "treasurer")
def export_pdf_report():
    festival_year = int(request.args.get("year", Config.DEFAULT_FESTIVAL_YEAR))
    summary = get_financial_summary(festival_year)
    settings = db.db.settings.find_one({"key": "mandal_settings"}) or {}
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle("T", fontName="Helvetica-Bold", fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor("#800000"))
    sub_style = ParagraphStyle("S", fontName="Helvetica", fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#4B5563"))
    
    mandal_name = settings.get("mandalName", Config.MANDAL_NAME)
    story.append(Paragraph(f"<b>{mandal_name}</b>", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"वार्षिक आर्थिक अहवाल (Financial Audit Statement) - {festival_year}", sub_style))
    story.append(Spacer(1, 15))
    
    # KPI Box
    kpi_data = [
        [
            Paragraph(f"<b>एकूण जमा (Total Income):</b><br/><font color='#16A34A' size=14><b>{format_inr(summary['totalIncome'])}</b></font>", ParagraphStyle("K1")),
            Paragraph(f"<b>एकूण खर्च (Total Expenses):</b><br/><font color='#DC2626' size=14><b>{format_inr(summary['totalExpenses'])}</b></font>", ParagraphStyle("K2")),
            Paragraph(f"<b>शिल्लक रक्कम (Net Balance):</b><br/><font color='#2563EB' size=14><b>{format_inr(summary['currentBalance'])}</b></font>", ParagraphStyle("K3"))
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[170, 170, 180])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#D1D5DB")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 20))
    
    # Expense Breakdown Table
    story.append(Paragraph("<b>खर्च प्रवर्ग विश्लेषण (Expense Categories)</b>", ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=12)))
    story.append(Spacer(1, 6))
    
    exp_rows = [["प्रवर्ग (Category)", "खर्च संख्या (Entries)", "रक्कम (Amount)"]]
    for item in summary["expenseByCategory"]:
        exp_rows.append([item["category"], str(item["count"]), format_inr(item["amount"])])
        
    if len(exp_rows) == 1:
        exp_rows.append(["कोणताही खर्च नाही", "0", "₹0.00"])
        
    exp_table = Table(exp_rows, colWidths=[240, 130, 150])
    exp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#800000")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(exp_table)
    story.append(Spacer(1, 30))
    
    # Signatures
    sig_data = [
        [
            Paragraph("_____________________<br/><b>अध्यक्ष (President)</b>", ParagraphStyle("P1", alignment=TA_CENTER)),
            Paragraph("_____________________<br/><b>कार्यवाह (Secretary)</b>", ParagraphStyle("P2", alignment=TA_CENTER)),
            Paragraph("_____________________<br/><b>खजिनदार (Treasurer)</b>", ParagraphStyle("P3", alignment=TA_CENTER))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[170, 170, 180])
    story.append(sig_table)
    
    doc.build(story)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"AMGM_Financial_Statement_{festival_year}.pdf"
    )
