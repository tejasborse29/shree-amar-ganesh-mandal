import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';

const SettingsPage = () => {
  const { showSuccess, showError } = useToast();
  const { refetchConfig, updateMandalConfig } = useConfig();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    mandalName: 'श्री अमर गणेश मित्र मंडळ',
    mandalTagline: 'भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!',
    festivalYear: 2026,
    financialYear: '2026-27',
    activeFestival: 'गणेशोत्सव',
    receiptPrefix: 'AMGM',
    sthapanaDate: '2026-08-28T09:00:00',
    visarjanDate: '2026-09-08T18:00:00',
    contactNumber: '+91 98765 43210',
    email: 'contact@shreeamarganesh.org',
    address: 'अमर गणेश चौक, शनिवार पेठ, पुणे, महाराष्ट्र - ४११ ०३०',
    mapLocation: 'https://maps.app.goo.gl/C6AwUKT4sz5xxSyP7',
    upiId: 'amarganesh@upi',
    accountName: 'Shree Amar Ganesh Mitra Mandal',
    accountNumber: '9876002100045890',
    ifsc: 'MAHB0000123',
    bankName: 'Bank of Maharashtra, Pune Main Branch',
    transparencyEnabled: true,
    socialLinks: {
      instagram: 'https://www.instagram.com/bappa_majha_offical_17?igsh=bnMyazE3aG91aTJv',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com'
    }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.settings,
          socialLinks: {
            ...prev.socialLinks,
            ...(res.settings.socialLinks || {})
          }
        }));
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

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateMandalConfig(settings);
      if (res.success) {
        showSuccess(res.message || 'मंडळाची सर्व माहिती यशस्वीपणे अद्यतनित झाली!');
        refetchConfig();
      } else {
        showError(res.message || 'त्रुटी आली.');
      }
    } catch (err) {
      showError(err.message || 'सेटिंग्ज जतन करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Skeleton height="400px" borderRadius="16px" />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
          ⚙️ मंडळ प्रणाली व माहिती व्यवस्थापन (Mandal Settings)
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          मंडळाचे नाव, उत्सव वर्ष, मंडप पत्ता, संपर्क, बँक तपशील व सोशल मीडिया लिंक्स थेट संपादित करा
        </p>
      </div>

      <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          {/* 1. Mandal Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚩</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              १. मंडळाची माहिती व नाव (Mandal Identity)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">मंडळाचे नाव (Mandal Name) *</label>
              <input
                type="text"
                name="mandalName"
                value={settings.mandalName}
                onChange={handleChange}
                className="form-input"
                placeholder="उदा. श्री अमर गणेश मित्र मंडळ"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">घोषवाक्य / ब्रीदवाक्य (Tagline)</label>
              <input
                type="text"
                name="mandalTagline"
                value={settings.mandalTagline}
                onChange={handleChange}
                className="form-input"
                placeholder="उदा. भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!"
              />
            </div>
          </div>

          {/* 2. Festival & Year Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📚</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              २. उत्सव व वर्ष व्यवस्थापन (Festival & Year)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">सध्याचा उत्सव (Active Festival)</label>
              <input
                type="text"
                name="activeFestival"
                value={settings.activeFestival}
                onChange={handleChange}
                className="form-input"
                placeholder="उदा. गणेशोत्सव"
              />
            </div>
            <div className="form-group">
              <label className="form-label">उत्सव वर्ष (Festival Year) *</label>
              <input
                type="number"
                name="festivalYear"
                value={settings.festivalYear}
                onChange={handleChange}
                className="form-input"
                placeholder="2026"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">आर्थिक वर्ष (Financial Year)</label>
              <input
                type="text"
                name="financialYear"
                value={settings.financialYear}
                onChange={handleChange}
                className="form-input"
                placeholder="2026-27"
              />
            </div>
            <div className="form-group">
              <label className="form-label">पावती उपसर्ग (Receipt Prefix) *</label>
              <input
                type="text"
                name="receiptPrefix"
                value={settings.receiptPrefix}
                onChange={handleChange}
                className="form-input"
                placeholder="AMGM"
                required
              />
            </div>
          </div>

          {/* 3. Address & Contact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📍</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              ३. मंडप पत्ता व संपर्क माहिती (Address & Contact)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">मंडप पत्ता (Mandap Address)</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="form-input"
                placeholder="उदा. अमर गणेश चौक, शनिवार पेठ, पुणे - ४११ ०३०"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">संपर्क फोन नंबर (Contact Number)</label>
              <input
                type="text"
                name="contactNumber"
                value={settings.contactNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 93229 57150"
              />
            </div>
            <div className="form-group">
              <label className="form-label">अधिकृत ईमेल पत्ता (Email)</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="form-input"
                placeholder="contact@shreeamarganesh.org"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Google Maps लोकेशन लिंक</label>
              <input
                type="url"
                name="mapLocation"
                value={settings.mapLocation}
                onChange={handleChange}
                className="form-input"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
          </div>

          {/* 4. Social Media Quick Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌐</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              ४. सोशल मीडिया लिंक्स (Instagram, Facebook, YouTube)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">📸 Instagram प्रोफाईल लिंक</label>
              <input
                type="url"
                name="instagram"
                value={settings.socialLinks?.instagram || ''}
                onChange={handleSocialChange}
                className="form-input"
                placeholder="https://www.instagram.com/bappa_majha_offical_17"
              />
            </div>
            <div className="form-group">
              <label className="form-label">📘 Facebook पेज लिंक</label>
              <input
                type="url"
                name="facebook"
                value={settings.socialLinks?.facebook || ''}
                onChange={handleSocialChange}
                className="form-input"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">▶️ YouTube चॅनेल लिंक</label>
              <input
                type="url"
                name="youtube"
                value={settings.socialLinks?.youtube || ''}
                onChange={handleSocialChange}
                className="form-input"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* 5. Bank & UPI Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🏦</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              ५. बँक व UPI वर्गणी तपशील (Bank & UPI Details)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">UPI ID (QR देणगीसाठी)</label>
              <input
                type="text"
                name="upiId"
                value={settings.upiId}
                onChange={handleChange}
                className="form-input"
                placeholder="amarganesh@upi"
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
                placeholder="Shree Amar Ganesh Mitra Mandal"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">बँकेचे नाव (Bank Name)</label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                className="form-input"
                placeholder="Bank of Maharashtra"
              />
            </div>
            <div className="form-group">
              <label className="form-label">खाते क्रमांक (Account No.)</label>
              <input
                type="text"
                name="accountNumber"
                value={settings.accountNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="9876002100045890"
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
                placeholder="MAHB0000123"
              />
            </div>
          </div>

          {/* 6. Dates & Countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              ६. स्थापना व विसर्जन तारीख-वेळ (Countdown Dates)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">श्री गणेश स्थापना तारीख व वेळ (Countdown Target)</label>
              <input
                type="datetime-local"
                name="sthapanaDate"
                value={settings.sthapanaDate?.substring(0, 16) || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">अनंत चतुर्दशी विसर्जन तारीख व वेळ</label>
              <input
                type="datetime-local"
                name="visarjanDate"
                value={settings.visarjanDate?.substring(0, 16) || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Transparency Switch */}
          <div style={{ background: '#FFFBEB', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #FDE047', margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="transparencyEnabled"
              name="transparencyEnabled"
              checked={settings.transparencyEnabled}
              onChange={handleChange}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#EA580C' }}
            />
            <label htmlFor="transparencyEnabled" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}>
              सार्वजनिक पारदर्शक हिशोब पृष्ठ चालू ठेवा (Enable Public Financial Transparency Page)
            </label>
          </div>

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 800 }}>
              {submitting ? 'जतन होत आहे...' : '💾 सर्व बदल जतन करा (Save Settings)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
