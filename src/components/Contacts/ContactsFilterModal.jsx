// FilterModal.jsx
import React, { useState } from 'react';
import styles from '../Activity/FilterModal.module.css';

export const ContactsFilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  avialablePositions,
  avialableRegions,
}) => {

  if (!isOpen) return null;

  const updateFilter = (key, value) => {
    console.log('filters', filters)
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    localStorage.setItem('eventFilters', JSON.stringify(newFilters));
  };
  console.log('avialableRegions', avialableRegions)

  return (
    <div className={styles.mainContainer}>
      <div className={styles.modalContent}>
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

          {/* Регион */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Регионы</label>
            <div className={styles.checkboxList}>
              {avialableRegions.map(region => (
                <label key={region} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.region.includes(region)}
                    onChange={(e) => {
                      const newRegions = e.target.checked
                        ? [...filters.region, region]
                        : filters.region.filter(c => c !== region);
                      updateFilter('region', newRegions);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{region}</span>
                </label>
              ))}
            </div>
          </div>


          {/* Менеджер */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Сфера нашего внимания</label>
            <div className={styles.checkboxList}>

              <label key={"nvp"} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={filters.nvp}
                  onChange={(e) => {

                    updateFilter('nvp', !filters.nvp);
                  }}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxLabel}>{'Сфера нашего внимания'}</span>
              </label>

            </div>
          </div>

          {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Компания</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => updateFilter('company', e.target.value)}
              placeholder="Введите название или часть названия компании..."
              className={styles.textInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};