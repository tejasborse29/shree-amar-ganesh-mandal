import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

const Footer = () => {
  const { config } = useConfig();

  return (
    <footer className="public-footer" style={{ background: '#1C1917', color: '#E7E5E4', borderTop: '3px solid #D4AF37', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {config.socialLinks?.facebook && (
                <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" style={{ color: '#FDE047', fontSize: '1.2rem' }}>🌐 FB</a>
              )}
              {config.socialLinks?.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noreferrer" style={{ color: '#FDE047', fontSize: '1.2rem' }}>📸 Insta</a>
              )}
              {config.socialLinks?.youtube && (
                <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer" style={{ color: '#FDE047', fontSize: '1.2rem' }}>📺 YouTube</a>
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
              <li><Link to="/vargani" style={{ color: '#D6D3D1' }}>• ऑनलाइन डिजिटल वर्गणी</Link></li>
              <li><Link to="/gallery" style={{ color: '#D6D3D1' }}>• उत्सव आठवणी व गॅलरी</Link></li>
              <li><Link to="/transparency" style={{ color: '#D6D3D1' }}>• मंडळाचा पारदर्शक हिशोब</Link></li>
              <li><Link to="/committee/login" style={{ color: '#FB923C' }}>• 🔐 समिती व्यवस्थापन Login</Link></li>
            </ul>
          </div>

          {/* Bank & UPI Donation Details */}
          <div>
            <h4 style={{ color: '#FDE047', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', borderBottom: '1px solid #44403C', paddingBottom: '0.5rem' }}>
              अधिकृत बँक तपशील
            </h4>
            <div style={{ background: '#292524', padding: '1rem', borderRadius: '8px', border: '1px solid #44403C', fontSize: '0.85rem' }}>
              <p style={{ color: '#FDE047', fontWeight: 700, marginBottom: '0.3rem' }}>UPI ID: {config.upiId}</p>
              <p style={{ color: '#A8A29E' }}>नाव: {config.bankDetails?.accountName}</p>
              <p style={{ color: '#A8A29E' }}>बँक: {config.bankDetails?.bankName}</p>
              <p style={{ color: '#A8A29E' }}>खाते क्र.: {config.bankDetails?.accountNumber}</p>
              <p style={{ color: '#A8A29E' }}>IFSC: {config.bankDetails?.ifsc}</p>
            </div>
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
