import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import QRModal from '../../components/common/QRModal';
import PrintableReceipt from '../../components/common/PrintableReceipt';

const QUICK_AMOUNTS = [101, 251, 501, 1001, 2100, 5001];

const VarganiPage = () => {
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    amount: '',
    address: '',
    email: '',
    paymentMode: 'online',
    transactionRef: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAmount = (val) => {
    setFormData((prev) => ({ ...prev, amount: String(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('कृपया आपले पूर्ण नाव प्रविष्ट करा.');
      return;
    }
    if (!formData.mobile || formData.mobile.length < 10) {
      showError('कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      showError('कृपया वैध रक्कम प्रविष्ट करा.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/vargani', formData);
      if (res.success && res.receipt) {
        setGeneratedReceipt(res.receipt);
        showSuccess('आपली वर्गणी यशस्वीपणे नोंदवली गेली आहे! अधिकृत पावती तयार झाली.');
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      showError(err.message || 'वर्गणी नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setGeneratedReceipt(null);
    setFormData({
      name: '',
      mobile: '',
      amount: '',
      address: '',
      email: '',
      paymentMode: 'online',
      transactionRef: ''
    });
  };

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            डिजिटल वर्गणी व देणगी पोर्टल
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            ऑनलाइन वर्गणी / देणगी द्या
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            आपले योगदान थेट मंडळाकडे सुरक्षित जमा करा आणि तत्काळ अधिकृत डिजिटल पावती मिळवा.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', maxWidth: '800px' }}>
        {generatedReceipt ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-success" style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>
                🎉 वर्गणी यशस्वी! (Payment Successful)
              </span>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                आपली अधिकृत पावती खाली तयार झाली आहे. आपण ती प्रिंट किंवा PDF स्वरूपात डाऊनलोड करू शकता.
              </p>
            </div>

            <PrintableReceipt receipt={generatedReceipt} />

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button onClick={handleReset} className="btn btn-outline btn-lg">
                🔄 दुसरी वर्गणी नोंदवा
              </button>
            </div>
          </div>
        ) : (
          <div className="amgm-card amgm-card-gold" style={{ padding: '2.5rem' }}>
            {/* Quick Bank QR Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FFFBEB',
              border: '1.5px solid var(--color-gold)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 800 }}>
                  📱 UPI द्वारे पैसे भरा (Scan & Pay)
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  GPay / PhonePe / Paytm वरून QR स्कॅन करून पैसे भरा.
                </p>
              </div>
              <button onClick={() => setShowQR(true)} className="btn btn-gold btn-sm">
                🔍 QR कोड पहा
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">पूर्ण नाव (Full Name) *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="उदा. श्री. राहुल सचिन जोशी"
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="form-group">
                  <label className="form-label">मोबाईल नंबर (Mobile Number) *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="१० अंकी मोबाईल नंबर"
                    required
                  />
                </div>
              </div>

              {/* Amount Selection */}
              <div className="form-group">
                <label className="form-label">वर्गणी रक्कम (Amount in ₹) *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAmount(amt)}
                      className={`btn btn-sm ${formData.amount === String(amt) ? 'btn-primary' : 'btn-outline-gold'}`}
                    >
                      ₹ {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="रक्कम प्रविष्ट करा (उदा. 1001)"
                  min="1"
                  required
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">पत्ता / कॉलनी (Address / Colony)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="उदा. शनिवार पेठ, पुणे"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {/* Payment Mode */}
                <div className="form-group">
                  <label className="form-label">भरणा पद्धत (Payment Mode)</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="online">UPI / QR कोड ऑनलाइन</option>
                    <option value="netbanking">Net Banking / NEFT</option>
                    <option value="cash">रोख भरणा (Cash to Volunteer)</option>
                    <option value="cheque">धनादेश (Cheque)</option>
                  </select>
                </div>

                {/* Transaction Ref */}
                <div className="form-group">
                  <label className="form-label">व्यवहार क्र. (UPI / UTR Ref No.)</label>
                  <input
                    type="text"
                    name="transactionRef"
                    value={formData.transactionRef}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="UPI Ref ID किंवा रोख पावती नोंद"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-saffron btn-lg"
                  style={{ width: '100%' }}
                >
                  {submitting ? 'नोंदणी होत आहे...' : '🌸 वर्गणी जमा करा व पावती मिळवा'}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                  🔒 १००% सुरक्षित प्रणाली • त्वरित डिजिटल पावती • अधिकृत पडताळणी QR कोड
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
};

export default VarganiPage;
