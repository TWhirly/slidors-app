// FilterModal.jsx
import React, { useState, useEffect } from 'react';
import styles from '../Activity/FilterModal.module.css';

export const SnvFilter = ({
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
    let newFilters
    if (key === 'specificDate') {
      // При установке specificDate - очищаем dateRange
      newFilters = { 
        ...filters, 
        specificDate: value, 
        dateRange: { from: '', to: '' } // Используем пустые строки, а не null
      };
    } else if (key === 'dateRange') {
      // При изменении dateRange - очищаем specificDate
      newFilters = { 
        ...filters, 
        dateRange: value,
        specificDate: '' 
      };
    } else {
      newFilters = { ...filters, [key]: value };
    }
    onFiltersChange(newFilters);
    localStorage.setItem('eventFilters', JSON.stringify(newFilters));
  };
  console.log('avialableRegions', avialableRegions)

  const handleSpecificDateChange = (e) => {
    const value = e.target.value;
    updateFilter('specificDate', value);
  };

  // Обработчик для dateRange.from
  const handleDateFromChange = (e) => {
    const value = e.target.value;
    updateFilter('dateRange', {
      ...filters.dateRange,
      from: value
    });
  };

  // Обработчик для dateRange.to
  const handleDateToChange = (e) => {
    const value = e.target.value;
    updateFilter('dateRange', {
      ...filters.dateRange,
      to: value
    });
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


             <div className={styles.filterSection}>
            <label className={styles.filterLabel}>За дату</label>
            <div className={styles.dateGrid}>
              <div className={styles.dateBox}>
                <input
                  type="date"
                  value={filters.specificDate}
                  onChange={handleSpecificDateChange}
                  className={styles.dateInput}
                  placeholder="Дата"
                />
              </div>
              
            </div>
          </div>
            

             {/* Фильтр по дате */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>За период</label>
            <div className={styles.dateGrid}>
              <div className={styles.dateBox}>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={handleDateFromChange}
                  className={styles.dateInput}
                  placeholder="Дата начала"
                />
              </div>
              <div className={styles.dateBox}>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={handleDateToChange}
                  className={styles.dateInput}
                  placeholder="Дата окончания"
                />
              </div>
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
          

          {/* Выбор целей */}
       
          
       
        </div>

        {/* Кнопки действий */}
       
      </div>
    </div>
  );
};