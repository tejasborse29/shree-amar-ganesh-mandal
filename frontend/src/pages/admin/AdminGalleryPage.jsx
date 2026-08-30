import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const PRESET_SAMPLES = [
  {
    title: 'श्री गणेश मूर्ती',
    category: 'Ganesh Sthapana',
    caption: 'श्री अमर गणेश विलोभनीय रूप व आगमन',
    url: '/assets/Ganpanti Bappa Photo (5).jpg'
  },
  {
    title: 'महाआरती सोहळा',
    category: 'Aarti',
    caption: 'संध्याकाळची मंगल महाआरती व भक्ती संध्या',
    url: '/assets/Memories Photo 1.jpg'
  },
  {
    title: 'मंडप व रोषणाई',
    category: 'Cultural Events',
    caption: 'भव्य मंडप सजावट व विद्युत रोषणाई',
    url: '/assets/Memories Photo (3).jpg'
  },
  {
    title: 'महाप्रसाद वाटप',
    category: 'Mahaprasad',
    caption: 'भव्य महाप्रसाद व अन्नदान सोहळा',
    url: '/assets/Memories Photo (5).jpg'
  },
  {
    title: 'विसर्जन मिरवणूक',
    category: 'Visarjan',
    caption: 'ढोल ताशांच्या गजरात विसर्जन मिरवणूक',
    url: '/assets/Memories Photo (6).jpg'
  },
  {
    title: 'सुवर्ण आठवणी',
    category: 'Memories',
    caption: 'मंडळाचे कार्यकर्ते व अविस्मरणीय आठवणी',
    url: '/assets/Memories Photo (7).jpg'
  }
];

const AdminGalleryPage = () => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'preset' | 'url'

  const [form, setForm] = useState({
    imageUrl: '',
    caption: '',
    category: 'Ganesh Sthapana'
  });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery');
      if (res.success) {
        setPhotos(res.gallery);
      }
    } catch (e) {
      showError('गॅलरी लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('कृपया वैध फोटो निवडा (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setForm((prev) => ({
          ...prev,
          imageUrl: compressedBase64,
          caption: prev.caption || file.name.replace(/\.[^/.]+$/, '')
        }));
        showSuccess('फोटो मोबाईलमधून यशस्वीपणे निवडला गेला!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setForm({
      imageUrl: preset.url,
      category: preset.category,
      caption: preset.caption
    });
    showSuccess(`'${preset.title}' सॅम्पल फोटो निवडला गेला!`);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!form.imageUrl || !form.caption) {
      showError('कृपया फोटो निवडा आणि कॅप्शन भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/gallery', form);
      if (res.success) {
        showSuccess(res.message);
        setAddModal(false);
        setForm({ imageUrl: '', caption: '', category: 'Ganesh Sthapana' });
        fetchGallery();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('हा फोटो हटवायचा आहे का?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      showSuccess('फोटो हटवला गेला.');
      fetchGallery();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            फोटो गॅलरी व्यवस्थापन (Gallery)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण फोटो: {photos.length}
          </p>
        </div>

        <button onClick={() => { setForm({ imageUrl: '', caption: '', category: 'Ganesh Sthapana' }); setAddModal(true); }} className="btn btn-primary">
          ➕ नवीन फोटो जोडा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : photos.length === 0 ? (
        <EmptyState title="गॅलरीत फोटो उपलब्ध नाहीत" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {photos.map((p) => (
            <div key={p.id || p._id} className="amgm-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={p.imageUrl} alt={p.caption} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
                  {p.caption}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-saffron)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {p.category}
                </div>
                <button
                  onClick={() => handleDelete(p.id || p._id)}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  🗑️ हटवा
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="गॅलरीत फोटो जोडा">
        <form onSubmit={handleAddPhoto}>

          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#F5F5F4', padding: '0.35rem', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setUploadMode('upload')}
              className={`btn btn-sm ${uploadMode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: '0.85rem' }}
            >
              📱 मोबाईलमधून अपलोड
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('preset')}
              className={`btn btn-sm ${uploadMode === 'preset' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: '0.85rem' }}
            >
              ✨ सॅम्पल फोटो निवडा
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`btn btn-sm ${uploadMode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: '0.85rem' }}
            >
              🔗 URL / पाथ
            </button>
          </div>

          {/* 1. Direct File Upload from Mobile */}
          {uploadMode === 'upload' && (
            <div className="form-group mb-3">
              <label className="form-label">मोबाईल / गॅलरीमधून फोटो निवडा *</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #EA580C',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#FFF7ED',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                <div style={{ fontWeight: 700, color: '#C2410C', fontSize: '0.95rem' }}>
                  मोबाईल गॅलरी किंवा कॅमेरामधून फोटो निवडा
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.25rem' }}>
                  (येथे टच करा - JPG, PNG)
                </div>
              </div>
            </div>
          )}

          {/* 2. Preset Samples Grid */}
          {uploadMode === 'preset' && (
            <div className="form-group mb-3">
              <label className="form-label">सॅम्पल फोटो निवडा (Select Sample Photo) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto', padding: '0.25rem' }}>
                {PRESET_SAMPLES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      border: form.imageUrl === preset.url ? '2px solid #EA580C' : '1px solid #E7E5E4',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: form.imageUrl === preset.url ? '#FFF7ED' : '#FFFFFF',
                      boxShadow: form.imageUrl === preset.url ? '0 0 0 2px rgba(234, 88, 12, 0.2)' : 'none'
                    }}
                  >
                    <img src={preset.url} alt={preset.title} style={{ width: '100%', height: '75px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#292524', textAlign: 'center' }}>
                      {preset.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Manual URL */}
          {uploadMode === 'url' && (
            <div className="form-group mb-3">
              <label className="form-label">फोटो URL किंवा पाथ (Image URL / Path) *</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="form-input"
                placeholder="/assets/Memories Photo 1.jpg किंवा https://..."
                required
              />
            </div>
          )}

          {/* Image Preview Box */}
          {form.imageUrl && (
            <div style={{ marginBottom: '1rem', textAlign: 'center', background: '#FAFAF9', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E7E5E4' }}>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginBottom: '0.35rem' }}>
                ✓ फोटो निवडला गेला आहे:
              </div>
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
          )}

          <div className="form-group mb-3">
            <label className="form-label">प्रवर्ग (Category)</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="form-select"
            >
              <option value="Ganesh Sthapana">श्री गणेश स्थापना</option>
              <option value="Aarti">महाआरती</option>
              <option value="Cultural Events">सांस्कृतिक कार्यक्रम</option>
              <option value="Social Activities">सामाजिक उपक्रम</option>
              <option value="Mahaprasad">महाप्रसाद</option>
              <option value="Visarjan">विसर्जन मिरवणूक</option>
              <option value="Memories">सुवर्ण आठवणी</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">कॅप्शन / शीर्षक *</label>
            <input
              type="text"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="form-input"
              placeholder="उदा. आरती व भक्ती संध्या"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setAddModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जोडत आहे...' : 'फोटो जोडा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminGalleryPage;
