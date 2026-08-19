import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';
import ExpenseDonutChart from '../../components/charts/ExpenseDonutChart';

const TransparencyPage = () => {
  const { config } = useConfig();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransparency = async () => {
      try {
        const res = await api.get('/public/transparency');
        if (res.success) {
          setData(res.transparency);
        }
      } catch (e) {
        console.error('Transparency error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransparency();
  }, []);

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            पारदर्शकता व विश्वास (Public Financial Transparency)
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            मंडळाचा पारदर्शक हिशोब
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            « हिशोब स्पष्ट → गैरसमज कमी → मंडळात एकजूट अधिक »
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', maxWidth: '1000px' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : !data ? (
          <div className="empty-state">
            <h3 className="empty-title">पारदर्शक हिशोब सध्या अनुपलब्ध आहे</h3>
          </div>
        ) : (
          <div>
            {/* Top 4 Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                  एकूण जमा वर्गणी (Total Collection)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16A34A' }}>
                  ₹ {data.totalCollection?.toLocaleString('en-IN') || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.3rem' }}>
                  ✅ सर्व अधिकृत पावत्यांसह प्रमाणित
                </div>
              </div>

              <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                  एकूण प्रमाणित खर्च (Total Expenses)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#DC2626' }}>
                  ₹ {data.totalExpenses?.toLocaleString('en-IN') || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.3rem' }}>
                  🧾 सर्व देयके व बिलांसह ऑडिट केलेले
                </div>
              </div>

              <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                  शिल्लक निधी (Net Balance)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563EB' }}>
                  ₹ {data.netBalance?.toLocaleString('en-IN') || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.3rem' }}>
                  🏦 अधिकृत बँक खात्यातील शिल्लक
                </div>
              </div>

              <div className="amgm-card amgm-card-gold" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                  जारी केलेल्या अधिकृत पावत्या
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#D97706' }}>
                  {data.totalReceipts || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.3rem' }}>
                  🔒 १००% डिजिटल नोंदणीकृत
                </div>
              </div>
            </div>

            {/* Expense Breakdown & Transparency Pledge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
              <ExpenseDonutChart categories={data.expenseByCategory || []} />

              <div className="amgm-card" style={{ padding: '1.75rem', background: '#FFFDF5', border: '1.5px solid var(--color-border-gold)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.85rem' }}>
                  🛡️ मंडळाचे पारदर्शकता धोरण
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <li>✓ प्रत्येक वर्गणीदारास स्वाक्षरीसह डिजिटल पावती मिळते.</li>
                  <li>✓ पावतीवरील QR कोड स्कॅन करून सत्यता पडताळता येते.</li>
                  <li>✓ मंडळात सर्व खर्चाचे बिल व व्हाऊचर्स जतन केले जातात.</li>
                  <li>✓ भाविकांच्या वैयक्तिक गोपनीयतेचे (फोन/पत्ता) पूर्ण रक्षण केले जाते.</li>
                  <li>✓ उत्सवानंतर वार्षिक हिशोब अहवाल सर्वांसाठी उपलब्ध केला जातो.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransparencyPage;
