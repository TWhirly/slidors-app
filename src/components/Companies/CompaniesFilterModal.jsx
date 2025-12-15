// FilterModal.jsx
import React, { useState, useEffect } from 'react';
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
  avialableHandle,
  regionCities
}) => {

  const [avialableCities, setAvialableCities] = useState([])

  useEffect(() => {
    let filteredCities = []
    Object.entries(regionCities).map(([region, cities]) => {
      if (filters.region.includes(region))
        filteredCities.push(...cities)
    })
    setAvialableCities(filteredCities.sort((a, b) => a.toLowerCase().localeCompare(b, 'ru')))
  }, [filters.region])

  console.log('regionCities', regionCities)
  console.log('avialableCities', avialableCities)

  if (!isOpen) return null;

  const updateFilter = (key, value) => {

    console.log(value)
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    console.log('filters', filters)
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
                    checked={filters.handled.includes(handled)}
                    onChange={(e) => {
                      const newHandled = e.target.checked
                        ? [...filters.handled, handled]
                        : filters.handled.filter(c => c !== handled);
                      updateFilter('handled', newHandled);
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

          {/* Город */}
          {filters.region.length > 0 &&
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Города</label>
              <div className={styles.checkboxList}>
                {avialableCities.map(city => (
                  <label key={city} className={styles.checkboxItem}>
                    <input
                      disabled={filters.region.length === 0}
                      type="checkbox"
                      checked={filters.city.includes(city)}
                      onChange={(e) => {
                        const newCities = e.target.checked
                          ? [...filters.city, city]
                          : filters.city.filter(c => c !== city);
                        updateFilter('city', newCities);
                      }}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxLabel}>{city}</span>
                  </label>
                ))}
              </div>
            </div>
          }
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

          {/* Статус */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Типы</label>
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


        </div>
      </div>
    </div>
  );
};