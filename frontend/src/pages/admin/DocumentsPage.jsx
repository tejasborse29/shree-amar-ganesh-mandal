import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';

const DocumentsPage = () => {
  const { hasRole } = useAuth();
  const { activeFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'PERMISSIONS',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      let url = `/documents?year=${year}`;
      if (categoryFilter !== 'ALL') {
        url += `&category=${categoryFilter}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      showError('कागदपत्रे लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, activeFestival]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showError('कृपया शीर्षक प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('category', form.category);
      formData.append('description', form.description.trim());
      formData.append('festivalYear', activeFestival?.festivalYear || 2026);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        showSuccess(res.message);
        setUploadModalOpen(false);
        setForm({ title: '', category: 'PERMISSIONS', description: '' });
        setSelectedFile(null);
        fetchDocuments();
      }
    } catch (err) {
      showError(err.message || 'दस्तऐवज अपलोड अयशस्वी');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`तुम्हाला '${title}' हा दस्तऐवज हटवायचा आहे का?`)) return;
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.success) {
        showSuccess(res.message);
        fetchDocuments();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917' }}>
            📁 कागदपत्रं व परवानग्या (Documents & Proofs)
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
            मंडळाच्या अधिकृत परवानग्या, शासकीय पत्रे व खर्चाची मूळ बिले
          </span>
        </div>

        {hasRole(['super_admin', 'treasurer', 'event_manager']) && (
          <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary btn-sm">
            <span>➕</span> नवीन कागदपत्र जोडा
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div className="search-chip-bar">
        <button
          className={`filter-chip ${categoryFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('ALL')}
        >
          सर्व दस्तऐवज ({documents.length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === 'PERMISSIONS' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('PERMISSIONS')}
        >
          शासकीय परवानग्या
        </button>
        <button
          className={`filter-chip ${categoryFilter === 'BILLS_EXPENSES' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('BILLS_EXPENSES')}
        >
          खर्च व कर बिले
        </button>
        <button
          className={`filter-chip ${categoryFilter === 'MANDAL_DOCS' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('MANDAL_DOCS')}
        >
          मंडळ घटना व नोंदणी
        </button>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="75px" borderRadius="14px" />
          <Skeleton height="75px" borderRadius="14px" />
        </div>
      ) : documents.length === 0 ? (
        <div className="amgm-card" style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
          <h4>कोणताही दस्तऐवज आढळला नाही</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {documents.map((doc) => (
            <div key={doc.id || doc._id} className="txn-card-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="txn-icon-box" style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '1.4rem' }}>
                  📄
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '0.95rem' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#78716C', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#C2410C', fontWeight: 600 }}>{doc.categoryLabel}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>अपलोड: {doc.uploadedBy}</span>
                  </div>
                  {doc.description && (
                    <div style={{ fontSize: '0.75rem', color: '#A8A29E', marginTop: '0.2rem' }}>
                      {doc.description}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  👁️ पहा / 📥
                </a>
                {hasRole(['super_admin']) && (
                  <button
                    onClick={() => handleDelete(doc.id || doc._id, doc.title)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#DC2626' }}
                    title="हटवा"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="➕ नवीन कागदपत्र / परवानगी पत्र जोडा"
        size="md"
      >
        <form onSubmit={handleUpload}>
          <div className="form-group mb-3">
            <label className="form-label">दस्तऐवजाचे नाव / शीर्षक *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="उदा. पोलीस मंडप ध्वनिक्षेपक परवानगी २०२६"
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">प्रवर्ग (Category) *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="form-input"
            >
              <option value="PERMISSIONS">शासकीय परवानगी (Permissions)</option>
              <option value="BILLS_EXPENSES">खर्च बिले व पावती (Bills / Proofs)</option>
              <option value="MANDAL_DOCS">मंडळ कागदपत्रे व घटना (Mandal Docs)</option>
              <option value="EVENTS">उत्सव कार्यक्रम पत्रिका</option>
              <option value="OTHER">इतर पुरावे</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">तपशील (Description)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input"
              placeholder="दस्तऐवजाबाबत थोडक्यात माहिती..."
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">फाइल निवडा (PDF / Image)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setUploadModalOpen(false)} className="btn btn-ghost">
              रद्द करा
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'अपलोड होत आहे...' : '📁 जतन करा'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DocumentsPage;
