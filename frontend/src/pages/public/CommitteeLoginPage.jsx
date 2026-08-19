import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';

const CommitteeLoginPage = () => {
  const { login } = useAuth();
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showError('कृपया वापरकर्तानाव/मोबाईल आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(identifier, password);
      showSuccess(`स्वागत आहे, ${res.user?.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      showError(err.message || 'लॉगिन अयशस्वी. माहिती तपासा.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setIdentifier(u);
    setPassword(p);
  };

  return (
    <div style={{ background: '#FAF8F5', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        <div className="amgm-card amgm-card-gold" style={{ padding: '2.5rem 2rem' }}>
          
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/assets/Mandal Logo.png"
              alt="Logo"
              style={{ width: '64px', height: '64px', margin: '0 auto 0.75rem', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 800, lineHeight: 1.2 }}>
              मंडळ समिती Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-saffron)', fontWeight: 600 }}>
              {config.mandalName}
            </p>
          </div>

          {isExpired && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              ⚠️ आपले सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">वापरकर्तानाव / मोबाईल (Username / Mobile)</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                placeholder="उदा. admin किंवा 9876543210"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">पासवर्ड (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="आपला पासवर्ड"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {submitting ? 'प्रमाणीकरण होत आहे...' : '🔐 समिती लॉगिन करा'}
            </button>
          </form>

          {/* Quick Demo Login Fillers */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.6rem', textAlign: 'center' }}>
              ⚡ त्वरित चाचणी खाती (Demo Credentials):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'Admin@AMGM2026')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', border: '1px solid #E5E7EB' }}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('treasurer', 'Treasurer@AMGM2026')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', border: '1px solid #E5E7EB' }}
              >
                💰 खजिनदार (Treasurer)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('receipt_mgr', 'Receipt@AMGM2026')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', border: '1px solid #E5E7EB' }}
              >
                🧾 पावती प्रमुख
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('volunteer1', 'Volunteer@AMGM2026')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', border: '1px solid #E5E7EB' }}
              >
                🤝 कार्यकर्ता
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              ← सार्वजनिक वेबसाइटवर परत जा
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CommitteeLoginPage;
