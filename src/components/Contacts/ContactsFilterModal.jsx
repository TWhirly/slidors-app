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
    localStorage.setItem('contactFilters', JSON.stringify(newFilters));
  };
  console.log('avialablePositions', avialablePositions)

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

           {/* СНВ */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Сфера нашего внимания</label>
            <div className={styles.checkboxList}>

              <label key={"nvp"} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={filters.snv}
                  onChange={(e) => {

                    updateFilter('snv', !filters.snv);
                  }}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxLabel}>{'Сфера нашего внимания'}</span>
              </label>

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
              value={filters.company}
              onChange={(e) => updateFilter('company', e.target.value)}
              placeholder="Введите название или часть названия компании..."
              className={styles.textInput}
            />
          </div>

          {/* Должность */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Должности</label>
            <div className={styles.checkboxList}>
              {avialablePositions.map(position => (
                <label key={position} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.position.includes(position)}
                    onChange={(e) => {
                      const newPositions = e.target.checked
                        ? [...filters.position, position]
                        : filters.region.filter(c => c !== position);
                      updateFilter('position', newPositions);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{position}</span>
                </label>
              ))}
            </div>
          </div>

           {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Фамилия</label>
            <input
              type="text"
              value={filters.lastName}
              onChange={(e) => updateFilter('lastName', e.target.value)}
              placeholder="Введите фамилию или часть фамилии..."
              className={styles.textInput}
            />
          </div>

           {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Имя</label>
            <input
              type="text"
              value={filters.firstName}
              onChange={(e) => updateFilter('firstName', e.target.value)}
              placeholder="Введите имя или часть имени..."
              className={styles.textInput}
            />
          </div>

           {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Отчество</label>
            <input
              type="text"
              value={filters.surname}
              onChange={(e) => updateFilter('surname', e.target.value)}
              placeholder="Введите отчество или часть отчества..."
              className={styles.textInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};