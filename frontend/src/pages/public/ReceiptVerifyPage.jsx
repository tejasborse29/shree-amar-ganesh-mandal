import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';
import { downloadReceiptPDF } from '../../utils/downloadHelper';

const ReceiptVerifyPage = () => {
  const { receiptNumber } = useParams();
  const { config } = useConfig();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/verify-receipt/${encodeURIComponent(receiptNumber)}`);
        if (res.success && res.receipt) {
          setReceipt(res.receipt);
        } else {
          setError(res.message || 'पावती आढळली नाही');
        }
      } catch (err) {
        setError(err.message || 'पावती पडताळण्यात त्रुटी आली.');
      } finally {
        setLoading(false);
      }
    };
    if (receiptNumber) verify();
  }, [receiptNumber]);

  return (
    <div style={{ background: '#FAF8F5', minHeight: '80vh', padding: '3.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        
        {loading ? (
          <Skeleton height="350px" borderRadius="16px" />
        ) : error ? (
          <div className="amgm-card" style={{ padding: '2.5rem', textAlign: 'center', borderTop: '5px solid var(--color-error)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: 'var(--color-error)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              पावती पडताळणी अयशस्वी
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              {error} (पावती क्र.: <b>{receiptNumber}</b>)
            </p>
            <Link to="/" className="btn btn-outline">
              मुख्यपृष्ठावर परत जा
            </Link>
          </div>
        ) : receipt ? (
          <div className="amgm-card amgm-card-gold" style={{ padding: '2.5rem', textAlign: 'center' }}>
            
            {/* Verified Stamp Header */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#DCFCE7',
              color: '#16A34A',
              border: '1.5px solid #16A34A',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              fontSize: '1.05rem',
              fontWeight: 800,
              marginBottom: '1.5rem'
            }}>
              ✅ अधिकृत पावती प्रमाणित (VERIFIED)
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <img src="/assets/Mandal Logo.png" alt="Logo" style={{ width: '56px', height: '56px', margin: '0 auto 0.5rem', objectFit: 'contain' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 800 }}>
                {receipt.mandalName || config.mandalName}
              </h2>
              <span className="badge badge-primary">गणेशोत्सव २०२६</span>
            </div>

            {/* Receipt Verification Details */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>पावती क्रमांक:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{receipt.receiptNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>दिनांक:</span>
                <span style={{ fontWeight: 700 }}>{receipt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>देणगीदाराचे नाव:</span>
                <span style={{ fontWeight: 700 }}>{receipt.donorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>मोबाईल (गोपनीय):</span>
                <span style={{ fontWeight: 600 }}>{receipt.maskedMobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>भरणा पद्धत:</span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{receipt.paymentMode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>पावती घेणारे:</span>
                <span style={{ fontWeight: 600 }}>{receipt.collectedBy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>स्थिती:</span>
                <span className={`badge ${receipt.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                  {receipt.status === 'ACTIVE' ? 'वैध (ACTIVE)' : 'रद्द (CANCELLED)'}
                </span>
              </div>
            </div>

            {/* Amount Box */}
            <div style={{ background: '#FEF3C7', border: '1.5px solid var(--color-gold)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>स्वीकारलेली रक्कम</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                ₹ {Number(receipt.amount || 0).toLocaleString('en-IN')}/-
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => downloadReceiptPDF(receipt.receiptNumber, `Receipt_${receipt.receiptNumber}.pdf`)}
                className="btn btn-gold btn-sm"
              >
                📥 अधिकृत PDF डाउनलोड करा
              </button>
              <Link to="/" className="btn btn-outline btn-sm">
                मुख्यपृष्ठ
              </Link>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default ReceiptVerifyPage;
