import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';

const ReportsPage = () => {
  const { config, activeFestival } = useConfig();
  const { showError } = useToast();

  const [period, setPeriod] = useState('month'); // today, 7days, 30days, month, custom
  const [groupBy, setGroupBy] = useState('head'); // head, worker, mode
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const year = activeFestival?.festivalYear || 2026;
      const res = await api.get(`/reports/financial?year=${year}&period=${period}`);
      if (res.success) {
        setReportData(res.summary);
      }
    } catch (err) {
      showError('अहवाल लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period, activeFestival]);

  const handleDownloadPDF = () => {
    const year = activeFestival?.festivalYear || 2026;
    window.open(`/api/reports/download-pdf?year=${year}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const year = activeFestival?.festivalYear || 2026;
    window.open(`/api/reports/export-csv?year=${year}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER & EXPORT ACTIONS (Matching Screenshot 4 bottom left) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            अहवाल · {activeFestival?.name || 'गणेशोत्सव'}
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
            आर्थिक वर्ष {activeFestival?.financialYear || '2026-27'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleDownloadPDF} className="btn btn-outline btn-sm">
            <span>📥</span> PDF अहवाल
          </button>
          <button onClick={handleDownloadCSV} className="btn btn-outline btn-sm">
            <span>📊</span> CSV Export
          </button>
          <button onClick={() => window.print()} className="btn btn-outline btn-sm desktop-only">
            <span>🖨️</span> प्रिंट
          </button>
        </div>
      </div>

      {/* 2. TIME PERIOD SELECTOR (Matching Screenshot 4 bottom left) */}
      <div className="search-chip-bar">
        <button
          className={`filter-chip ${period === 'today' ? 'active' : ''}`}
          onClick={() => setPeriod('today')}
        >
          आज (Today)
        </button>
        <button
          className={`filter-chip ${period === '7days' ? 'active' : ''}`}
          onClick={() => setPeriod('7days')}
        >
          शेवटचे ७ दिवस
        </button>
        <button
          className={`filter-chip ${period === '30days' ? 'active' : ''}`}
          onClick={() => setPeriod('30days')}
        >
          शेवटचे ३० दिवस
        </button>
        <button
          className={`filter-chip ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          हा महिना
        </button>
        <button
          className={`filter-chip ${period === 'custom' ? 'active' : ''}`}
          onClick={() => setFilterModalOpen(true)}
        >
          ⚙️ सानुकूल (Filter)
        </button>
      </div>

      {/* 3. SUMMARY ROW (जमा, खर्च, शिल्लक) (Matching Screenshot 4 bottom left) */}
      {loading ? (
        <Skeleton height="140px" borderRadius="16px" className="mb-4" />
      ) : (
        <div className="amgm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F5F5F4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#16A34A', fontSize: '1.2rem', fontWeight: 900 }}>↗</span>
              <span style={{ fontWeight: 700, color: '#292524' }}>जमा (Income)</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#16A34A' }}>
              ₹ {reportData?.totalIncome?.toLocaleString('en-IN') || 0}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F5F5F4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#DC2626', fontSize: '1.2rem', fontWeight: 900 }}>↘</span>
              <span style={{ fontWeight: 700, color: '#292524' }}>खर्च (Expense)</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#DC2626' }}>
              ₹ {reportData?.totalExpenses?.toLocaleString('en-IN') || 0}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0 0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#2563EB', fontSize: '1.1rem', fontWeight: 900 }}>🏦</span>
              <span style={{ fontWeight: 800, color: '#1C1917' }}>शिल्लक (Net Balance)</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#2563EB' }}>
              ₹ {reportData?.currentBalance?.toLocaleString('en-IN') || 0}
            </div>
          </div>
        </div>
      )}

      {/* 4. GROUPING TABS (हेडप्रमाणे, कार्यकर्ते, मोडप्रमाणे) (Matching Screenshot 4) */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E7E5E4', marginBottom: '1.25rem', background: '#FFFFFF', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <button
          onClick={() => setGroupBy('head')}
          style={{
            flex: 1,
            padding: '0.85rem 0.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: groupBy === 'head' ? '3px solid #C2410C' : '3px solid transparent',
            color: groupBy === 'head' ? '#C2410C' : '#78716C',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          हेडप्रमाणे (Head-wise)
        </button>

        <button
          onClick={() => setGroupBy('worker')}
          style={{
            flex: 1,
            padding: '0.85rem 0.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: groupBy === 'worker' ? '3px solid #C2410C' : '3px solid transparent',
            color: groupBy === 'worker' ? '#C2410C' : '#78716C',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          कार्यकर्ते (Worker-wise)
        </button>

        <button
          onClick={() => setGroupBy('mode')}
          style={{
            flex: 1,
            padding: '0.85rem 0.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: groupBy === 'mode' ? '3px solid #C2410C' : '3px solid transparent',
            color: groupBy === 'mode' ? '#C2410C' : '#78716C',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          मोडप्रमाणे (Mode-wise)
        </button>
      </div>

      {/* 5. GROUPED DATA TABLES / CARDS */}
      {loading ? (
        <Skeleton height="200px" borderRadius="14px" />
      ) : (
        <div>
          {groupBy === 'head' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Income Categories */}
              <div className="amgm-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.75rem', borderBottom: '1px solid #E7E5E4', paddingBottom: '0.4rem' }}>
                  📥 जमा प्रवर्ग (Income Heads)
                </h4>
                {reportData?.incomeByCategory?.length === 0 ? (
                  <p style={{ color: '#78716C', fontSize: '0.85rem' }}>अजून कोणतीही नोंद नाही.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {reportData?.incomeByCategory?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px solid #F5F5F4' }}>
                        <span>{item.category} ({item.count} नोंदी)</span>
                        <strong style={{ color: '#16A34A' }}>₹ {item.amount.toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expense Categories */}
              <div className="amgm-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#DC2626', marginBottom: '0.75rem', borderBottom: '1px solid #E7E5E4', paddingBottom: '0.4rem' }}>
                  📤 खर्च प्रवर्ग (Expense Heads)
                </h4>
                {reportData?.expenseByCategory?.length === 0 ? (
                  <p style={{ color: '#78716C', fontSize: '0.85rem' }}>अजून कोणताही खर्च नाही.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {reportData?.expenseByCategory?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px solid #F5F5F4' }}>
                        <span>{item.category} ({item.count} नोंदी)</span>
                        <strong style={{ color: '#DC2626' }}>₹ {item.amount.toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {groupBy === 'worker' && (
            <div className="amgm-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#C2410C', marginBottom: '0.75rem' }}>
                👥 कार्यकर्तानिहाय वर्गणी संकलन (Worker-wise Collection)
              </h4>
              {reportData?.workerWiseCollection?.length === 0 ? (
                <p style={{ color: '#78716C', fontSize: '0.85rem' }}>अजून कोणतीही नोंद नाही.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {reportData?.workerWiseCollection?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#FAFAF9', borderRadius: '10px', border: '1px solid #E7E5E4' }}>
                      <div>
                        <strong style={{ color: '#1C1917' }}>{item.workerName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{item.count} पावत्या संकलित</div>
                      </div>
                      <div style={{ color: '#16A34A', fontWeight: 800, fontSize: '1.05rem' }}>
                        ₹ {item.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {groupBy === 'mode' && (
            <div className="amgm-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#C2410C', marginBottom: '0.75rem' }}>
                💳 भरणा प्रकारनिहाय वर्गीकरण (Payment Mode-wise)
              </h4>
              {reportData?.paymentModeDistribution?.length === 0 ? (
                <p style={{ color: '#78716C', fontSize: '0.85rem' }}>अजून कोणतीही नोंद नाही.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {reportData?.paymentModeDistribution?.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: '#FAFAF9', borderRadius: '12px', border: '1px solid #E7E5E4', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {item.mode}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1917' }}>
                        ₹ {item.amount.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>
                        {item.count} नोंदी
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FILTER BOTTOM SHEET MODAL (Matching Screenshot 4 bottom right) */}
      <Modal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="🔍 सानुकूल अहवाल फिल्टर (Filter Report)"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">प्रकार निवडा</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="filter-chip active">सर्व</button>
              <button className="filter-chip">जमा</button>
              <button className="filter-chip">खर्च</button>
            </div>
          </div>

          <div>
            <label className="form-label">पेमेंट प्रकार</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="filter-chip">CASH</button>
              <button className="filter-chip">UPI</button>
              <button className="filter-chip">CHEQUE</button>
              <button className="filter-chip">NEFT</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setFilterModalOpen(false)} className="btn btn-ghost">
              सर्व काढा
            </button>
            <button onClick={() => { setFilterModalOpen(false); fetchReports(); }} className="btn btn-primary">
              अहवाल दाखवा
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ReportsPage;
