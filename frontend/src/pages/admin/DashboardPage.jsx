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
  const { config, activeFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  // Quick Action Modal State
  const [showQR, setShowQR] = useState(false);
  const [quickReceiptModal, setQuickReceiptModal] = useState(false);
  const [quickExpenseModal, setQuickExpenseModal] = useState(false);
  
  const [receiptForm, setReceiptForm] = useState({
    donorName: '',
    donorMobile: '',
    donorAddress: '',
    amount: '',
    paymentMode: 'cash',
    category: 'वर्गणी',
    notes: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    category: 'मूर्ती व सजावट',
    amount: '',
    vendor: '',
    description: '',
    billNumber: '',
    paymentMode: 'cash'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  const fetchDashboard = async () => {
    try {
      const year = activeFestival?.festivalYear || config.festivalYear || 2026;
      const res = await api.get(`/dashboard/summary?year=${year}`);
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
  }, [activeFestival]);

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!receiptForm.donorName || !receiptForm.donorMobile || !receiptForm.amount) {
      showError('कृपया नाव, मोबाईल आणि रक्कम प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...receiptForm,
        festivalYear: activeFestival?.festivalYear || 2026
      };
      const res = await api.post('/receipts', payload);
      if (res.success && res.receipt) {
        showSuccess(res.message);
        setCreatedReceipt(res.receipt);
        setReceiptForm({ donorName: '', donorMobile: '', donorAddress: '', amount: '', paymentMode: 'cash', category: 'वर्गणी', notes: '' });
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
      const payload = {
        ...expenseForm,
        festivalYear: activeFestival?.festivalYear || 2026
      };
      const res = await api.post('/expenses', payload);
      if (res.success) {
        showSuccess(res.message);
        setQuickExpenseModal(false);
        setExpenseForm({ category: 'मूर्ती व सजावट', amount: '', vendor: '', description: '', billNumber: '', paymentMode: 'cash' });
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Skeleton height="140px" borderRadius="18px" className="mb-4" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Skeleton height="85px" borderRadius="14px" />
          <Skeleton height="85px" borderRadius="14px" />
          <Skeleton height="85px" borderRadius="14px" />
        </div>
        <Skeleton height="250px" borderRadius="18px" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentReceipts = data?.recentReceipts || [];
  const pendingTasks = data?.pendingTasks || [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* 1. BALANCE HERO CARD (Matching Screenshot 4) */}
      <div className="balance-hero-card">
        <div className="balance-card-header">
          <span>या उत्सवाची शिल्लक · {activeFestival?.financialYear || summary.financialYear || '2026-27'}</span>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="balance-eye-btn"
            title={hideBalance ? 'रक्कम दाखवा' : 'रक्कम लपवा'}
          >
            {hideBalance ? '🙈' : '👁️'}
          </button>
        </div>

        <div className="balance-card-amount">
          ₹ {hideBalance ? '••••••' : summary.currentBalance?.toLocaleString('en-IN') || 0}
        </div>

        <div className="balance-stat-row">
          <div className="balance-stat-chip income">
            <span style={{ fontSize: '1rem' }}>↗</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#FED7AA' }}>एकूण जमा</div>
              <span>₹ {hideBalance ? '••••' : summary.totalIncome?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>

          <div className="balance-stat-chip expense">
            <span style={{ fontSize: '1rem' }}>↘</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#FED7AA' }}>एकूण खर्च</div>
              <span>₹ {hideBalance ? '••••' : summary.totalExpenses?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Quick Action Buttons */}
      <div className="desktop-only" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {hasRole(['super_admin', 'treasurer', 'receipt_manager']) && (
          <button onClick={() => { setCreatedReceipt(null); setQuickReceiptModal(true); }} className="btn btn-action-green" style={{ flex: 1, padding: '0.85rem' }}>
            <span>➕</span> नवीन वर्गणी / पावती
          </button>
        )}
        {hasRole(['super_admin', 'treasurer']) && (
          <button onClick={() => setQuickExpenseModal(true)} className="btn btn-action-red" style={{ flex: 1, padding: '0.85rem' }}>
            <span>💸</span> नवीन खर्च नोंदवा
          </button>
        )}
        <button onClick={() => setShowQR(true)} className="btn btn-outline" style={{ background: '#FFFFFF' }}>
          📱 बँक QR कोड
        </button>
        <Link to="/admin/transactions" className="btn btn-outline" style={{ background: '#FFFFFF' }}>
          📋 सर्व नोंदी
        </Link>
      </div>

      {/* 2. RECENT TRANSACTIONS FEED (अलिकडील नोंदी) (Matching Screenshot 4) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>अलिकडील नोंदी</h3>
          <Link to="/admin/transactions" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EA580C', textDecoration: 'none' }}>
            सर्व पहा ({summary.receiptCount || recentReceipts.length}) →
          </Link>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="amgm-card" style={{ padding: '2rem', textAlign: 'center', color: '#78716C' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <p style={{ fontWeight: 600 }}>या उत्सवात अजून कोणतीही नोंद नाही.</p>
          </div>
        ) : (
          <div>
            {recentReceipts.map((r) => (
              <div key={r.id || r._id} className="txn-card-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div className="txn-icon-box income">
                    🤝
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '0.95rem' }}>
                      {r.donorName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>वर्गणी</span>
                      <span>•</span>
                      <span>{String(r.createdAt || '').slice(0, 10)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="txn-amt-positive">
                    +₹{r.amount?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#78716C', textAlign: 'right', textTransform: 'uppercase' }}>
                    {r.paymentMode || 'रोख'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ANALYTICS CHARTS (Desktop & Tablet) */}
      {!isVolunteer && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <IncomeExpenseBarChart monthlyTrend={summary.monthlyTrend || []} />
          <ExpenseDonutChart categories={summary.expenseByCategory || []} />
        </div>
      )}

      {/* 4. WORKER TASKS SECTION */}
      {pendingTasks.length > 0 && (
        <div className="amgm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ✅ माझी महत्त्वाची कामे ({pendingTasks.length})
            </h3>
            <Link to="/admin/tasks" style={{ fontSize: '0.82rem', color: '#EA580C', fontWeight: 700, textDecoration: 'none' }}>
              सर्व कामे पहा →
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {pendingTasks.map((t) => (
              <div key={t.id || t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#FAFAF9', borderRadius: '10px', border: '1px solid #E7E5E4' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#292524' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#78716C' }}>मुदत: {t.dueDate} • {t.assignedToName}</div>
                </div>
                <button
                  onClick={() => handleTaskStatusUpdate(t.id || t._id, 'Completed')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', color: '#16A34A', borderColor: '#16A34A' }}
                >
                  पूर्ण झाले ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. STICKY MOBILE FLOATING ACTION BAR (+ जमा, - खर्च) (Matching Screenshot 4) */}
      <div className="sticky-action-bar">
        {hasRole(['super_admin', 'treasurer', 'receipt_manager']) ? (
          <button
            onClick={() => { setCreatedReceipt(null); setQuickReceiptModal(true); }}
            className="btn-action-green"
          >
            <span>+</span> जमा
          </button>
        ) : <div />}

        {hasRole(['super_admin', 'treasurer']) ? (
          <button
            onClick={() => setQuickExpenseModal(true)}
            className="btn-action-red"
          >
            <span>-</span> खर्च
          </button>
        ) : <div />}
      </div>

      {/* QUICK RECEIPT MODAL */}
      <Modal
        isOpen={quickReceiptModal}
        onClose={() => { setQuickReceiptModal(false); setCreatedReceipt(null); }}
        title="➕ नवीन वर्गणी जमा / डिजिटल पावती"
        size="md"
      >
        {createdReceipt ? (
          <PrintableReceipt
            receipt={createdReceipt}
            mandal={config}
            onClose={() => { setQuickReceiptModal(false); setCreatedReceipt(null); }}
          />
        ) : (
          <form onSubmit={handleCreateReceipt}>
            <div className="form-group mb-3">
              <label className="form-label">देणगीदाराचे पूर्ण नाव (Full Name) *</label>
              <input
                type="text"
                required
                value={receiptForm.donorName}
                onChange={(e) => setReceiptForm({ ...receiptForm, donorName: e.target.value })}
                className="form-input"
                placeholder="उदा. श्री. राहुल सचिन पाटील"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group mb-3">
                <label className="form-label">मोबाईल नंबर (Mobile) *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  value={receiptForm.donorMobile}
                  onChange={(e) => setReceiptForm({ ...receiptForm, donorMobile: e.target.value })}
                  className="form-input"
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">रक्कम (Amount ₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  inputMode="numeric"
                  value={receiptForm.amount}
                  onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                  className="form-input"
                  placeholder="501"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group mb-3">
                <label className="form-label">भरणा प्रकार (Payment Mode)</label>
                <select
                  value={receiptForm.paymentMode}
                  onChange={(e) => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}
                  className="form-input"
                >
                  <option value="cash">रोख (Cash)</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="gpay">Google Pay</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="cheque">धनादेश (Cheque)</option>
                  <option value="other">इतर</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">प्रवर्ग (Category)</label>
                <select
                  value={receiptForm.category}
                  onChange={(e) => setReceiptForm({ ...receiptForm, category: e.target.value })}
                  className="form-input"
                >
                  <option value="वर्गणी">वर्गणी (Vargani)</option>
                  <option value="विशेष देणगी">विशेष देणगी (Special Donation)</option>
                  <option value="जाहिरात / स्पॉन्सर">जाहिरात / स्पॉन्सर</option>
                  <option value="प्रसाद देणगी">प्रसाद देणगी</option>
                  <option value="महाप्रसाद निधी">महाप्रसाद निधी</option>
                  <option value="इतर">इतर</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">पत्ता / वस्ती (Address)</label>
              <input
                type="text"
                value={receiptForm.donorAddress}
                onChange={(e) => setReceiptForm({ ...receiptForm, donorAddress: e.target.value })}
                className="form-input"
                placeholder="उदा. शनिवार पेठ, पुणे"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" onClick={() => setQuickReceiptModal(false)} className="btn btn-ghost">
                रद्द करा
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'तयार होत आहे...' : '🧾 पावती तयार करा व जतन करा'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* QUICK EXPENSE MODAL */}
      <Modal
        isOpen={quickExpenseModal}
        onClose={() => setQuickExpenseModal(false)}
        title="💸 नवीन खर्च नोंदवा"
        size="md"
      >
        <form onSubmit={handleCreateExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group mb-3">
              <label className="form-label">खर्च प्रवर्ग (Category) *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="form-input"
              >
                <option value="मूर्ती व सजावट">मूर्ती व सजावट</option>
                <option value="मंडप व स्टेज">मंडप व स्टेज</option>
                <option value="Sound / DJ">Sound / DJ</option>
                <option value="Light व रोषणाई">Light व रोषणाई</option>
                <option value="प्रसाद व महाप्रसाद">प्रसाद व महाप्रसाद</option>
                <option value="पूजा साहित्य">पूजा साहित्य</option>
                <option value="वाहतूक व टेम्पो">वाहतूक व टेम्पो</option>
                <option value="सुरक्षा व स्वयंसेवक">सुरक्षा व स्वयंसेवक</option>
                <option value="Printing व पावत्या">Printing व पावत्या</option>
                <option value="सांस्कृतिक कार्यक्रम">सांस्कृतिक कार्यक्रम</option>
                <option value="इतर किरकोळ खर्च">इतर किरकोळ खर्च</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">खर्च रक्कम (Amount ₹) *</label>
              <input
                type="number"
                required
                min="1"
                inputMode="numeric"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="form-input"
                placeholder="2500"
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">खर्चाचा तपशील (Description) *</label>
            <input
              type="text"
              required
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="form-input"
              placeholder="उदा. मंडप सजावट कामगार मजुरी व साहित्य"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group mb-3">
              <label className="form-label">विक्रेता / कारागीर (Vendor)</label>
              <input
                type="text"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="form-input"
                placeholder="उदा. ओंकार डेकोरेटर्स"
              />
            </div>

            <div className="form-group mb-3">
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

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setQuickExpenseModal(false)} className="btn btn-ghost">
              रद्द करा
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'नोंद होत आहे...' : '💸 खर्च जतन करा'}
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
