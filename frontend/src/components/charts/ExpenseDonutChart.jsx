import React from 'react';

const COLORS = ['#800000', '#E65100', '#D4AF37', '#2563EB', '#16A34A', '#9333EA', '#EC4899', '#6B7280'];

const ExpenseDonutChart = ({ categories = [] }) => {
  const totalExpense = categories.reduce((sum, item) => sum + (item.amount || 0), 0);

  if (!categories || categories.length === 0 || totalExpense === 0) {
    return (
      <div className="chart-card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7E5E4' }}>
        <div className="chart-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h4 className="chart-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1917' }}>
              💸 खर्च वर्गीकरण (Expense Distribution)
            </h4>
            <span className="chart-subtitle" style={{ fontSize: '0.8rem', color: '#78716C' }}>
              प्रवर्गानिहाय खर्च विश्लेषण
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#FAF8F5', borderRadius: '12px', border: '1px dashed #E7E5E4' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>💸</div>
          <p style={{ color: '#57534E', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
            या उत्सवात अद्याप कोणताही खर्च झालेला नाही (₹०)
          </p>
          <span style={{ color: '#A8A29E', fontSize: '0.8rem' }}>
            नवीन खर्च नोंदवताच त्याचे प्रवर्गानिहाय विश्लेषण येथे दिसेल.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">खर्च वर्गीकरण (Expense Distribution)</h4>
          <span className="chart-subtitle">एकूण खर्च: ₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="progress-list" style={{ marginTop: '0.5rem' }}>
        {categories.slice(0, 6).map((cat, idx) => {
          const color = COLORS[idx % COLORS.length];
          const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;

          return (
            <div key={cat.category} className="progress-row-item">
              <div className="progress-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="legend-color-dot" style={{ background: color }}></span>
                  {cat.category} ({cat.count} नोंदी)
                </span>
                <span>₹{cat.amount.toLocaleString('en-IN')} ({pct}%)</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseDonutChart;
