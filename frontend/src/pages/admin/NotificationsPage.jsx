import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { config, activeFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      // Fetch pending tasks and announcements
      const res = await api.get(`/dashboard/summary?year=${year}`);
      if (res.success) {
        const items = [];
        
        // Add pending tasks
        (res.pendingTasks || []).forEach((t) => {
          items.push({
            id: `task-${t.id || t._id}`,
            type: 'task',
            title: t.title,
            desc: `मुदत: ${t.dueDate} • सोपवले: ${t.assignedToName}`,
            link: '/admin/tasks',
            actionLabel: 'काम पूर्ण करा'
          });
        });

        // Add announcements
        (res.recentAnnouncements || []).forEach((a) => {
          items.push({
            id: `ann-${a.id || a._id}`,
            type: 'announcement',
            title: `📢 ${a.title}`,
            desc: a.message,
            link: '/admin/announcements',
            actionLabel: 'पहा'
          });
        });

        setNotifications(items);
      }
    } catch (err) {
      showError('सूचना लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeFestival]);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917' }}>सूचना</h2>
        <span style={{ fontSize: '0.85rem', color: '#78716C' }}>तुमचं लक्ष हवं आहे</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="70px" borderRadius="14px" />
          <Skeleton height="70px" borderRadius="14px" />
        </div>
      ) : notifications.length === 0 ? (
        /* CLEAN EMPTY STATE (Matching Screenshot 5) */
        <div className="notification-empty-container">
          <div className="check-green-circle">
            ✓
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1C1917', marginBottom: '0.4rem' }}>
            काहीही बाकी नाही
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#78716C', maxWidth: '320px', lineHeight: 1.5 }}>
            तुमचा निर्णय हवा असेल असं काही असेल तर ते इथे दिसेल.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div key={n.id} className="txn-card-item" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="txn-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                  🔔
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '0.95rem' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {n.desc}
                  </div>
                </div>
              </div>

              <Link to={n.link} className="btn btn-outline btn-sm">
                {n.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
