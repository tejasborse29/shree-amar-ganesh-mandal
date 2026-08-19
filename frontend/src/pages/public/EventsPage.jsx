import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const EventsPage = () => {
  const { config } = useConfig();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/public/events');
        if (res.success) {
          setEvents(res.events);
        }
      } catch (e) {
        console.error('Events load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const createGoogleCalendarUrl = (ev) => {
    const title = encodeURIComponent(`${ev.title} - ${config.mandalName}`);
    const details = encodeURIComponent(`${ev.description}\nस्थान: ${ev.location}`);
    const location = encodeURIComponent(ev.location);
    // Format YYYYMMDD
    const dateFormatted = ev.date.replace(/-/g, '');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T090000Z/${dateFormatted}T120000Z`;
  };

  const handleShare = (ev) => {
    if (navigator.share) {
      navigator.share({
        title: ev.title,
        text: `🚩 ${config.mandalName} - ${ev.title}\n📅 दिनांक: ${ev.date} (${ev.startTime})\n📍 स्थान: ${ev.location}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`🚩 ${config.mandalName} - ${ev.title}\n📅 दिनांक: ${ev.date} (${ev.startTime})\n📍 स्थान: ${ev.location}`);
      alert('कार्यक्रमाची माहिती कॉपी झाली आहे!');
    }
  };

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            गणेशोत्सव {config.festivalYear}
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            उत्सव कार्यक्रम व दिनदर्शिका
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            १० दिवसांचे भक्तीमय, सांस्कृतिक व सामाजिक कार्यक्रम
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="skeleton" style={{ height: '120px' }}></div>
            <div className="skeleton" style={{ height: '120px' }}></div>
            <div className="skeleton" style={{ height: '120px' }}></div>
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत" message="लवकरच नवीन कार्यक्रमांची यादी प्रसिद्ध केली जाईल." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {events.map((ev, index) => (
              <div
                key={ev.id || ev._id}
                className="amgm-card amgm-card-gold"
                style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '2rem', alignItems: 'center' }}
              >
                {/* Date Col */}
                <div style={{ textAlign: 'center', background: '#FFF7ED', border: '1.5px solid var(--color-saffron)', borderRadius: '12px', padding: '1rem 0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-saffron)', textTransform: 'uppercase' }}>
                    दिवस {index + 1}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    {ev.date}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    ⏰ {ev.startTime}
                  </div>
                </div>

                {/* Details Col */}
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                    {ev.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                    {ev.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>📍 स्थान: <b>{ev.location}</b></span>
                    <span>👤 आयोजक: <b style={{ color: 'var(--color-saffron)' }}>{ev.organizer}</b></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a
                    href={createGoogleCalendarUrl(ev)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-gold btn-sm"
                  >
                    📅 कॅलेंडरमध्ये जोडा
                  </a>
                  <button
                    onClick={() => handleShare(ev)}
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    📤 शेअर करा
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
