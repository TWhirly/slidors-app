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
  avialableRegions
}) => {
  console.log('avivalableStatuses', availableStatuses, 'availablePurporses', availablePurposes)

  const [touchStart, setTouchStart] = useState(null);
  console.log('filters in Modal', filters)
  if (!isOpen) return null;
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Обработчик свайпа для закрытия
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const diff = touch.clientY - touchStart.y;

    if (diff > 100) { // Свайп вниз более 100px
      onClose();
    }
    setTouchStart(null);
  };

  return (
    <div className={styles.mainContainer}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Заголовок с индикатором свайпа */}
        <div className="sticky top-0 bg-white border-b border-gray-200 pt-3 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <div className="px-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Фильтры</h2>
            <button onClick={onClose} className="text-gray-500 text-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Содержимое фильтра */}
        <div className="p-4 space-y-6">
          {/* Поиск по тексту */}
          <div>
            <label className="block text-sm font-medium mb-2">Поиск</label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              placeholder="Введите название компании..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Множественный выбор категорий */}
          <div>
            <label className="block text-sm font-medium mb-2">Статусы</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableStatuses.map(status => (
                <label key={status} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      const newStatuses = e.target.checked
                        ? [...filters.status, status]
                        : filters.status.filter(c => c !== status);
                      updateFilter('status', newStatuses);
                    }}
                    className="mr-3 w-4 h-4"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Одиночный выбор статуса */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={filters.purpose[0] || ''}
              onChange={(e) => updateFilter('purpose', e.target.value ? [e.target.value] : [])}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
          </div> */}

          {/* Множественный выбор тегов с чипсами */}
          <div>
            <label className="block text-sm font-medium mb-2">Цели</label>

            {/* Выбранные теги */}
            <div className="flex flex-wrap gap-2 mb-3">
              {filters.purpose.map(purpose => (
                <span
                  key={purpose}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {purpose}
                  <button
                    onClick={() => updateFilter('purpose', filters.purpose.filter(t => t !== purpose))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {filters.purpose.length === 0 && (
                <span className="text-gray-500 text-sm">Цели не выбраны</span>
              )}
            </div>

            {/* Выбор цели */}
            <select
              multiple
              value={filters.purpose}
              onChange={(e) => {
                const selectedPurposes = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter('purpose', selectedPurposes);
                console.log('selectedTags', selectedPurposes);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
              size={4}
            >
              {availablePurposes.map(purporse => (
                <option key={purporse} value={purporse}>{purporse}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Для множественного выбора удерживайте Ctrl (или нажмите и удерживайте на мобильном)
            </div>
          </div>

          {/* Фильтр по дате */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">С даты</label>
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  from: e.target.value
                })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">По дату</label>
              <input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  to: e.target.value
                })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
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
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};