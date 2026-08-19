import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import IncomeExpenseBarChart from '../../components/charts/IncomeExpenseBarChart';
import ExpenseDonutChart from '../../components/charts/ExpenseDonutChart';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import PrintableReceipt from '../../components/common/PrintableReceipt';
import QRModal from '../../components/common/QRModal';

const DashboardPage = () => {
  const { user, hasRole, isVolunteer } = useAuth();
  const { config } = useConfig();
  const { showSuccess, showError } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal State
  const [showQR, setShowQR] = useState(false);
  const [quickReceiptModal, setQuickReceiptModal] = useState(false);
  const [quickExpenseModal, setQuickExpenseModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ donorName: '', donorMobile: '', donorAddress: '', amount: '', paymentMode: 'cash', notes: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'Decoration', amount: '', vendor: '', description: '', billNumber: '', paymentMode: 'cash' });
  const [submitting, setSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      showError('डॅशबोर्ड डेटा लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!receiptForm.donorName || !receiptForm.donorMobile || !receiptForm.amount) {
      showError('कृपया नाव, मोबाईल आणि रक्कम प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/receipts', receiptForm);
      if (res.success && res.receipt) {
        showSuccess(res.message);
        setCreatedReceipt(res.receipt);
        setReceiptForm({ donorName: '', donorMobile: '', donorAddress: '', amount: '', paymentMode: 'cash', notes: '' });
        fetchDashboard();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) {
      showError('कृपया रक्कम आणि खर्चाचा तपशील प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/expenses', expenseForm);
      if (res.success) {
        showSuccess(res.message);
        setQuickExpenseModal(false);
        setExpenseForm({ category: 'Decoration', amount: '', vendor: '', description: '', billNumber: '', paymentMode: 'cash' });
        fetchDashboard();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.success) {
        showSuccess('कामाची स्थिती अद्यतनित झाली.');
        fetchDashboard();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="100px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <Skeleton height="280px" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const pendingTasks = data?.pendingTasks || [];
  const recentReceipts = data?.recentReceipts || [];

  return (
    <div>
      {/* Welcome & Quick Actions Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFDF8, #FFF7ED)',
        border: '1.5px solid var(--color-border-gold)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            नमस्कार, {user?.name}! 🙏
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            « {config.mandalTagline} » • गणेशोत्सव {summary.festivalYear || config.festivalYear}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
            <button onClick={() => { setCreatedReceipt(null); setQuickReceiptModal(true); }} className="btn btn-primary btn-sm">
              ➕ नवीन पावती फाडा
            </button>
          )}
          {hasRole(['super_admin', 'treasurer']) && (
            <button onClick={() => setQuickExpenseModal(true)} className="btn btn-gold btn-sm">
              💸 नवीन खर्च नोंदवा
            </button>
          )}
          <button onClick={() => setShowQR(true)} className="btn btn-saffron btn-sm">
            📱 बँक QR कोड
          </button>
          <Link to="/admin/tasks" className="btn btn-outline btn-sm">
            📋 माझी कामे
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="admin-stat-grid">
        
        {/* Total Income */}
        <div className="stat-card-widget">
          <div className="stat-widget-icon income">💰</div>
          <div>
            <div className="stat-widget-val" style={{ color: '#16A34A' }}>
              ₹ {summary.totalIncome?.toLocaleString('en-IN') || 0}
            </div>
            <div className="stat-widget-lbl">एकूण जमा (Total Income)</div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="stat-card-widget">
          <div className="stat-widget-icon expense">💸</div>
          <div>
            <div className="stat-widget-val" style={{ color: '#DC2626' }}>
              ₹ {summary.totalExpenses?.toLocaleString('en-IN') || 0}
            </div>
            <div className="stat-widget-lbl">एकूण खर्च (Total Expenses)</div>
          </div>
        </div>

        {/* Balance */}
        <div className="stat-card-widget">
          <div className="stat-widget-icon balance">🏦</div>
          <div>
            <div className="stat-widget-val" style={{ color: '#2563EB' }}>
              ₹ {summary.currentBalance?.toLocaleString('en-IN') || 0}
            </div>
            <div className="stat-widget-lbl">शिल्लक रक्कम (Net Balance)</div>
          </div>
        </div>

        {/* Receipts Count */}
        <div className="stat-card-widget">
          <div className="stat-widget-icon receipt">🧾</div>
          <div>
            <div className="stat-widget-val" style={{ color: '#D97706' }}>
              {summary.receiptCount || 0}
            </div>
            <div className="stat-widget-lbl">सक्रिय पावत्या (Receipts)</div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      {!isVolunteer && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <IncomeExpenseBarChart monthlyTrend={summary.monthlyTrend || []} />
          <ExpenseDonutChart categories={summary.expenseByCategory || []} />
        </div>
      )}

      {/* Tasks & Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isVolunteer ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Pending Tasks Box */}
        <div className="amgm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
              📋 प्रलंबित कामे (Assigned Tasks)
            </h3>
            <Link to="/admin/tasks" style={{ fontSize: '0.8rem', color: 'var(--color-saffron)', fontWeight: 600 }}>
              सर्व कामे →
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
              सध्या कोणतीही प्रलंबित कामे नाहीत.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingTasks.map((t) => (
                <div
                  key={t.id || t._id}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      प्रवर्ग: {t.department} • मुदत: {t.dueDate || 'लवकरच'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`badge ${t.priority === 'Urgent' ? 'badge-error' : t.priority === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                      {t.priority}
                    </span>
                    <button
                      onClick={() => handleTaskStatusUpdate(t.id || t._id, 'Completed')}
                      className="btn btn-ghost btn-sm"
                      title="पूर्ण म्हणून चिन्हांकित करा"
                      style={{ color: '#16A34A', fontSize: '0.8rem' }}
                    >
                      ✓ पूर्ण
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Receipts Box */}
        {!isVolunteer && (
          <div className="amgm-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                🧾 नुकत्याच तयार झालेल्या पावत्या
              </h3>
              <Link to="/admin/receipts" style={{ fontSize: '0.8rem', color: 'var(--color-saffron)', fontWeight: 600 }}>
                सर्व पावत्या →
              </Link>
            </div>

            {recentReceipts.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                पावत्या उपलब्ध नाहीत.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentReceipts.map((r) => (
                  <div
                    key={r.id || r._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid #F3F4F6',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{r.receiptNumber}</span>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{r.donorName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#16A34A' }}>
                        ₹ {Number(r.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <span className={`badge ${r.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Receipt Modal */}
      <Modal isOpen={quickReceiptModal} onClose={() => setQuickReceiptModal(false)} title="नवीन डिजिटल पावती तयार करा">
        {createdReceipt ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>पावती यशस्वीपणे तयार झाली!</span>
            </div>
            <PrintableReceipt receipt={createdReceipt} />
          </div>
        ) : (
          <form onSubmit={handleCreateReceipt}>
            <div className="form-group">
              <label className="form-label">देणगीदाराचे नाव (Donor Name) *</label>
              <input
                type="text"
                value={receiptForm.donorName}
                onChange={(e) => setReceiptForm({ ...receiptForm, donorName: e.target.value })}
                className="form-input"
                placeholder="उदा. श्री. मंगेश माने"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">मोबाईल नंबर (Mobile) *</label>
                <input
                  type="tel"
                  value={receiptForm.donorMobile}
                  onChange={(e) => setReceiptForm({ ...receiptForm, donorMobile: e.target.value })}
                  className="form-input"
                  placeholder="१० अंकी मोबाईल नंबर"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">वर्गणी रक्कम (Amount ₹) *</label>
                <input
                  type="number"
                  value={receiptForm.amount}
                  onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                  className="form-input"
                  placeholder="रक्कम"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">पत्ता (Address)</label>
              <input
                type="text"
                value={receiptForm.donorAddress}
                onChange={(e) => setReceiptForm({ ...receiptForm, donorAddress: e.target.value })}
                className="form-input"
                placeholder="शनिवार पेठ, पुणे"
              />
            </div>
            <div className="form-group">
              <label className="form-label">भरणा पद्धत (Payment Mode)</label>
              <select
                value={receiptForm.paymentMode}
                onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}
                className="form-select"
              >
                <option value="cash">रोख (Cash)</option>
                <option value="online">UPI / QR कोड (Online)</option>
                <option value="netbanking">Net Banking / NEFT</option>
                <option value="cheque">धनादेश (Cheque)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">नोंद (Notes / Reference)</label>
              <input
                type="text"
                value={receiptForm.notes}
                onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                className="form-input"
                placeholder="उदा. वार्षिक गणेशोत्सव वर्गणी"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setQuickReceiptModal(false)} className="btn btn-ghost">
                रद्द करा
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'तयार होत आहे...' : '🧾 पावती तयार करा'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Quick Expense Modal */}
      <Modal isOpen={quickExpenseModal} onClose={() => setQuickExpenseModal(false)} title="नवीन खर्च नोंदवा">
        <form onSubmit={handleCreateExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">खर्च प्रवर्ग (Category) *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="form-select"
              >
                <option value="Decoration">सजावट (Decoration)</option>
                <option value="Sound">ध्वनिक्षेपक (Sound System)</option>
                <option value="Lighting">विद्युत रोषणाई (Lighting)</option>
                <option value="Puja material">पूजा साहित्य (Puja Material)</option>
                <option value="Prasad">प्रसाद व अन्नदान (Prasad)</option>
                <option value="Stage">मंडप उभारणी (Stage & Mandap)</option>
                <option value="Cultural program">सांस्कृतिक कार्यक्रम (Cultural)</option>
                <option value="Visarjan">विसर्जन मिरवणूक (Visarjan)</option>
                <option value="Social activity">सामाजिक उपक्रम (Social)</option>
                <option value="Miscellaneous">इतर किरकोळ (Miscellaneous)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">खर्च रक्कम (Amount ₹) *</label>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="form-input"
                placeholder="रक्कम"
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">खर्चाचा तपशील (Description) *</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="form-input"
              placeholder="उदा. मंडप अंतर्गत कापडी सजावट"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">दुकानदार / विक्रेता (Vendor)</label>
              <input
                type="text"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="form-input"
                placeholder="उदा. रंगोली डेकोरेटर्स"
              />
            </div>
            <div className="form-group">
              <label className="form-label">बिल क्रमांक (Bill No.)</label>
              <input
                type="text"
                value={expenseForm.billNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, billNumber: e.target.value })}
                className="form-input"
                placeholder="BILL-101"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setQuickExpenseModal(false)} className="btn btn-ghost">
              रद्द करा
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'नोंद होत आहे...' : '💸 खर्च नोंदवा'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bank QR Code Modal */}
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} />

    </div>
  );
};

export default DashboardPage;
