import React from 'react';
import Modal from './Modal';
import { useConfig } from '../../context/ConfigContext';

const QRModal = ({ isOpen, onClose }) => {
  const { config } = useConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="अधिकृत बँक UPI QR कोड">
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          कोणत्याही UPI अ‍ॅपवरून (GPay, PhonePe, Paytm, BHIM) स्कॅन करून वर्गणी / देणगी द्या.
        </p>

        {/* Bank QR Code Container */}
        <div style={{
          display: 'inline-block',
          padding: '12px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #D4AF37',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1.25rem'
        }}>
          <img
            src="/assets/Bank QR Code.jpeg"
            alt="Mandal Bank QR Code"
            style={{ width: '260px', height: '260px', objectFit: 'contain', margin: '0 auto' }}
          />
        </div>

        {/* UPI Details Box */}
        <div style={{ background: '#FFFDF5', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '8px', padding: '0.85rem', textAlign: 'left', fontSize: '0.9rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
            UPI ID: <span style={{ color: 'var(--color-saffron)' }}>{config.upiId}</span>
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            खाते नाव: <b>{config.bankDetails?.accountName}</b>
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            बँक: {config.bankDetails?.bankName} (IFSC: {config.bankDetails?.ifsc})
          </p>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          💡 पैसे भरल्यानंतर कृपया खालील फॉर्ममध्ये व्यवहार क्रमांक (Transaction ID) नोंदवून त्वरित अधिकृत पावती प्राप्त करा.
        </p>
      </div>
    </Modal>
  );
};

export default QRModal;
