// FilterModal.jsx
import React, { useState } from 'react';
import styles from './FilterModal.module.css';

export const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  avialableStatuses,
  avialablePurposes,
  avialableRegions,
  avialableManagers,
  avialableTypes
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
            <label className={styles.filterLabel}>Менеджеры</label>
            <div className={styles.checkboxList}>
              {avialableManagers.map(manager => (
                <label key={manager} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.manager.includes(manager)}
                    onChange={(e) => {
                      const newManagers = e.target.checked
                        ? [...filters.manager, manager]
                        : filters.manager.filter(c => c !== manager);
                      updateFilter('manager', newManagers);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{manager}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Поиск по тексту */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Компания</label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              placeholder="Введите название или часть названия компании..."
              className={styles.textInput}
            />
          </div>

          {/* Выбор статусов */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Работают ли с системой Слайдорс?</label>
            <div className={styles.checkboxList}>
              {avialableStatuses.map(status => (
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
            <div className={styles.checkboxList}>
              {avialablePurposes.map(purpose => (
                <label key={purpose} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.purpose.includes(purpose)}
                    onChange={(e) => {
                      const newPurposes = e.target.checked
                        ? [...filters.purpose, purpose]
                        : filters.purpose.filter(c => c !== purpose);
                      updateFilter('purpose', newPurposes);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{purpose}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Типы</label>
            <div className={styles.checkboxList}>
              {avialableTypes.map(type => (
                <label key={type} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={(e) => {
                      const newPurposes = e.target.checked
                        ? [...filters.type, type]
                        : filters.type.filter(c => c !== type);
                      updateFilter('type', newPurposes);
                    }}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Фильтр по дате */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Период</label>
            <div className={styles.dateGrid}>
              <div className={styles.dateBox}>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value
                  })}
                  className={styles.dateInput}
                  placeholder="Дата начала"
                />
              </div>
              <div className={styles.dateBox}>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value
                  })}
                  className={styles.dateInput}
                  placeholder="Дата окончания"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className={styles.actions}>
          <button
            onClick={() => {
              localStorage.removeItem('eventFilters');
              onFiltersChange({
                searchText: '',
                purpose: [],
                status: [],
                tags: [],
                region: [],
                manager: [],
                type: [],
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