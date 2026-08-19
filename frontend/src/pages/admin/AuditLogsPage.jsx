import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const AuditLogsPage = () => {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/audit-logs?page=${page}&limit=25`);
      if (res.success) {
        setLogs(res.logs);
        setPagination(res.pagination);
      }
    } catch (e) {
      showError('ऑडिट लॉग्स लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>
          🛡️ सुरक्षा व ऑडिट लॉग्स (Security Audit Trail)
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          प्रणालीतील प्रत्येक महत्त्वाच्या कृतीची, लॉगिनची व आर्थिक नोंदीची कायमस्वरूपी नोंद.
        </p>
      </div>

      {loading ? (
        <Skeleton height="350px" />
      ) : logs.length === 0 ? (
        <EmptyState title="कोणतेही ऑडिट रेकॉर्ड आढळले नाही" />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>वेळ (Timestamp)</th>
                <th>वापरकर्ता (User)</th>
                <th>भूमिका (Role)</th>
                <th>कृती (Action)</th>
                <th>लक्ष्य प्रकार (Target)</th>
                <th>तपशील (Details)</th>
                <th>IP पत्ता</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id || log._id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('mr-IN')}
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.userName || log.username}</td>
                  <td><span className="badge badge-primary">{log.userRole}</span></td>
                  <td>
                    <span className={`badge ${
                      log.action.includes('CANCEL') ? 'badge-error' :
                      log.action.includes('CREATED') || log.action.includes('ADDED') ? 'badge-success' : 'badge-info'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.targetType}</td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '280px', wordBreak: 'break-word' }}>
                    {JSON.stringify(log.details || {})}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <span>पृष्ठ {pagination.page} / {pagination.pages} (एकूण {pagination.total} नोंदी)</span>
            <div className="pagination-controls">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="pagination-btn">
                ← मागील
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="pagination-btn">
                पुढील →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
