// FilterModal.jsx
import React, { useState } from 'react';

export const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  availableTags
}) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
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
              placeholder="Введите название события..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Множественный выбор категорий */}
          <div>
            <label className="block text-sm font-medium mb-2">Категории</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableCategories.map(category => (
                <label key={category} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.categories, category]
                        : filters.categories.filter(c => c !== category);
                      updateFilter('categories', newCategories);
                    }}
                    className="mr-3 w-4 h-4"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Одиночный выбор статуса */}
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={filters.status[0] || ''}
              onChange={(e) => updateFilter('status', e.target.value ? [e.target.value] : [])}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
          </div>

          {/* Множественный выбор тегов с чипсами */}
          <div>
            <label className="block text-sm font-medium mb-2">Теги</label>
            
            {/* Выбранные теги */}
            <div className="flex flex-wrap gap-2 mb-3">
              {filters.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => updateFilter('tags', filters.tags.filter(t => t !== tag))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {filters.tags.length === 0 && (
                <span className="text-gray-500 text-sm">Теги не выбраны</span>
              )}
            </div>
            
            {/* Выбор тегов */}
            <select
              multiple
              value={filters.tags}
              onChange={(e) => {
                const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter('tags', selectedTags);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
              size={4}
            >
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
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
                categories: [],
                status: [],
                tags: [],
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