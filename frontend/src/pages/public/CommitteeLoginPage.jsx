import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfig } from '../../context/ConfigContext';

const CommitteeLoginPage = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();

  // Active Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');
  
  // Show/Hide Password
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Register State
  const [regForm, setRegForm] = useState({
    mandalName: '',
    name: '',
    username: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'super_admin',
    department: 'मंडळ प्रशासन (Administration)'
  });
  const [submittingReg, setSubmittingReg] = useState(false);

  // Forgot Password State
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter Identifier, 2: Enter OTP & New Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);

  // --- Handlers ---

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      showError('कृपया वापरकर्तानाव/मोबाईल/ईमेल आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    setSubmittingLogin(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      showSuccess(`स्वागत आहे, ${res.user?.name || 'कार्यकर्ते'}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      showError(err.message || 'लॉगिन अयशस्वी. कृपया माहिती तपासा.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.mandalName || !regForm.name || !regForm.username || !regForm.mobile || !regForm.password) {
      showError('कृपया मंडळाचे नाव, पूर्ण नाव, वापरकर्तानाव, मोबाईल आणि पासवर्ड भरा.');
      return;
    }

    if (regForm.mobile.replace(/\D/g, '').length < 10) {
      showError('कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      showError('पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत.');
      return;
    }

    if (regForm.password.length < 4) {
      showError('पासवर्ड किमान ४ अक्षरांचा असावा.');
      return;
    }

    setSubmittingReg(true);
    try {
      const payload = {
        mandalName: regForm.mandalName.trim(),
        name: regForm.name.trim(),
        username: regForm.username.trim().toLowerCase(),
        mobile: regForm.mobile.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        role: 'super_admin',
        department: regForm.department || 'मंडळ प्रशासन (Administration)'
      };

      const res = await register(payload);
      showSuccess(res.message || 'नोंदणी यशस्वी झाली! आपले स्वागत आहे.');
      navigate('/admin/dashboard');
    } catch (err) {
      showError(err.message || 'नोंदणी करताना त्रुटी आली.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      showError('कृपया वापरकर्तानाव, मोबाईल किंवा ईमेल टाका.');
      return;
    }

    setSubmittingForgot(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      setMaskedMobile(res.maskedMobile || forgotIdentifier);
      if (res.otp) {
        setForgotOtp(res.otp); // Pre-fill generated OTP for seamless user experience
      }
      setForgotStep(2);
      showSuccess(res.message || 'पडताळणी कोड तयार झाला आहे.');
    } catch (err) {
      showError(err.message || 'वापरकर्ता सापडला नाही.');
    } finally {
      setSubmittingForgot(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword || !confirmNewPassword) {
      showError('कृपया सर्व माहिती भरा.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError('नवीन पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत.');
      return;
    }

    if (newPassword.length < 4) {
      showError('पासवर्ड किमान ४ अक्षरांचा असावा.');
      return;
    }

    setSubmittingForgot(true);
    try {
      const res = await resetPassword(forgotIdentifier.trim(), forgotOtp.trim(), newPassword);
      showSuccess(res.message || 'पासवर्ड यशस्वीरीत्या बदलला आहे!');
      setForgotModal(false);
      setForgotStep(1);
      setLoginIdentifier(forgotIdentifier.trim());
      setLoginPassword(newPassword);
      setActiveTab('login');
    } catch (err) {
      showError(err.message || 'पासवर्ड बदलताना त्रुटी आली.');
    } finally {
      setSubmittingForgot(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFFDF5 0%, #FAF8F5 50%, #F5F3EF 100%)',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Main Card */}
        <div className="amgm-card amgm-card-gold" style={{
          padding: '2rem 1.5rem',
          borderRadius: '20px',
          boxShadow: '0 12px 36px rgba(128, 0, 0, 0.08), 0 2px 8px rgba(0,0,0,0.04)'
        }}>
          
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img
              src={config.logoUrl || config.mandalLogo || "/assets/Mandal Logo.png"}
              alt="Logo"
              style={{
                width: '68px',
                height: '68px',
                objectFit: 'contain',
                margin: '0 auto 0.75rem',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                padding: '4px'
              }}
            />
            <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '0.2rem' }}>
              {config.mandalName}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              डिजिटल व्यवस्थापन पोर्टल • उत्सव {config.festivalYear}
            </p>
          </div>

          {/* --- LOGIN FORM --- */}
          <form onSubmit={handleLoginSubmit} autoComplete="on">
            <div className="form-group mb-3">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                वापरकर्तानाव / मोबाईल / ईमेल आयडी *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="form-input"
                  placeholder="उदा. admin किंवा 9876543210 किंवा email@id"
                  style={{ fontSize: '0.95rem', paddingRight: '2.5rem' }}
                  required
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E' }}>
                  👤
                </span>
              </div>
            </div>

            <div className="form-group mb-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label mb-0" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  पासवर्ड (Password) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(true);
                    setForgotStep(1);
                    setForgotIdentifier(loginIdentifier);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-saffron)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  🔑 पासवर्ड विसरलात?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="form-input"
                  placeholder="आपला पासवर्ड प्रविष्ट करा"
                  style={{ fontSize: '0.95rem', paddingRight: '2.8rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#78716C'
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '1.25rem',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '12px'
              }}
            >
              {submittingLogin ? 'प्रमाणीकरण होत आहे...' : '🔐 समिती लॉगिन करा'}
            </button>
          </form>



          {/* Public Website Link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              ← मुख्य संकेतस्थळावर परत जा (Go to Website)
            </Link>
          </div>

        </div>

      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {forgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem 1.5rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setForgotModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F5F5F4',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🔑</span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
                पासवर्ड रीसेट करा (Reset Password)
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                {forgotStep === 1
                  ? 'आपले वापरकर्तानाव, मोबाईल नंबर किंवा ईमेल प्रविष्ट करा'
                  : `पडताळणी कोड व नवीन पासवर्ड प्रविष्ट करा (${maskedMobile})`}
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    वापरकर्तानाव / मोबाईल / ईमेल *
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="form-input"
                    placeholder="उदा. admin किंवा 9876543210"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingForgot}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', borderRadius: '12px', fontWeight: 800 }}
                >
                  {submittingForgot ? 'शोधत आहे...' : '📩 पडताळणी कोड (OTP) मिळवा'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="form-group mb-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      ६-अंकी पडताळणी कोड (OTP) *
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-saffron)', fontWeight: 700 }}>
                      (डीफॉल्ट कोड: {forgotOtp || '123456'})
                    </span>
                  </div>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="form-input"
                    placeholder="६ अंकी OTP कोड"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    नवीन पासवर्ड (New Password) *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="किमान ४ अक्षरांचा पासवर्ड"
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    नवीन पासवर्ड पुष्टी करा *
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="पासवर्ड पुन्हा टाका"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingForgot}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', borderRadius: '12px', fontWeight: 800, marginBottom: '0.75rem' }}
                >
                  {submittingForgot ? 'बदलत आहे...' : '💾 नवीन पासवर्ड सेव्ह करा व लॉगिन व्हा'}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', borderRadius: '10px' }}
                >
                  ← मागे जा
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeLoginPage;
