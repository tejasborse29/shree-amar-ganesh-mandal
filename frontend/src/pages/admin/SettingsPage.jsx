import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';

const SettingsPage = () => {
  const { showSuccess, showError } = useToast();
  const { refetchConfig } = useConfig();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    mandalName: 'श्री अमर गणेश मित्र मंडळ',
    mandalTagline: 'भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!',
    festivalYear: 2026,
    receiptPrefix: 'AMGM',
    sthapanaDate: '2026-08-28T09:00:00',
    visarjanDate: '2026-09-08T18:00:00',
    contactNumber: '+91 98765 43210',
    email: 'contact@shreeamarganesh.org',
    address: 'अमर गणेश चौक, शनिवार पेठ, पुणे, महाराष्ट्र - ४११ ०३०',
    mapLocation: 'https://maps.google.com',
    upiId: 'amarganesh@upi',
    accountName: 'Shree Amar Ganesh Mitra Mandal',
    accountNumber: '9876002100045890',
    ifsc: 'MAHB0000123',
    bankName: 'Bank of Maharashtra, Pune Main Branch',
    transparencyEnabled: true
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (e) {
      showError('सेटिंग्ज लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        showSuccess(res.message || 'सेटिंग्ज यशस्वीपणे अद्यतनित झाल्या.');
        refetchConfig();
      }
    } catch (err) {
      showError(err.message || 'सेटिंग्ज जतन करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Skeleton height="400px" borderRadius="16px" />;

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
          ⚙️ मंडळ प्रणाली सेटिंग्ज (System Settings)
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          उत्सव वर्ष, तारीख, बँक तपशील व संपर्क माहिती व्यवस्थापन
        </p>
      </div>

      <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Mandal Identity */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            १. मंडळाची ओळख व घोषवाक्य
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">मंडळाचे नाव (Mandal Name)</label>
              <input
                type="text"
                name="mandalName"
                value={settings.mandalName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">घोषवाक्य (Tagline)</label>
              <input
                type="text"
                name="mandalTagline"
                value={settings.mandalTagline}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Festival Year & Dates */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '1.75rem 0 1.25rem' }}>
            २. उत्सव वर्ष व स्थापना / विसर्जन तारीख
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">उत्सव वर्ष (Festival Year)</label>
              <input
                type="number"
                name="festivalYear"
                value={settings.festivalYear}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">पावती उपसर्ग (Receipt Prefix)</label>
              <input
                type="text"
                name="receiptPrefix"
                value={settings.receiptPrefix}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">गणेश स्थापना तारीख व वेळ (Countdown Target)</label>
              <input
                type="datetime-local"
                name="sthapanaDate"
                value={settings.sthapanaDate?.substring(0, 16) || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Banking & UPI */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '1.75rem 0 1.25rem' }}>
            ३. बँक व UPI वर्गणी तपशील
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={settings.upiId}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">खाते नाव (Account Name)</label>
              <input
                type="text"
                name="accountName"
                value={settings.accountName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">बँक नाव</label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">खाते क्रमांक</label>
              <input
                type="text"
                name="accountNumber"
                value={settings.accountNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC कोड</label>
              <input
                type="text"
                name="ifsc"
                value={settings.ifsc}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Contact Details */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '1.75rem 0 1.25rem' }}>
            ४. संपर्क व पत्ता
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">संपर्क फोन नंबर</label>
              <input
                type="text"
                name="contactNumber"
                value={settings.contactNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ईमेल पत्ता</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">मंडप पत्ता</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Transparency Switch */}
          <div style={{ background: '#FFFBEB', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--color-gold)', margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="transparencyEnabled"
              name="transparencyEnabled"
              checked={settings.transparencyEnabled}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="transparencyEnabled" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}>
              सार्वजनिक पारदर्शक हिशोब पृष्ठ चालू ठेवा (Enable Public Financial Transparency Page)
            </label>
          </div>

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
              {submitting ? 'जतन होत आहे...' : '💾 सर्व बदल जतन करा'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
