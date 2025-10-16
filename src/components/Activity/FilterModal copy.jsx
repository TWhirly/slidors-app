// FilterModal.jsx
import React, { useState } from 'react';
import styles from './FilterModal.module.css';

export const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableStatuses,
  availablePurposes,
  availableRegions
}) => {
  const [touchStart, setTouchStart] = useState(null);

  if (!isOpen) return null;

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const diff = touch.clientY - touchStart.y;

    if (diff > 100) {
      onClose();
    }
    setTouchStart(null);
  };

  return (
    <div className={styles.mainContainer}>
      <div
        className={styles.modalContent}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Индикатор свайпа */}
        <div className={styles.swipeIndicator}>
          <div className={styles.swipeLine} />
        </div>

        {/* Заголовок */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2 className={styles.title}>Фильтры</h2>
            <button onClick={onClose} className={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>

        {/* Содержимое фильтра */}
        <div className={styles.filtersContent}>
          {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Поиск</label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              placeholder="Введите название компании..."
              className={styles.textInput}
            />
          </div>

          {/* Выбор статусов */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Статусы</label>
            <div className={styles.checkboxList}>
              {availableStatuses.map(status => (
                <label key={status} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      const newStatuses = e.target.checked
                        ? [...filters.status, status]
                        : filters.status.filter(c => c !== status);
                      updateFilter('status', newStatuses);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Выбор целей */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Цели</label>
            
            {/* Выбранные цели */}
            <div className={styles.selectedTags}>
              {filters.purpose.map(purpose => (
                <span key={purpose} className={styles.tag}>
                  {purpose}
                  <button
                    onClick={() => updateFilter('purpose', filters.purpose.filter(t => t !== purpose))}
                    className={styles.removeTagButton}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {filters.purpose.length === 0 && (
                <span className={styles.noTags}>Цели не выбраны</span>
              )}
            </div>
            
            {/* Выбор целей */}
            <select
              multiple
              value={filters.purpose}
              onChange={(e) => {
                const selectedPurposes = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter('purpose', selectedPurposes);
              }}
              className={styles.multiSelect}
              size={4}
            >
              {availablePurposes.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
            <div className={styles.selectHint}>
              Для множественного выбора удерживайте Ctrl (или нажмите и удерживайте на мобильном)
            </div>
          </div>

          {/* Фильтр по дате */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Период</label>
            <div className={styles.dateGrid}>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value
                  })}
                  className={styles.dateInput}
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value
                  })}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className={styles.actions}>
          <button
            onClick={() => {
              onFiltersChange({
                searchText: '',
                purpose: [],
                status: [],
                tags: [],
                region: [],
                dateRange: { from: '', to: '' }
              });
            }}
            className={`${styles.actionButton} ${styles.resetButton}`}
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className={`${styles.actionButton} ${styles.applyButton}`}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};