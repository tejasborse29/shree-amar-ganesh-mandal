import React, { useState } from 'react';

const IncomeExpenseBarChart = ({ monthlyTrend = [] }) => {
  const [hovered, setHovered] = useState(null);

  if (!monthlyTrend || monthlyTrend.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h4 className="chart-title">मासिक जमा विरुद्ध खर्च (Income vs Expense)</h4>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
          डेटा उपलब्ध नाही
        </p>
      </div>
    );
  }

  const maxVal = Math.max(
    ...monthlyTrend.map((d) => Math.max(d.income || 0, d.expense || 0)),
    10000
  );

  const chartHeight = 180;
  const barWidth = 24;
  const groupWidth = 80;
  const svgWidth = Math.max(monthlyTrend.length * groupWidth + 40, 360);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">मासिक जमा विरुद्ध खर्च (Monthly Trend)</h4>
          <span className="chart-subtitle">उत्सवाची आर्थिक स्थिती</span>
        </div>
      </div>

      <div className="chart-svg-wrapper" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={chartHeight + 40} viewBox={`0 0 ${svgWidth} ${chartHeight + 40}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - pct * chartHeight + 10;
            return (
              <g key={i}>
                <line x1="30" y1={y} x2={svgWidth - 10} y2={y} stroke="#E5E7EB" strokeDasharray="3 3" />
                <text x="25" y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">
                  ₹{Math.round((pct * maxVal) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {monthlyTrend.map((d, index) => {
            const x = 50 + index * groupWidth;
            const incHeight = (d.income / maxVal) * chartHeight;
            const expHeight = (d.expense / maxVal) * chartHeight;
            const incY = chartHeight - incHeight + 10;
            const expY = chartHeight - expHeight + 10;

            return (
              <g key={d.month}>
                {/* Income Bar (Green) */}
                <rect
                  x={x}
                  y={incY}
                  width={barWidth}
                  height={incHeight}
                  fill="#16A34A"
                  rx="4"
                  onMouseEnter={() => setHovered({ ...d, type: 'जमा (Income)', amount: d.income, x: x + 12, y: incY })}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', transition: 'height 0.3s ease' }}
                />

                {/* Expense Bar (Red) */}
                <rect
                  x={x + barWidth + 4}
                  y={expY}
                  width={barWidth}
                  height={expHeight}
                  fill="#DC2626"
                  rx="4"
                  onMouseEnter={() => setHovered({ ...d, type: 'खर्च (Expense)', amount: d.expense, x: x + barWidth + 16, y: expY })}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', transition: 'height 0.3s ease' }}
                />

                {/* Month Label */}
                <text x={x + barWidth + 2} y={chartHeight + 30} textAnchor="middle" fontSize="11" fill="#4B5563" fontWeight="600">
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            className="chart-tooltip"
            style={{ left: `${hovered.x}px`, top: `${hovered.y}px` }}
          >
            {hovered.type}: ₹{hovered.amount.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {/* Legends */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#16A34A' }}></span>
          <span>जमा (Income)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#DC2626' }}></span>
          <span>खर्च (Expense)</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseBarChart;
