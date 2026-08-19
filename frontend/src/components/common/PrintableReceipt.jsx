import React from 'react';
import { useConfig } from '../../context/ConfigContext';

const PrintableReceipt = ({ receipt }) => {
  const { config } = useConfig();
  if (!receipt) return null;

  const isCancelled = receipt.status === 'CANCELLED';
  const receiptNo = receipt.receiptNumber || 'AMGM-2026-XXXXXX';
  const amount = Number(receipt.amount || 0);
  const dateStr = receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString('mr-IN');

  const verifyUrl = `${window.location.origin}/verify/${receiptNo}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=800000&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const pdfUrl = `/api/receipts/${receipt._id || receipt.id || receiptNo}/pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `Receipt_${receiptNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = () => {
    const text = `🚩 *${config.mandalName}* 🚩\n\n*अधिकृत डिजिटल पावती*\n━━━━━━━━━━━━━━━━━━━━\n📄 पावती क्र.: *${receiptNo}*\n👤 देणगीदार: *${receipt.donorName}*\n💰 रक्कम: *₹ ${amount.toLocaleString('en-IN')}*\n📅 दिनांक: ${dateStr}\n💳 पद्धत: ${(receipt.paymentMode || 'Cash').toUpperCase()}\n━━━━━━━━━━━━━━━━━━━━\n🔗 पावती पडताळा: ${verifyUrl}\n\n*गणपती बाप्पा मोरया!*`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Action Buttons Toolbar */}
      <div className="receipt-action-bar" style={{ marginBottom: '1.5rem' }}>
        <button onClick={handlePrint} className="btn btn-primary btn-sm">
          🖨️ पावती प्रिंट करा
        </button>
        <button onClick={handleDownloadPDF} className="btn btn-gold btn-sm">
          📥 PDF डाउनलोड करा
        </button>
        <button onClick={handleWhatsAppShare} className="btn btn-whatsapp btn-sm">
          💬 WhatsApp वर पाठवा
        </button>
      </div>

      {/* Official Receipt Card */}
      <div className="receipt-wrapper">
        {isCancelled && (
          <div className="receipt-watermark-cancelled">रद्द / CANCELLED</div>
        )}

        <div className="receipt-header-branding">
          <img src="/assets/Mandal Logo.png" alt="Mandal Logo" className="receipt-logo" />
          <h2 className="receipt-mandal-title">{config.mandalName}</h2>
          <p className="receipt-mandal-sub">« {config.mandalTagline} »</p>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
            {config.address} | संपर्क: {config.contactNumber}
          </p>
        </div>

        <div className="receipt-badge-banner">
          अधिकृत पावती / OFFICIAL RECEIPT (गणेशोत्सव {receipt.festivalYear || config.festivalYear})
        </div>

        <div className="receipt-grid-details">
          <div className="receipt-fields-list">
            <div className="receipt-field-row">
              <span className="receipt-field-label">पावती क्र.:</span>
              <span className="receipt-field-value" style={{ color: 'var(--color-primary)' }}>{receiptNo}</span>
            </div>
            <div className="receipt-field-row">
              <span className="receipt-field-label">दिनांक:</span>
              <span className="receipt-field-value">{dateStr}</span>
            </div>
            <div className="receipt-field-row">
              <span className="receipt-field-label">देणगीदाराचे नाव:</span>
              <span className="receipt-field-value">{receipt.donorName}</span>
            </div>
            {receipt.donorMobile && (
              <div className="receipt-field-row">
                <span className="receipt-field-label">मोबाईल:</span>
                <span className="receipt-field-value">{receipt.donorMobile}</span>
              </div>
            )}
            {receipt.donorAddress && (
              <div className="receipt-field-row">
                <span className="receipt-field-label">पत्ता:</span>
                <span className="receipt-field-value">{receipt.donorAddress}</span>
              </div>
            )}
            <div className="receipt-field-row">
              <span className="receipt-field-label">भरणा प्रकार:</span>
              <span className="receipt-field-value" style={{ textTransform: 'uppercase' }}>
                {receipt.paymentMode || 'Cash'} {receipt.transactionRef ? `(Ref: ${receipt.transactionRef})` : ''}
              </span>
            </div>
            <div className="receipt-field-row">
              <span className="receipt-field-label">स्वीकारकर्ता:</span>
              <span className="receipt-field-value">{receipt.collectedByName || 'समिती व्यवस्थापन'}</span>
            </div>
            {receipt.notes && (
              <div className="receipt-field-row">
                <span className="receipt-field-label">नोंद:</span>
                <span className="receipt-field-value">{receipt.notes}</span>
              </div>
            )}
          </div>

          {/* Verification QR Code */}
          <div className="receipt-qr-box">
            <img src={qrImgUrl} alt="Verify QR Code" style={{ width: '100px', height: '100px' }} />
            <span className="receipt-qr-caption">QR स्कॅन करून<br/>पावती पडताळा</span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="receipt-amount-highlight">
          <div className="receipt-amount-label">स्वीकारलेली रक्कम (RECEIVED AMOUNT)</div>
          <div className="receipt-amount-val">₹ {amount.toLocaleString('en-IN')}/-</div>
        </div>

        {/* Signatures & Footer Note */}
        <div className="receipt-footer-signatures">
          <div>
            <p style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--color-primary)' }}>
              श्री अमर गणेश चरणी आपले सहकार्य रुजू!
            </p>
            <p style={{ fontSize: '0.75rem' }}>हे अधिकृत डिजिटल पावती पत्र आहे.</p>
          </div>
          <div className="receipt-sign-box">
            <div className="receipt-sign-line"></div>
            <b>अधिकृत स्वाक्षरी / खजिनदार</b>
            <div style={{ fontSize: '0.7rem' }}>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableReceipt;
