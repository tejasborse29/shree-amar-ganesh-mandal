import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminEventsPage = () => {
  const { showSuccess, showError } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '2026-08-28',
    startTime: '०९:०० AM',
    endTime: '१२:०० PM',
    location: 'मुख्य मंडप',
    organizer: 'समिती',
    isPublished: true
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      if (res.success) {
        setEvents(res.events);
      }
    } catch (e) {
      showError('कार्यक्रम लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      showError('कृपया शीर्षक आणि दिनांक भरा.');
      return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await api.put(`/events/${editItem.id || editItem._id}`, form);
        showSuccess('कार्यक्रम अद्यतनित झाला.');
      } else {
        await api.post('/events', form);
        showSuccess('नवीन कार्यक्रम जोडला गेला.');
      }
      setModalOpen(false);
      setEditItem(null);
      fetchEvents();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (event) => {
    try {
      const res = await api.patch(`/events/${event.id || event._id}/publish`);
      if (res.success) {
        showSuccess(res.message);
        fetchEvents();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('हा कार्यक्रम हटवायचा आहे का?')) return;
    try {
      await api.delete(`/events/${id}`);
      showSuccess('कार्यक्रम हटवला गेला.');
      fetchEvents();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            कार्यक्रम व्यवस्थापन (Events & Schedule)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण कार्यक्रम: {events.length}
          </p>
        </div>

        <button onClick={() => { setEditItem(null); setForm({ title: '', description: '', date: '2026-08-28', startTime: '०९:०० AM', endTime: '१२:०० PM', location: 'मुख्य मंडप', organizer: 'समिती', isPublished: true }); setModalOpen(true); }} className="btn btn-primary">
          ➕ नवीन कार्यक्रम जोडा
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : events.length === 0 ? (
        <EmptyState title="कोणताही कार्यक्रम आढळला नाही" />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>दिनांक</th>
                <th>वेळ</th>
                <th>कार्यक्रमाचे नाव</th>
                <th>स्थान</th>
                <th>आयोजक</th>
                <th>स्थिती</th>
                <th style={{ textAlign: 'right' }}>कृती</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id || ev._id}>
                  <td style={{ fontWeight: 700 }}>{ev.date}</td>
                  <td>{ev.startTime}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{ev.title}</td>
                  <td>{ev.location}</td>
                  <td>{ev.organizer}</td>
                  <td>
                    <button
                      onClick={() => togglePublish(ev)}
                      className={`badge ${ev.isPublished ? 'badge-success' : 'badge-warning'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {ev.isPublished ? 'प्रकाशित (Live)' : 'अप्रकाशित (Draft)'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setEditItem(ev);
                          setForm({ ...ev });
                          setModalOpen(true);
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        ✏️ संपादन
                      </button>
                      <button onClick={() => handleDelete(ev.id || ev._id)} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'कार्यक्रम संपादन' : 'नवीन कार्यक्रम जोडा'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">कार्यक्रमाचे नाव *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="उदा. गणेश स्थापना महापूजा"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">तपशील</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-textarea"
              placeholder="कार्यक्रमाची माहिती..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">दिनांक (Date) *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">वेळ (Time)</label>
              <input
                type="text"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="form-input"
                placeholder="०९:०० AM"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">स्थान (Location)</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="form-input"
                placeholder="मुख्य मंडप"
              />
            </div>
            <div className="form-group">
              <label className="form-label">आयोजक समिती</label>
              <input
                type="text"
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                className="form-input"
                placeholder="पूजा समिती"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'जतन होत आहे...' : 'जतन करा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEventsPage;
