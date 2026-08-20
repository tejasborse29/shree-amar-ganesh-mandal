import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';

const FestivalModal = ({ isOpen, onClose }) => {
  const { festivals, activeFestival, switchActiveFestival, createNewFestival } = useConfig();
  const { showSuccess, showError } = useToast();

  const [selectedFestival, setSelectedFestival] = useState(activeFestival?.name || 'गणेशोत्सव');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFestName, setNewFestName] = useState('');
  const [newFestYear, setNewFestYear] = useState('2026-27');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelect = async (f) => {
    setSelectedFestival(f.name);
    try {
      const res = await switchActiveFestival(f);
      if (res?.message) {
        showSuccess(res.message);
      }
    } catch (e) {
      showError('उत्सव बदलताना त्रुटी आली');
    }
  };

  const handleAddFestival = async (e) => {
    e.preventDefault();
    if (!newFestName.trim()) {
      showError('कृपया उत्सवाचे नाव प्रविष्ट करा');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createNewFestival({
        name: newFestName.trim(),
        financialYear: newFestYear.trim(),
        festivalYear: parseInt(newFestYear.split('-')[0]) || 2026
      });
      if (res?.success) {
        showSuccess(`'${newFestName}' उत्सव यशस्वीपणे जोडला गेला!`);
        setShowAddForm(false);
        setNewFestName('');
      }
    } catch (err) {
      showError(err.message || 'उत्सव जोडता आला नाही');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-drag-handle"></div>

        {/* Header */}
        <div className="bottom-sheet-header">
          <h3 className="bottom-sheet-title">
            कोणता उत्सव सुरू आहे? <span className="help-icon" title="सुरू असलेल्या उत्सवाची माहिती">❓</span>
          </h3>
          <p className="bottom-sheet-subtext">
            सुरू असलेला उत्सव निवडा. नवीन नोंदी प्रत्येक सदस्याच्या फोनवर त्याच उत्सवाखाली होतील, आणि स्क्रीनवर तोच उत्सव दिसेल. सगळं एकत्र पाहायचं असेल तरच "सर्व उत्सव" निवडा — त्याने नोंदी कुठे होतात ते बदलत नाही.
          </p>
        </div>

        {/* Festival Options List */}
        <div className="festival-list-container">
          <div
            className={`festival-select-card ${selectedFestival === 'सर्व उत्सव' ? 'selected' : ''}`}
            onClick={() => handleSelect({ name: 'सर्व उत्सव', financialYear: 'सर्व वर्ष' })}
          >
            <span className="festival-card-name">सर्व उत्सव (All Festivals)</span>
            {selectedFestival === 'सर्व उत्सव' && <span className="check-icon">✓</span>}
          </div>

          {festivals.map((f) => {
            const isCurrent = (activeFestival?.name === f.name) || (selectedFestival === f.name);
            return (
              <div
                key={f.id || f._id || f.name}
                className={`festival-select-card ${isCurrent ? 'selected' : ''}`}
                onClick={() => handleSelect(f)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="festival-card-name">{f.name}</span>
                  {f.financialYear && (
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>({f.financialYear})</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isCurrent && <span className="active-badge-tag">सुरू</span>}
                  {isCurrent && <span className="check-icon">✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Indicator Footer Bar */}
        <div className="active-fest-notice">
          <span>नवीन नोंदी: <strong>{activeFestival?.name || 'गणेशोत्सव'}</strong></span>
        </div>

        {/* Add New Festival Drawer / Form */}
        {showAddForm ? (
          <form onSubmit={handleAddFestival} className="add-fest-form">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              + नवीन उत्सव जोडा
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={newFestName}
                onChange={(e) => setNewFestName(e.target.value)}
                placeholder="उदा. माघी गणेशोत्सव"
                className="form-input"
                autoFocus
              />
              <input
                type="text"
                value={newFestYear}
                onChange={(e) => setNewFestYear(e.target.value)}
                placeholder="2026-27"
                className="form-input"
                style={{ maxWidth: '100px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">
                रद्द करा
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? 'जोडत आहे...' : 'जोडा'}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="btn-add-festival-trigger">
            + नवीन उत्सव सुरू करा
          </button>
        )}

        {/* Done Action */}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
            झालं
          </button>
        </div>

      </div>
    </div>
  );
};

export default FestivalModal;
