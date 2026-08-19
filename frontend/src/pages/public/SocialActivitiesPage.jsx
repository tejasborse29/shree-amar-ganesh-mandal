import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const SocialActivitiesPage = () => {
  const { config } = useConfig();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const res = await api.get('/public/social-activities');
        if (res.success) {
          setActivities(res.activities);
        }
      } catch (e) {
        console.error('Social activities error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSocial();
  }, []);

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            सामाजिक बांधिलकी व उपक्रम
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            मंडळाचे सामाजिक योगदान
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            भक्तीसोबत समाजसेवा - समाज घडवणारे उपक्रम
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Skeleton height="200px" />
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState title="सध्या माहिती उपलब्ध नाही" message="उपक्रमांची यादी लवकरच प्रसिद्ध केली जाईल." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {activities.map((act) => (
              <div
                key={act.id || act._id}
                className="amgm-card amgm-card-gold"
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', textAlign: 'center' }}
              >
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  lineHeight: 1.1,
                  marginBottom: '0.5rem'
                }}>
                  {act.statNumber}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-saffron)', marginBottom: '0.75rem' }}>
                  {act.title}
                </h3>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.85rem' }}>
                  {act.statLabel}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialActivitiesPage;
