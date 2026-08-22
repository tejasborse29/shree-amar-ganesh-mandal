import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfig } from '../../context/ConfigContext';

const CommitteeLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div style={{ background: '#FAF8F5', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        <div className="amgm-card amgm-card-gold" style={{ padding: '2.5rem 2rem' }}>
          
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/assets/Mandal Logo.png"
              alt="Logo"
              style={{ width: '72px', height: '72px', objectFit: 'contain', margin: '0 auto 0.75rem' }}
            />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 800 }}>
              समिती व्यवस्थापन लॉगिन
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              {config.mandalName} • गणेशोत्सव {config.festivalYear}
            </p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group mb-3">
              <label className="form-label">वापरकर्तानाव किंवा मोबाईल नंबर (Username / Mobile)</label>
              <input
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                placeholder="उदा. admin किंवा नोंदणीकृत मोबाईल"
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">पासवर्ड (Password)</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="आपला पासवर्ड प्रविष्ट करा"
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

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              ← सार्वजनिक वेबसाइटवर परत जा
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CommitteeLoginPage;
