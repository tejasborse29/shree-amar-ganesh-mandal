import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

const Footer = () => {
  const { config } = useConfig();

  return (
    <footer className="public-footer" style={{ background: '#1C1917', color: '#E7E5E4', borderTop: '3px solid #D4AF37', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/assets/Mandal Logo.png" alt="Mandal Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <div>
                <h3 style={{ color: '#FDE047', fontSize: '1.2rem', fontWeight: 800 }}>{config.mandalName}</h3>
                <span style={{ fontSize: '0.75rem', color: '#FB923C' }}>गणेशोत्सव {config.festivalYear}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#A8A29E', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              «{config.mandalTagline}»<br/>
              भक्ती, संस्कृती आणि सामाजिक बांधिलकी जपत आधुनिक डिजिटल व्यवस्थापनासह गणेशोत्सवाचा अनुभव.
            </p>

            {/* Official Social Media Badges */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {config.socialLinks?.facebook && (
                <a
                  href={config.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook Page"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#1877F2',
                    color: '#FFFFFF',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 8px rgba(24, 119, 242, 0.35)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {config.socialLinks?.instagram && (
                <a
                  href={config.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram Official"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                    color: '#FFFFFF',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 8px rgba(214, 36, 159, 0.35)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {config.socialLinks?.youtube && (
                <a
                  href={config.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube Channel"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#FF0000',
                    color: '#FFFFFF',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 8px rgba(255, 0, 0, 0.35)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FDE047', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', borderBottom: '1px solid #44403C', paddingBottom: '0.5rem' }}>
              महत्त्वाचे दुवे (Quick Links)
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/about" style={{ color: '#D6D3D1' }}>• मंडळाचा इतिहास व कार्य</Link></li>
              <li><Link to="/events" style={{ color: '#D6D3D1' }}>• उत्सव २०२६ कार्यक्रम पत्रिका</Link></li>
              <li><Link to="/gallery" style={{ color: '#D6D3D1' }}>• उत्सव आठवणी व गॅलरी</Link></li>
              <li><Link to="/social-activities" style={{ color: '#D6D3D1' }}>• मंडळाचे सामाजिक उपक्रम</Link></li>
              <li><Link to="/contact" style={{ color: '#D6D3D1' }}>• मंडळ संपर्क व पत्ता</Link></li>
              <li><Link to="/committee/login" style={{ color: '#FB923C' }}>• 🔐 समिती व्यवस्थापन Login</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#FDE047', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', borderBottom: '1px solid #44403C', paddingBottom: '0.5rem' }}>
              मंडप पत्ता व संपर्क
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#D6D3D1', lineHeight: '1.6', marginBottom: '0.8rem' }}>
              📍 {config.address}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#D6D3D1', marginBottom: '0.4rem' }}>
              📞 फोन: {config.contactNumber}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#D6D3D1', marginBottom: '1rem' }}>
              ✉️ ईमेल: {config.email}
            </p>
            <a href={config.mapLocation} target="_blank" rel="noreferrer" className="btn btn-outline-gold btn-sm">
              🗺️ Google Maps वर पहा
            </a>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div style={{ borderTop: '1px solid #292524', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#78716C' }}>
          <p>© {config.festivalYear} {config.mandalName}. सर्व हक्क सुरक्षित.</p>
          <p>हिशोब स्पष्ट → गैरसमज कमी → मंडळात एकजूट अधिक 🚩</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
