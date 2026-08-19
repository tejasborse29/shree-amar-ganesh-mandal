import React from 'react';
import { useConfig } from '../../context/ConfigContext';

const AboutPage = () => {
  const { config } = useConfig();

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            आमच्याविषयी (About Us)
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            {config.mandalName}
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            « {config.mandalTagline} »
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              मंडळाचा गौरवशाली इतिहास व परंपरा
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.2rem', fontSize: '1rem' }}>
              श्री अमर गणेश मित्र मंडळाची स्थापना परिसरातील सर्व धर्मीय नागरिकांना एकत्र आणून सामाजिक एकात्मता आणि संस्कृतीचे संवर्धन करण्याच्या उद्देशाने झाली. मंडळाने स्थापनेपासूनच सार्वजनिक गणेशोत्सवाची पवित्र परंपरा जपत सामाजिक प्रबोधनाचा वसा जपला आहे.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.2rem', fontSize: '1rem' }}>
              यंदाच्या २०२६ च्या गणेशोत्सवात मंडळाने एक ऐतिहासिक पाऊल उचलले असून, मंडळाचे संपूर्ण आर्थिक व्यवहार, देणग्या, पावत्या आणि हिशोब <b>१००% डिजिटल आणि पारदर्शक</b> केले आहेत. यामुळे मंडळावर विश्वास ठेवणार्‍या प्रत्येक भाविकाला त्याच्या योगदानाचा अधिकृत ताळेबंद उपलब्ध होतो.
            </p>
            <div style={{ background: '#FFFBEB', borderLeft: '4px solid var(--color-gold)', padding: '1rem 1.25rem', borderRadius: '4px' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                «“हिशोब स्पष्ट → गैरसमज कमी → मंडळात एकजूट अधिक”»
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="hero-bappa-frame" style={{ maxWidth: '360px', margin: '0 auto' }}>
              <img src="/assets/Memories Photo 1.jpg" alt="Mandal Memories" className="hero-bappa-img" style={{ height: '380px' }} />
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🪔</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '0.6rem' }}>धार्मिक व सांस्कृतिक निष्ठा</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              शास्त्रोक्त पूजा, पारंपरिक आरती, सुश्राव्य भजने आणि लोककलेचा वारसा जपत भाविकांना पवित्र गणेशोत्सवाचा मंगलमय अनुभव देणे.
            </p>
          </div>

          <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '0.6rem' }}>सामाजिक बांधिलकी</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              रक्तदान शिबिर, वृक्षारोपण मोहीम, गरजू विद्यार्थ्यांना शैक्षणिक मदत आणि मोफत आरोग्य तपासणी शिबिरांचे वर्षभर आयोजन.
            </p>
          </div>

          <div className="amgm-card amgm-card-gold" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💻</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '0.6rem' }}>आधुनिक डिजिटल व्यवस्थापन</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              प्रत्येक वर्गणीदाराला तत्काळ डिजिटल पावती, क्यूआर कोडद्वारे सत्यता पडताळणी आणि सार्वजनिक पारदर्शक हिशोब.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
