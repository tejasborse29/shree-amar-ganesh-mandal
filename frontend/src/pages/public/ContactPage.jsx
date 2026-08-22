import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const ContactPage = () => {
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.message) {
      showError('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/contact', form);
      if (res.success) {
        showSuccess(res.message || 'आपला संदेश मंडळाकडे पोहोचला आहे.');
        setForm({ name: '', mobile: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      showError(err.message || 'संदेश पाठवताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            संपर्क व विचारणा (Contact Us)
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            मंडळाशी संपर्क साधा
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            {config.mandalName} - आपल्या सूचना, विचारणा व सहभागाचे स्वागत आहे
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          
          {/* Left: Contact Info */}
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              मंडप कार्यालय व संपर्क तपशील
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="amgm-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>📍</div>
                <div>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', fontWeight: 700 }}>पत्ता (Address)</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{config.address}</p>
                </div>
              </div>

              <div className="amgm-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>📞</div>
                <div>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', fontWeight: 700 }}>हेल्पलाईन (Phone)</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{config.contactNumber}</p>
                </div>
              </div>

              <div className="amgm-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>✉️</div>
                <div>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', fontWeight: 700 }}>ईमेल (Email)</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{config.email}</p>
                </div>
              </div>
            </div>

            <a href={config.mapLocation} target="_blank" rel="noreferrer" className="btn btn-outline-gold" style={{ width: '100%', marginBottom: '1.25rem' }}>
              🗺️ Google Maps वर मंडप स्थान उघडा
            </a>

            {/* Social Media Links */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>सोशल मीडिया:</span>
              {config.socialLinks?.facebook && (
                <a
                  href={config.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#1877F2',
                    color: '#FFFFFF'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {config.socialLinks?.instagram && (
                <a
                  href={config.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                    color: '#FFFFFF'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {config.socialLinks?.youtube && (
                <a
                  href={config.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#FF0000',
                    color: '#FFFFFF'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              संदेश पाठवा (Send Message)
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">नाव (Full Name) *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="आपले पूर्ण नाव"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">मोबाईल नंबर (Mobile) *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="१० अंकी मोबाईल नंबर"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">विषय (Subject)</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="उदा. वर्गणी चौकशी / स्वयंसेवक सहभाग"
                />
              </div>

              <div className="form-group">
                <label className="form-label">संदेश (Message) *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="आपला संदेश येथे लिहा..."
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {submitting ? 'पाठवत आहे...' : 'संदेश पाठवा ✉️'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
