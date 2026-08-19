import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminGalleryPage = () => {
  const { showSuccess, showError } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!form.imageUrl || !form.caption) {
      showError('कृपया फोटो URL आणि कॅप्शन भरा.');
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

        <button onClick={() => setAddModal(true)} className="btn btn-primary">
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
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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
