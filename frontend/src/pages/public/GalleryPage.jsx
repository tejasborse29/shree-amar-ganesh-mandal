import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const CATEGORIES = [
  { id: 'all', label: 'सर्व फोटो (All)' },
  { id: 'Ganesh Sthapana', label: 'श्री गणेश स्थापना' },
  { id: 'Aarti', label: 'महाआरती व भक्ती' },
  { id: 'Cultural Events', label: 'सांस्कृतिक कार्यक्रम' },
  { id: 'Social Activities', label: 'सामाजिक उपक्रम' },
  { id: 'Mahaprasad', label: 'महाप्रसाद' },
  { id: 'Visarjan', label: 'विसर्जन मिरवणूक' },
  { id: 'Memories', label: 'सुवर्ण आठवणी' }
];

const GalleryPage = () => {
  const { config } = useConfig();
  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'all' ? '/public/gallery' : `/public/gallery?category=${encodeURIComponent(selectedCategory)}`;
        const res = await api.get(url);
        if (res.success) {
          setPhotos(res.gallery);
        }
      } catch (e) {
        console.error('Gallery fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  return (
    <div style={{ background: '#FAF8F5', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #800000, #500000)', color: '#FFFFFF', padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <span className="section-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FDE047', borderColor: '#D4AF37' }}>
            फोटो गॅलरी व आठवणी
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            उत्सव क्षणचित्रे (Festival Gallery)
          </h1>
          <p style={{ color: '#F3F4F6', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            {config.mandalName} - गणेशोत्सवाचे विलोभनीय क्षण व आठवणी
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-gold'}`}
              style={{ borderRadius: '20px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} height="240px" borderRadius="12px" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState title="या प्रवर्गात फोटो उपलब्ध नाहीत" message="लवकरच नवीन फोटो अपलोड केले जातील." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {photos.map((item, idx) => (
              <div
                key={item.id || item._id || idx}
                className="amgm-card"
                onClick={() => setLightboxPhoto(item)}
                style={{ cursor: 'pointer', height: '260px', position: 'relative', overflow: 'hidden' }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0.85rem',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  color: '#FFFFFF'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.caption}</div>
                  <div style={{ fontSize: '0.75rem', color: '#FDE047' }}>{item.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <Modal isOpen={!!lightboxPhoto} onClose={() => setLightboxPhoto(null)} title={lightboxPhoto.caption} maxWidth="720px">
          <div style={{ textAlign: 'center' }}>
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.caption}
              style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto' }}
            />
            <p style={{ marginTop: '1rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              {lightboxPhoto.category} • {config.mandalName}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GalleryPage;
