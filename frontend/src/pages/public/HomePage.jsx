import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import api from '../../services/api';
import QRModal from '../../components/common/QRModal';

const HomePage = () => {
  const { config } = useConfig();
  const [showQR, setShowQR] = useState(false);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [transparency, setTransparency] = useState(null);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false
  });

  useEffect(() => {
    // Dynamic countdown target from config
    const targetDate = new Date(config.sthapanaDate || '2026-08-28T09:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config.sthapanaDate]);

  // Load public preview data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [evRes, actRes, galRes, transRes] = await Promise.all([
          api.get('/public/events'),
          api.get('/public/social-activities'),
          api.get('/public/gallery'),
          api.get('/public/transparency')
        ]);
        if (evRes.success) setEvents(evRes.events.slice(0, 3));
        if (actRes.success) setActivities(actRes.activities);
        if (galRes.success) setPhotos(galRes.gallery.slice(0, 6));
        if (transRes.success) setTransparency(transRes.transparency);
      } catch (e) {
        console.warn('Home data load notice:', e);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-ornament"></div>
        <div className="container hero-grid">
          
          {/* Left Text */}
          <div>
            <div className="hero-badge-fest">
              <span>🚩</span> गणेशोत्सव {config.festivalYear} • सुवर्णमहोत्सवी परंपरा
            </div>
            
            <h1 className="hero-title">{config.mandalName}</h1>
            <div className="hero-subheading">आपला गणपती • आपलं मंडळ • आपली एकजूट</div>
            
            <p className="hero-text">
              «{config.mandalTagline}»<br/>
              भक्ती, संस्कृती आणि सामाजिक बांधिलकी जपत आधुनिक पारदर्शक डिजिटल व्यवस्थापनासह गणेशोत्सवाचा भव्य अनुभव.
            </p>

            <div className="hero-actions">
              <Link to="/events" className="btn btn-primary btn-lg">
                📜 कार्यक्रम पत्रिका पहा
              </Link>
              <Link to="/about" className="btn btn-outline-gold btn-lg">
                ℹ️ मंडळाचा इतिहास व कार्य
              </Link>
              <Link to="/committee/login" className="btn btn-saffron btn-lg">
                🔐 समिती व्यवस्थापन Login
              </Link>
            </div>

            {/* Dynamic Live Countdown Box */}
            <div className="countdown-container">
              <div className="countdown-header">
                <span className="countdown-label">
                  ⏳ {timeLeft.isPassed ? 'गणेशोत्सव आगमन' : 'श्री गणपती आगमनास शिल्लक वेळ'}
                </span>
                <span className="countdown-date-info">
                  स्थापना: {new Date(config.sthapanaDate).toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              {timeLeft.isPassed ? (
                <div className="countdown-passed">
                  🌺 गणेशोत्सव मंगलमय होवो! गणपती बाप्पा मोरया! 🌺
                </div>
              ) : (
                <div className="countdown-grid">
                  <div className="countdown-box">
                    <span className="countdown-digit">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="countdown-unit">दिवस (Days)</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-digit">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="countdown-unit">तास (Hours)</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-digit">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="countdown-unit">मिनिटे (Mins)</span>
                  </div>
                  <div className="countdown-box">
                    <span className="countdown-digit">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="countdown-unit">सेकंद (Secs)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="hero-visual-wrapper">
            <div className="hero-bappa-frame">
              <img
                src="/assets/Ganpanti Bappa Photo (5).jpg"
                alt="Shree Amar Ganesh Bappa"
                className="hero-bappa-img"
              />
              <img
                src="/assets/Mandal Logo.png"
                alt="Logo Stamp"
                className="hero-mandal-float-logo"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. CORE MOTTO BANNER */}
      <section style={{ background: 'linear-gradient(90deg, #800000, #991B1B, #800000)', color: '#FFFFFF', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.4rem', color: '#FDE047', fontWeight: 800, marginBottom: '0.4rem' }}>
            « हिशोब स्पष्ट → गैरसमज कमी → मंडळात एकजूट अधिक »
          </h2>
          <p style={{ color: '#F3F4F6', fontSize: '0.95rem', maxWidth: '700px', margin: '0 auto' }}>
            प्रत्येक रुपयाची त्वरित अधिकृत डिजिटल पावती, पारदर्शक ताळेबंद आणि तंत्रज्ञानाचा सुयोग्य वापर करून मंडळाचा विकास.
          </p>
        </div>
      </section>

      {/* 3. UPCOMING FESTIVAL PROGRAMS */}
      <section className="section-padding" style={{ background: '#FAF8F5' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">उत्सव कार्यक्रम २०२६</span>
            <h2 className="section-title">प्रमुख उत्सव कार्यक्रम</h2>
            <p className="section-subtitle">
              भक्तीमय आरती, सांस्कृतिक संध्या, महाप्रसाद आणि सामाजिक उपक्रमांची पर्वणी.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {events.map((ev) => (
              <div key={ev.id || ev._id} className="amgm-card amgm-card-gold" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-primary">📅 {ev.date}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    ⏰ {ev.startTime}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', color: 'var(--color-primary)' }}>
                  {ev.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1, marginBottom: '1.25rem' }}>
                  {ev.description}
                </p>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <span>📍 {ev.location}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-saffron)' }}>{ev.organizer}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/events" className="btn btn-outline btn-lg">
              सर्व कार्यक्रम पत्रिका पहा →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL IMPACT COUNTERS */}
      <section className="section-padding" style={{ background: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">सामाजिक बांधिलकी</span>
            <h2 className="section-title">मंडळाचे सामाजिक योगदान</h2>
            <p className="section-subtitle">
              केवळ उत्सवच नव्हे, तर वर्षभर समाजाच्या हितासाठी अविरत कार्य.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {activities.map((act) => (
              <div key={act.id || act._id} className="amgm-card" style={{ padding: '1.75rem', textAlign: 'center', background: 'linear-gradient(180deg, #FFFFFF, #FFFDF8)', border: '1.5px solid var(--color-border-gold)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1.1, marginBottom: '0.4rem' }}>
                  {act.statNumber}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-saffron)', marginBottom: '0.5rem' }}>
                  {act.statLabel}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PHOTO GALLERY HIGHLIGHTS */}
      <section className="section-padding" style={{ background: '#FAF8F5' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">उत्सव आठवणी</span>
            <h2 className="section-title">फोटो गॅलरी व क्षणचित्रे</h2>
            <p className="section-subtitle">
              भक्तांचा उत्साह, महाआरती, सांस्कृतिक कार्यक्रम व विसर्जन मिरवणुकीची अविस्मरणीय क्षणचित्रे.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {photos.map((item, idx) => (
              <div key={idx} className="amgm-card" style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {item.caption}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/gallery" className="btn btn-outline-gold btn-lg">
              संपूर्ण फोटो गॅलरी पहा 📸
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
