import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { config, announcements } = useConfig();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const topAnnouncement = announcements.length > 0 ? announcements[0] : null;

  const navLinks = [
    { name: 'मुख्यपृष्ठ', path: '/' },
    { name: 'मंडळाविषयी', path: '/about' },
    { name: 'उत्सव २०२६', path: '/events' },
    { name: 'फोटो गॅलरी', path: '/gallery' },
    { name: 'सामाजिक उपक्रम', path: '/social-activities' },
    { name: 'संपर्क', path: '/contact' }
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Top Announcement Bar */}
      {topAnnouncement && (
        <div className="top-ticker-bar">
          <div className="container ticker-content">
            <span className="ticker-tag">महत्त्वाची सूचना</span>
            <span className="ticker-marquee">{topAnnouncement.title}: {topAnnouncement.message}</span>
          </div>
          <div className="ticker-contact-fast">
            <span>📞 {config.contactNumber}</span>
          </div>
        </div>
      )}

      {/* Main Public Header */}
      <header className="public-header">
        <div className="container header-container">
          {/* Brand Logo & Name */}
          <Link to="/" className="header-brand">
            <img src="/assets/Mandal Logo.png" alt="Mandal Logo" className="brand-logo-img" />
            <div className="brand-info">
              <span className="brand-name">{config.mandalName}</span>
              <span className="brand-tagline">गणेशोत्सव {config.festivalYear}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav>
            <ul className="nav-menu-desktop">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link-item ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Committee Login & Mobile Toggle */}
          <div className="header-actions">
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="btn btn-primary btn-sm">
                📊 व्यवस्थापन पॅनल
              </Link>
            ) : (
              <Link to="/committee/login" className="committee-login-btn desktop-only">
                <span>🔐</span> समिती Login
              </Link>
            )}

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
      >
        <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="brand-info">
              <span className="brand-name" style={{ fontSize: '1.1rem' }}>{config.mandalName}</span>
              <span className="brand-tagline">गणेशोत्सव {config.festivalYear}</span>
            </div>
            <button className="modal-close-btn" onClick={closeMobile}>&times;</button>
          </div>

          <ul className="drawer-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`drawer-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="drawer-footer">
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="btn btn-primary" style={{ width: '100%' }} onClick={closeMobile}>
                📊 व्यवस्थापन पॅनल ({user?.name})
              </Link>
            ) : (
              <Link to="/committee/login" className="btn btn-outline" style={{ width: '100%' }} onClick={closeMobile}>
                🔐 समिती Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
