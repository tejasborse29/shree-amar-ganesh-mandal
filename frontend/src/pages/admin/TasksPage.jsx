import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const TasksPage = () => {
  const { showSuccess, showError } = useToast();
  const { hasRole } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    department: 'मंडप व्यवस्थापन',
    priority: 'Medium',
    dueDate: '',
    assignedToName: 'श्री. ओंकार गायकवाड'
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = '/tasks';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (e) {
      showError('कामे लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title) {
      showError('कृपया कामाचे नाव भरा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', form);
      if (res.success) {
        showSuccess(res.message);
        setCreateModal(false);
        setForm({ title: '', description: '', department: 'मंडप व्यवस्थापन', priority: 'Medium', dueDate: '', assignedToName: '' });
        fetchTasks();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.success) {
        showSuccess('स्थिती अद्यतनित झाली.');
        fetchTasks();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            कामकाज व कार्य वाटप (Tasks Management)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            एकूण कामे: {tasks.length}
          </p>
        </div>

        {hasRole(['super_admin', 'event_manager', 'treasurer']) && (
          <button onClick={() => setCreateModal(true)} className="btn btn-primary">
            ➕ नवीन काम नेमून द्या
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'Pending', 'In Progress', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline-gold'}`}
          >
            {st === '' ? 'सर्व (All)' : st === 'Pending' ? '⏳ प्रलंबित' : st === 'In Progress' ? '🔄 चालू' : '✅ पूर्ण'}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : tasks.length === 0 ? (
        <EmptyState title="कोणतेही काम आढळले नाही" message="सर्व कामे पूर्ण झाली आहेत किंवा नवीन काम जोडा." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {tasks.map((t) => (
            <div key={t.id || t._id} className="amgm-card amgm-card-gold" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className={`badge ${t.priority === 'Urgent' ? 'badge-error' : t.priority === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                  {t.priority}
                </span>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id || t._id, e.target.value)}
                  className="form-select"
                  style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                {t.title}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1, marginBottom: '1rem' }}>
                {t.description}
              </p>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>👤 नेमणूक: <b>{t.assignedToName || 'सर्व'}</b></span>
                <span>📅 मुदत: <b>{t.dueDate || 'तात्काळ'}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="नवीन काम नेमून द्या">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">कामाचे शीर्षक (Task Title) *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="उदा. मंडप अंतर्गत वीज तपासणी"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">तपशील (Description)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-textarea"
              placeholder="कामाची सविस्तर माहिती..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">प्राधान्य (Priority)</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="form-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">मुदत दिनांक (Due Date)</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">जबाबदार कार्यकर्ता / नेमणूक</label>
            <input
              type="text"
              value={form.assignedToName}
              onChange={(e) => setForm({ ...form, assignedToName: e.target.value })}
              className="form-input"
              placeholder="उदा. श्री. ओंकार गायकवाड"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setCreateModal(false)} className="btn btn-ghost">रद्द करा</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'नेमणूक होत आहे...' : 'काम सोपवा'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
