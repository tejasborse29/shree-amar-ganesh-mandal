import React from 'react';

const EmptyState = ({ title = 'माहिती उपलब्ध नाही', message = 'सध्या कोणतीही नोंद आढळली नाही.', action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌺</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
