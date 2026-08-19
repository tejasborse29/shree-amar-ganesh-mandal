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

            <a href={config.mapLocation} target="_blank" rel="noreferrer" className="btn btn-outline-gold" style={{ width: '100%' }}>
              🗺️ Google Maps वर मंडप स्थान उघडा
            </a>
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
