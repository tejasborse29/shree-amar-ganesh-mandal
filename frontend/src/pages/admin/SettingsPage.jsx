import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';

const SettingsPage = () => {
  const { showSuccess, showError } = useToast();
  const { refetchConfig, updateMandalConfig } = useConfig();
  const qrFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    mandalName: 'श्री अमर गणेश मित्र मंडळ',
    mandalTagline: 'भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!',
    logoUrl: '/assets/Mandal Logo.png',
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
    qrCodeUrl: '/assets/Bank QR Code.jpeg',
    accountName: 'Shree Amar गणेश Mitra Mandal',
    accountNumber: '9876002100045890',
    ifsc: 'MAHB0000123',
    bankName: 'Bank of Maharashtra, Pune Main Branch',
    transparencyEnabled: true,
    socialLinks: {
      instagram: 'https://www.instagram.com/bappa_majha_offical_17?igsh=bnMyazE3aG91aTJv',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com'
    },
    homeButtons: [
      { id: 'btn1', text: '📜 कार्यक्रम पत्रिका पहा', link: '/events', style: 'btn-primary', enabled: true },
      { id: 'btn2', text: '🔐 समिती व्यवस्थापन Login', link: '/committee/login', style: 'btn-saffron', enabled: true },
      { id: 'btn3', text: 'ℹ️ मंडळाचा इतिहास व कार्य', link: '/about', style: 'btn-outline-gold', enabled: true }
    ]
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.settings,
          logoUrl: res.settings.logoUrl || prev.logoUrl,
          qrCodeUrl: res.settings.qrCodeUrl || prev.qrCodeUrl,
          socialLinks: {
            ...prev.socialLinks,
            ...(res.settings.socialLinks || {})
          },
          homeButtons: (res.settings.homeButtons && res.settings.homeButtons.length > 0)
            ? res.settings.homeButtons
            : prev.homeButtons
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

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('कृपया वैध फोटो निवडा (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 500;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/png');
        setSettings((prev) => ({
          ...prev,
          logoUrl: compressedBase64
        }));
        showSuccess('मंडळाचा नवीन लोगो यशस्वीपणे निवडला गेला!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleQRFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('कृपया वैध फोटो निवडा (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setSettings((prev) => ({
          ...prev,
          qrCodeUrl: compressedBase64
        }));
        showSuccess('नवीन QR कोड फोटो यशस्वीपणे निवडला गेला!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleButtonChange = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...(prev.homeButtons || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, homeButtons: updated };
    });
  };

  const handleAddButton = () => {
    setSettings((prev) => ({
      ...prev,
      homeButtons: [
        ...(prev.homeButtons || []),
        { id: `btn_${Date.now()}`, text: '✨ नवीन बटण', link: '/vargani', style: 'btn-primary', enabled: true }
      ]
    }));
  };

  const handleRemoveButton = (index) => {
    setSettings((prev) => {
      const updated = [...(prev.homeButtons || [])];
      updated.splice(index, 1);
      return { ...prev, homeButtons: updated };
    });
  };

  const handleResetDefaultButtons = () => {
    setSettings((prev) => ({
      ...prev,
      homeButtons: [
        { id: 'btn1', text: '📜 कार्यक्रम पत्रिका पहा', link: '/events', style: 'btn-primary', enabled: true },
        { id: 'btn2', text: '🔐 समिती व्यवस्थापन Login', link: '/committee/login', style: 'btn-saffron', enabled: true },
        { id: 'btn3', text: 'ℹ️ मंडळाचा इतिहास व कार्य', link: '/about', style: 'btn-outline-gold', enabled: true }
      ]
    }));
    showSuccess('होम पेज बटन्स डीफॉल्टवर रीसेट केली!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateMandalConfig(settings);
      if (res.success) {
        showSuccess(res.message || 'मंडळाची सर्व माहिती, बटन्स व लोगो यशस्वीपणे अद्यतनित झाले!');
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="amgm-card" style={{ padding: '2rem', background: '#FFFFFF', borderRadius: '18px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ⚙️ मंडळ व सिस्टीम सेटिंग्ज (Mandal Settings)
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              मंडळाची माहिती, लोगो, बँक तपशील, होम पेज बटन्स व उत्सव कॉन्फिगरेशन व्यवस्थापित करा.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Mandal Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚩</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
              १. मंडळाची माहिती व लोगो (Mandal Identity & Logo)
            </h3>
          </div>

          {/* Logo Upload Box */}
          <div style={{ background: '#FFFDF5', border: '1.5px dashed #D4AF37', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                🏷️ मंडळाचा अधिकृत लोगो (Official Mandal Logo)
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, logoUrl: '/assets/Mandal Logo.png' }))}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                🔄 मूळ लोगो वापरा (Reset Default Logo)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem', alignItems: 'center' }}>
              {/* Logo Preview */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={settings.logoUrl || '/assets/Mandal Logo.png'}
                  alt="Mandal Logo Preview"
                  style={{
                    width: '90px',
                    height: '90px',
                    objectFit: 'contain',
                    border: '2px solid #E7E5E4',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    padding: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                />
              </div>

              {/* Upload Controls */}
              <div>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.85rem' }}
                  >
                    📷 मोबाईल / संगणकामधून नवीन लोगो अपलोड करा
                  </button>
                </div>
                <div className="form-group mb-0">
                  <input
                    type="text"
                    name="logoUrl"
                    value={settings.logoUrl || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="किंवा लोगो इमेज URL / पाथ टाका"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
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
              ५. बँक व UPI वर्गणी तपशील आणि QR कोड (Bank & QR Code)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">UPI ID (देणगी / वर्गणीसाठी) *</label>
              <input
                type="text"
                name="upiId"
                value={settings.upiId}
                onChange={handleChange}
                className="form-input"
                placeholder="amarganesh@upi"
                required
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

          {/* QR Code Upload & Management Box */}
          <div style={{ background: '#FFFDF5', border: '1.5px dashed #D4AF37', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                📱 बँक / UPI QR कोड फोटो (Bank QR Code Image)
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, qrCodeUrl: '/assets/Bank QR Code.jpeg' }))}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                🔄 डीफॉल्ट QR कोड वापरा
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem', alignItems: 'center' }}>
              {/* QR Preview */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={settings.qrCodeUrl || '/assets/Bank QR Code.jpeg'}
                  alt="Bank QR Code"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    border: '2px solid #E7E5E4',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    padding: '4px'
                  }}
                />
              </div>

              {/* Upload Controls */}
              <div>
                <input
                  type="file"
                  ref={qrFileInputRef}
                  accept="image/*"
                  onChange={handleQRFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => qrFileInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.85rem' }}
                  >
                    📷 मोबाईल / संगणकामधून QR कोड अपलोड करा
                  </button>
                </div>
                <div className="form-group mb-0">
                  <input
                    type="text"
                    name="qrCodeUrl"
                    value={settings.qrCodeUrl || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="किंवा QR कोड फोटो URL / पाथ टाका"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>
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

          {/* 7. Home Page Action Buttons Management */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #FDE047', paddingBottom: '0.5rem', margin: '2rem 0 1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔘</span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
                ७. मुख्य पृष्ठ (Home Page) कृती बटन्स संपादन
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleAddButton}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.8rem', color: '#16A34A', borderColor: '#16A34A' }}
              >
                ➕ नवीन बटण जोडा
              </button>
              <button
                type="button"
                onClick={handleResetDefaultButtons}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                🔄 डीफॉल्ट बटन्स
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#78716C', marginBottom: '1rem' }}>
            वेबसाइटच्या मुख्य पृष्ठावर (Home Page Hero Section) दिसणाऱ्या बटणांची नावे, लिंक्स व रंग येथे बदला:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
            {settings.homeButtons?.map((btn, index) => (
              <div
                key={btn.id || index}
                style={{
                  background: '#FFFDF9',
                  border: '1.5px solid #E7E5E4',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1.2fr 1fr auto auto',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
              >
                {/* Button Text */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', display: 'block', marginBottom: '0.2rem' }}>
                    बटणाचे नाव (Text)
                  </label>
                  <input
                    type="text"
                    value={btn.text || ''}
                    onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                    className="form-input"
                    placeholder="उदा. कार्यक्रम पत्रिका पहा"
                    style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                {/* Button Target Link */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', display: 'block', marginBottom: '0.2rem' }}>
                    लिंक / पाथ (URL / Link)
                  </label>
                  <input
                    type="text"
                    value={btn.link || ''}
                    onChange={(e) => handleButtonChange(index, 'link', e.target.value)}
                    className="form-input"
                    placeholder="/events किंवा https://..."
                    style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                {/* Button Style */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', display: 'block', marginBottom: '0.2rem' }}>
                    रंग / शैली (Style)
                  </label>
                  <select
                    value={btn.style || 'btn-primary'}
                    onChange={(e) => handleButtonChange(index, 'style', e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.6rem' }}
                  >
                    <option value="btn-primary">🔴 मरून (Primary)</option>
                    <option value="btn-saffron">🟠 केशरी (Saffron)</option>
                    <option value="btn-outline-gold">🟡 सोनेरी (Gold Outline)</option>
                    <option value="btn-outline">⚪ पांढरा (White Outline)</option>
                  </select>
                </div>

                {/* Enabled Toggle */}
                <div style={{ textAlign: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', display: 'block', marginBottom: '0.2rem' }}>
                    सक्रिय
                  </label>
                  <input
                    type="checkbox"
                    checked={btn.enabled !== false}
                    onChange={(e) => handleButtonChange(index, 'enabled', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16A34A' }}
                  />
                </div>

                {/* Delete Button */}
                <div>
                  <label style={{ fontSize: '0.75rem', visibility: 'hidden', display: 'block', marginBottom: '0.2rem' }}>
                    हटवा
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveButton(index)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#DC2626', padding: '0.4rem 0.6rem', fontSize: '1.1rem' }}
                    title="बटण काढून टाका"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
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
