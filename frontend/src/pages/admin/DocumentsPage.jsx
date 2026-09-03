import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import { exportElementToPDF } from '../../utils/downloadHelper';

const DocumentsPage = () => {
  const { hasRole } = useAuth();
  const { config, activeFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

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
                <button
                  type="button"
                  onClick={() => setViewDoc(doc)}
                  className="btn btn-outline btn-sm"
                >
                  👁️ पहा / 📥
                </button>
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

      {/* Document View / Official Certificate Preview Modal */}
      <Modal
        isOpen={Boolean(viewDoc)}
        onClose={() => setViewDoc(null)}
        title="📄 अधिकृत दस्तऐवज व परवानगी पत्र (Document View)"
        size="lg"
      >
        {viewDoc && (
          <div>
            {/* Visual Document Printable Canvas */}
            <div
              id="official-document-sheet"
              style={{
                background: '#FFFDF9',
                border: '3px double #D4AF37',
                borderRadius: '16px',
                padding: '2rem 1.75rem',
                color: '#1C1917',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                fontFamily: 'inherit'
              }}
            >
              {/* Document Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #800000', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <img
                    src={config.logoUrl || config.mandalLogo || "/assets/Mandal Logo.png"}
                    alt="Logo"
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#800000', margin: 0, textTransform: 'uppercase' }}>
                      {config.mandalName}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                      अधिकृत दस्तऐवज व शासकीय ना-हरकत अभिलेख • गणेशोत्सव {viewDoc.festivalYear || 2026}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '0.75rem', padding: '0 0.5rem' }}>
                  <span>जावक क्र: <b>MH/PUN/FEST-2026/DOC-{viewDoc.id ? String(viewDoc.id).slice(-4) : '2026'}</b></span>
                  <span>दिनांक: <b>०१/०८/२०२६</b></span>
                </div>
              </div>

              {/* Uploaded Image Preview (If image document) */}
              {viewDoc.fileUrl && (viewDoc.fileUrl.startsWith('data:image') || viewDoc.fileUrl.endsWith('.jpg') || viewDoc.fileUrl.endsWith('.png') || viewDoc.fileUrl.endsWith('.jpeg')) && (
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <img
                    src={viewDoc.fileUrl}
                    alt={viewDoc.title}
                    style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '10px', border: '1px solid #E2E8F0', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Certificate / Permission Content */}
              <div style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
                <div style={{ background: '#FEF3C7', padding: '0.6rem 1rem', borderRadius: '8px', borderLeft: '4px solid #D97706', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 700 }}>दस्तऐवज शीर्षक / विषय:</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#800000' }}>
                    {viewDoc.title}
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '0.75rem' }}>
                  <b>प्रति,</b><br />
                  मा. अध्यक्ष / खजिनदार / कार्यकारणी समिती,<br />
                  <b>{config.mandalName}</b>, गणेशोत्सव {viewDoc.festivalYear || 2026}
                </div>

                <div style={{ fontSize: '0.9rem', color: '#1E293B', background: '#FFFFFF', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>
                    {viewDoc.description || 'सदर अधिकृत दस्तऐवज/परवानगी पत्र गणेशोत्सव २०२६ उत्सवासाठी शासकीय व मंडळ नियमावलीनुसार वैध व स्वीकृत करण्यात आलेले आहे.'}
                  </p>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#64748B' }}>
                    <li>सदर परवानगी/दस्तऐवज फक्त गणेशोत्सव २०२६ कालावधीसाठी वैध आहे.</li>
                    <li>ध्वनिप्रदूषण, वाहतूक व अग्निशामक सुरक्षा नियमांचे पालन करणे आवश्यक राहील.</li>
                    <li>सर्व पावत्या, बिले व हिशोब पारदर्शक नोंदवहीत जतन करणे बंधनकारक आहे.</li>
                  </ul>
                </div>

                {/* Meta details strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>प्रवर्ग (Category):</span><br />
                    <strong style={{ color: '#0F172A' }}>{viewDoc.categoryLabel || viewDoc.category}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>फाईल प्रकार व आकार:</span><br />
                    <strong style={{ color: '#0F172A' }}>{viewDoc.fileType?.toUpperCase() || 'PDF'} ({viewDoc.fileSize || '१.२ MB'})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>अपलोड कर्ता:</span><br />
                    <strong style={{ color: '#0F172A' }}>{viewDoc.uploadedBy || 'समिती प्रशासन'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>स्थिती:</span><br />
                    <strong style={{ color: '#16A34A' }}>✅ प्रमाणित व अधिकृत (Approved)</strong>
                  </div>
                </div>
              </div>

              {/* Official Stamp & Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>मंडळ स्वाक्षरी</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>अध्यक्ष / सचिव</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{config.mandalName}</div>
                </div>

                {/* Approved Seal Stamp */}
                <div style={{
                  border: '2px dashed #16A34A',
                  color: '#16A34A',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  transform: 'rotate(-4deg)'
                }}>
                  ★ प्रमाणित दस्तऐवज ★<br />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>VERIFIED & APPROVED</span>
                </div>

                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>सक्षम प्राधिकारी / निरीक्षक</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>पोलीस / महापालिका अधिकारी</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>परवानगी शाखा • पुणे</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={async () => {
                  const elem = document.getElementById('official-document-sheet');
                  if (elem) {
                    await exportElementToPDF(elem, `${viewDoc.title || 'Document'}.pdf`);
                    showSuccess('दस्तऐवज PDF डाउनलोड झाली!');
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                📥 अधिकृत PDF डाउनलोड करा
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm"
              >
                🖨️ प्रिंट करा
              </button>
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                className="btn btn-ghost btn-sm"
              >
                बंद करा
              </button>
            </div>
          </div>
        )}
      </Modal>

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
