import os
import io
import unicodedata
import qrcode
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Mukta TrueType Fonts (Complete bilingual support for Marathi Devanagari + English Latin + Rupee symbol)
FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fonts")
MUKTA_REGULAR = os.path.join(FONTS_DIR, "Mukta-Regular.ttf")
MUKTA_BOLD = os.path.join(FONTS_DIR, "Mukta-Bold.ttf")

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

try:
    if os.path.exists(MUKTA_REGULAR) and os.path.exists(MUKTA_BOLD):
        pdfmetrics.registerFont(TTFont("Mukta", MUKTA_REGULAR))
        pdfmetrics.registerFont(TTFont("Mukta-Bold", MUKTA_BOLD))
        FONT_REGULAR = "Mukta"
        FONT_BOLD = "Mukta-Bold"
        print("[OK] Registered Mukta bilingual font for PDF generation.")
except Exception as e:
    print(f"[WARN] Could not register Mukta font, falling back: {e}")

def sanitize_text(text) -> str:
    """Normalizes Unicode text to NFC to ensure Marathi glyphs render without splitting."""
    if not text:
        return ""
    text_str = str(text)
    return unicodedata.normalize("NFC", text_str)


def generate_receipt_pdf(receipt: dict, mandal: dict, verify_url: str = "") -> bytes:
    """
    Generates a high-quality, professional, bilingual A4 PDF digital receipt.
    Renders 100% crisp Marathi Devanagari and English Latin without character glitches.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Typography Styles using Mukta Bilingual font
    title_style = ParagraphStyle(
        "MandalTitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=20,
        leading=25,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#800000") # Deep Maroon
    )
    
    tagline_style = ParagraphStyle(
        "MandalTagline",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#D97706") # Gold
    )
    
    address_style = ParagraphStyle(
        "MandalAddress",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=9.5,
        leading=13.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4B5563")
    )
    
    receipt_banner_style = ParagraphStyle(
        "ReceiptBanner",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.whitesmoke
    )
    
    cell_label_style = ParagraphStyle(
        "CellLabel",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=10,
        leading=14.5,
        textColor=colors.HexColor("#374151")
    )
    
    cell_val_style = ParagraphStyle(
        "CellVal",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=10.5,
        leading=14.5,
        textColor=colors.HexColor("#111827")
    )

    qr_caption_style = ParagraphStyle(
        "QRCaption",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=8.5,
        leading=11.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#800000")
    )

    # 1. Header with Mandal Name
    mandal_name = sanitize_text(mandal.get("name", "श्री अमर गणेश मित्र मंडळ"))
    mandal_tagline = sanitize_text(mandal.get("tagline", "भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!"))
    mandal_address = sanitize_text(mandal.get("address", "अमर गणेश चौक, शनिवार पेठ, पुणे, महाराष्ट्र - ४११ ०३०"))
    contact_no = sanitize_text(mandal.get("contactNumber", "+91 98765 43210"))
    festival_year = sanitize_text(receipt.get("festivalYear", mandal.get("festivalYear", 2026)))
    
    story.append(Paragraph(f"<b>{mandal_name}</b>", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"« {mandal_tagline} »", tagline_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"{mandal_address} | संपर्क: {contact_no}", address_style))
    story.append(Spacer(1, 10))
    
    # 2. Receipt Banner Box
    banner_data = [[
        Paragraph(f"<b>अधिकृत पावती / OFFICIAL RECEIPT (गणेशोत्सव {festival_year})</b>", receipt_banner_style)
    ]]
    banner_table = Table(banner_data, colWidths=[520])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#800000")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 12))
    
    # 3. Receipt Details & QR Code
    receipt_no = sanitize_text(receipt.get("receiptNumber", "AMGM-2026-000001"))
    date_str = sanitize_text(str(receipt.get("createdAt") or receipt.get("date") or "")[:10])
    if not date_str:
        import datetime
        date_str = datetime.date.today().strftime("%Y-%m-%d")
    amount = float(receipt.get("amount", 0))
    donor_name = sanitize_text(receipt.get("donorName", "-"))
    donor_mobile = sanitize_text(receipt.get("donorMobile", "-"))
    donor_address = sanitize_text(receipt.get("donorAddress", "-"))
    payment_mode = sanitize_text(str(receipt.get("paymentMode", "CASH")).upper())
    transaction_ref = sanitize_text(receipt.get("transactionRef") or "N/A")
    collected_by = sanitize_text(receipt.get("collectedByName") or receipt.get("collectedBy", "Digital Vargani Portal"))
    status = "वैध (ACTIVE)" if receipt.get("status", "ACTIVE") == "ACTIVE" else "रद्द (CANCELLED)"
    
    # Generate QR Code image in memory
    qr_url = verify_url or f"https://shreeamarganesh.org/verify/{receipt_no}"
    qr = qrcode.QRCode(version=1, box_size=4, border=1)
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#800000", back_color="white")
    qr_buf = io.BytesIO()
    qr_img.save(qr_buf, format="PNG")
    qr_buf.seek(0)
    qr_flowable = Image(qr_buf, width=1.3*inch, height=1.3*inch)
    
    # QR Container Sub-Table
    qr_box_data = [
        [qr_flowable],
        [Paragraph("Scan QR to Verify<br/>पावती पडताळा", qr_caption_style)]
    ]
    qr_box_table = Table(qr_box_data, colWidths=[130])
    qr_box_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    # Details Left Sub-Table
    left_details_data = [
        [Paragraph("Receipt No. (पावती क्र.):", cell_label_style), Paragraph(f"<b>{receipt_no}</b>", cell_val_style)],
        [Paragraph("Date (दिनांक):", cell_label_style), Paragraph(f"{date_str}", cell_val_style)],
        [Paragraph("Donor Name (देणगीदार):", cell_label_style), Paragraph(f"<b>{donor_name}</b>", cell_val_style)],
        [Paragraph("Mobile (मोबाईल):", cell_label_style), Paragraph(f"{donor_mobile}", cell_val_style)],
        [Paragraph("Address (पत्ता):", cell_label_style), Paragraph(f"{donor_address}", cell_val_style)],
        [Paragraph("Payment Mode (भरणा):", cell_label_style), Paragraph(f"{payment_mode} (Ref: {transaction_ref})", cell_val_style)],
        [Paragraph("Received By (स्वीकारकर्ता):", cell_label_style), Paragraph(f"{collected_by}", cell_val_style)],
        [Paragraph("Status (स्थिती):", cell_label_style), Paragraph(f"<b>{status}</b>", cell_val_style)],
    ]
    left_table = Table(left_details_data, colWidths=[145, 225])
    left_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor("#F3F4F6")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    # Combine Left Details and Right QR Container
    main_grid_data = [[left_table, qr_box_table]]
    main_grid = Table(main_grid_data, colWidths=[380, 140])
    main_grid.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(main_grid)
    story.append(Spacer(1, 14))
    
    # 4. Big Amount Highlight Box
    amt_text = f"<font color='#4B5563' size=9>स्वीकारलेली रक्कम / RECEIVED AMOUNT</font><br/><font color='#800000' size=22><b>₹ {amount:,.2f} /-</b></font>"
    amount_data = [
        [Paragraph(amt_text, ParagraphStyle("Amt", fontName=FONT_BOLD, alignment=TA_CENTER, leading=26))]
    ]
    amt_table = Table(amount_data, colWidths=[520])
    amt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")), # Gold tint
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor("#D4AF37")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(amt_table)
    story.append(Spacer(1, 20))
    
    # 5. Signatures and Note
    sig_data = [
        [
            Paragraph("<font size=8.5 color='#4B5563'>श्री अमर गणेश मित्र मंडळाच्या कार्यात सहकार्य केल्याबद्दल मनःपूर्वक धन्यवाद!<br/><i>(This is an authentic computer generated digital receipt.)</i></font>", ParagraphStyle("Thank", fontName=FONT_REGULAR, alignment=TA_LEFT, leading=13)),
            Paragraph("____________________________<br/><b>Authorized Signatory</b><br/><font size=8 color='#6B7280'>(अधिकृत स्वाक्षरी / खजिनदार)</font>", ParagraphStyle("Sig", fontName=FONT_BOLD, alignment=TA_CENTER, leading=14))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[280, 240])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(sig_table)
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_financial_report_pdf(summary: dict, mandal: dict, festival_year: int) -> bytes:
    """Generates an official A4 annual financial balance sheet PDF with Mukta bilingual typography."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        "MandalReportHeader",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#800000")
    )
    
    sub_style = ParagraphStyle(
        "MandalReportSub",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F2937")
    )
    
    table_hdr_style = ParagraphStyle(
        "TblHdr",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=10,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        "TblCell",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=9.5,
        textColor=colors.HexColor("#111827")
    )
    
    # Header
    mandal_name = sanitize_text(mandal.get("name", "श्री अमर गणेश मित्र मंडळ"))
    story.append(Paragraph(f"<b>{mandal_name}</b>", header_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"वार्षिक आर्थिक ताळेबंद व अहवाल / ANNUAL FINANCIAL AUDIT STATEMENT ({festival_year})", sub_style))
    story.append(Spacer(1, 15))
    
    # Summary KPI Box
    total_income = float(summary.get("totalIncome", 0))
    total_expenses = float(summary.get("totalExpenses", 0))
    balance = float(summary.get("currentBalance", total_income - total_expenses))
    
    kpi_data = [
        [
            Paragraph(f"एकूण जमा (Total Income)<br/><b>₹ {total_income:,.2f}</b>", ParagraphStyle("KPI1", alignment=TA_CENTER, fontName=FONT_BOLD, fontSize=11, leading=15, textColor=colors.HexColor("#15803D"))),
            Paragraph(f"एकूण खर्च (Total Expenses)<br/><b>₹ {total_expenses:,.2f}</b>", ParagraphStyle("KPI2", alignment=TA_CENTER, fontName=FONT_BOLD, fontSize=11, leading=15, textColor=colors.HexColor("#B91C1C"))),
            Paragraph(f"शिल्लक रक्कम (Net Balance)<br/><b>₹ {balance:,.2f}</b>", ParagraphStyle("KPI3", alignment=TA_CENTER, fontName=FONT_BOLD, fontSize=11, leading=15, textColor=colors.HexColor("#1D4ED8")))
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[173, 173, 174])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 18))
    
    # Expense Breakdown Table
    story.append(Paragraph("<b>खर्च प्रवर्गनिहाय तपशील / Expense Categories Breakdown</b>", ParagraphStyle("Sec", fontName=FONT_BOLD, fontSize=11, textColor=colors.HexColor("#800000"))))
    story.append(Spacer(1, 6))
    
    exp_rows = [
        [Paragraph("प्रवर्ग (Category)", table_hdr_style), Paragraph("नोंदी (Count)", table_hdr_style), Paragraph("रक्कम (Amount)", table_hdr_style)]
    ]
    for item in summary.get("expenseByCategory", []):
        exp_rows.append([
            Paragraph(sanitize_text(str(item.get("category"))), table_cell_style),
            Paragraph(f"{item.get('count')} नोंदी", table_cell_style),
            Paragraph(f"₹ {float(item.get('amount', 0)):,.2f}", table_cell_style)
        ])
        
    if len(exp_rows) == 1:
        exp_rows.append([Paragraph("कोणताही खर्च नाही", table_cell_style), Paragraph("0", table_cell_style), Paragraph("₹0.00", table_cell_style)])
        
    exp_table = Table(exp_rows, colWidths=[240, 120, 160])
    exp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#800000")),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(exp_table)
    story.append(Spacer(1, 25))
    
    # Audit Sign-off
    sig_data = [
        [
            Paragraph("<b>अध्यक्ष / President</b><br/>श्री अमर गणेश मित्र मंडळ", ParagraphStyle("S1", fontName=FONT_BOLD, alignment=TA_CENTER)),
            Paragraph("<b>खजिनदार / Treasurer</b><br/>हिशोब व वित्त विभाग", ParagraphStyle("S2", fontName=FONT_BOLD, alignment=TA_CENTER)),
            Paragraph("<b>कार्यवाह / Secretary</b><br/>प्रशासन विभाग", ParagraphStyle("S3", fontName=FONT_BOLD, alignment=TA_CENTER))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[173, 173, 174])
    story.append(sig_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_ledger_pdf(transactions: list, mandal: dict, festival_year: int) -> bytes:
    """
    Generates an official A4 General Ledger (नोंदवही व खतावणी) PDF with running balances.
    Renders 100% crisp Mukta Marathi typography without any screen blinking or glitches.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "LedgerTitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#800000")
    )
    
    sub_style = ParagraphStyle(
        "LedgerSub",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F2937")
    )
    
    tbl_hdr = ParagraphStyle("LHdr", fontName=FONT_BOLD, fontSize=9, textColor=colors.white, alignment=TA_CENTER)
    tbl_cell = ParagraphStyle("LCell", fontName=FONT_REGULAR, fontSize=8.5, leading=11, textColor=colors.HexColor("#111827"))
    tbl_cell_cr = ParagraphStyle("LCr", fontName=FONT_BOLD, fontSize=8.5, leading=11, textColor=colors.HexColor("#15803D"), alignment=TA_RIGHT)
    tbl_cell_dr = ParagraphStyle("LDr", fontName=FONT_BOLD, fontSize=8.5, leading=11, textColor=colors.HexColor("#B91C1C"), alignment=TA_RIGHT)
    tbl_cell_bal = ParagraphStyle("LBal", fontName=FONT_BOLD, fontSize=8.5, leading=11, textColor=colors.HexColor("#1D4ED8"), alignment=TA_RIGHT)

    mandal_name = sanitize_text(mandal.get("name", "श्री अमर गणेश मित्र मंडळ"))
    story.append(Paragraph(f"<b>{mandal_name}</b>", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"अधिकृत नोंदवही व खतावणी / GENERAL ACCOUNTING LEDGER ({festival_year})", sub_style))
    story.append(Spacer(1, 12))
    
    # Calculate running balances chronologically
    sorted_oldest = list(reversed(transactions))
    running_bal = 0.0
    total_cr = 0.0
    total_dr = 0.0
    
    rows = [
        [
            Paragraph("दिनांक<br/>Date", tbl_hdr),
            Paragraph("तपशील / खतावणी<br/>Particulars / Description", tbl_hdr),
            Paragraph("पावती / बिल क्र.<br/>Ref No.", tbl_hdr),
            Paragraph("जमा (Credit)<br/>(₹)", tbl_hdr),
            Paragraph("खर्च (Debit)<br/>(₹)", tbl_hdr),
            Paragraph("शिल्लक (Balance)<br/>(₹)", tbl_hdr)
        ]
    ]
    
    for t in sorted_oldest:
        is_inc = t.get("isIncome", False) or t.get("type") == "income"
        is_exp = t.get("type") == "expense"
        amt = float(t.get("amount", 0))
        
        cr = amt if is_inc else 0.0
        dr = amt if is_exp else 0.0
        running_bal += (cr - dr)
        total_cr += cr
        total_dr += dr
        
        person = sanitize_text(t.get("personName") or t.get("donorName") or t.get("vendor") or "-")
        cat = sanitize_text(t.get("category", ""))
        ref = sanitize_text(t.get("receiptNumber") or t.get("billNumber") or "-")
        dt_str = sanitize_text(str(t.get("dateDay") or t.get("date") or "")[:10])
        
        particulars = f"<b>{person}</b><br/><font color='#6B7280' size=7.5>{cat}</font>"
        
        rows.append([
            Paragraph(dt_str, tbl_cell),
            Paragraph(particulars, tbl_cell),
            Paragraph(ref, tbl_cell),
            Paragraph(f"+{cr:,.2f}" if cr > 0 else "-", tbl_cell_cr),
            Paragraph(f"-{dr:,.2f}" if dr > 0 else "-", tbl_cell_dr),
            Paragraph(f"{running_bal:,.2f}", tbl_cell_bal)
        ])
        
    # Totals Row
    rows.append([
        Paragraph("<b>एकूण (TOTAL)</b>", tbl_cell),
        Paragraph("", tbl_cell),
        Paragraph("", tbl_cell),
        Paragraph(f"<b>₹ {total_cr:,.2f}</b>", tbl_cell_cr),
        Paragraph(f"<b>₹ {total_dr:,.2f}</b>", tbl_cell_dr),
        Paragraph(f"<b>₹ {running_bal:,.2f}</b>", tbl_cell_bal)
    ])
    
    ledger_table = Table(rows, colWidths=[65, 175, 75, 75, 75, 70])
    ledger_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#800000")),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#FEF3C7")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(ledger_table)
    story.append(Spacer(1, 20))
    
    # Signatures
    sig_data = [
        [
            Paragraph("____________________________<br/><b>अध्यक्ष / President</b>", ParagraphStyle("LS1", fontName=FONT_BOLD, alignment=TA_CENTER, fontSize=9)),
            Paragraph("____________________________<br/><b>खजिनदार / Treasurer</b>", ParagraphStyle("LS2", fontName=FONT_BOLD, alignment=TA_CENTER, fontSize=9))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[265, 270])
    story.append(sig_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
