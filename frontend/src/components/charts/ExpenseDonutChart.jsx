import React from 'react';

const COLORS = ['#800000', '#E65100', '#D4AF37', '#2563EB', '#16A34A', '#9333EA', '#EC4899', '#6B7280'];

const ExpenseDonutChart = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">खर्च वर्गीकरण (Expense Categories)</h4>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
          खर्च नोंदी उपलब्ध नाहीत
        </p>
      </div>
    );
  }

  const totalExpense = categories.reduce((sum, item) => sum + (item.amount || 0), 0);

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
