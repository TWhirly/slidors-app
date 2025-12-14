// FilterModal.jsx
import React, { useState } from 'react';
import styles from '../Activity/FilterModal.module.css';

export const CompaniesFilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  avialableTypes,
  avialableRegions,
  avialableStatuses,
  avialableManagers,
  avialableCities,
  avialableHandle
}) => {

  if (!isOpen) return null;

  const updateFilter = (key, value) => {
    console.log('filters', filters)
    console.log(value)
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    localStorage.setItem('companyFilters', JSON.stringify(newFilters));
  };

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

          {/* Проработка */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Проработка</label>
            <div className={styles.checkboxList}>
              {avialableHandle.map((handled, index) => (
                <label key={handled} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={index === 0 ? filters.handled : !filters.handled}
                    onChange={(e) => {
                     
                      updateFilter('handled', !!!handled);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{handled}</span>
                </label>
              ))}
            </div>
          </div>

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

          {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Компания</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => updateFilter('name', e.target.value)}
              placeholder="Введите название или часть названия компании..."
              className={styles.textInput}
            />
          </div>

          {/* Тип */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Типы</label>
            <div className={styles.checkboxList}>
              {avialableTypes.map(type => (
                <label key={type} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.type, type]
                        : filters.type.filter(c => c !== type);
                      updateFilter('type', newTypes);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{type}</span>
                </label>
              ))}
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};