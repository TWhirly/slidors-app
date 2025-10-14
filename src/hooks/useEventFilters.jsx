// useEventFilters.js
import { useState, useMemo } from 'react';

export const useEventFilters = (events) => {
   console.log('events', events)
  const [filters, setFilters] = useState({
    searchText: '',
    categories: [],
    status: [],
    tags: [],
    dateRange: { from: '', to: '' }
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Фильтр по тексту (частичное совпадение)
      if (filters.searchText && 
          !event.companyName.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }

      // Фильтр по категориям (точное совпадение)
      if (filters.categories.length > 0 && 
          !filters.categories.includes(event.category)) {
        return false;
      }

      // Фильтр по статусу (точное совпадение)
      if (filters.status.length > 0 && 
          !filters.status.includes(event.status)) {
        return false;
      }

      // Фильтр по тегам (хотя бы один тег совпадает)
    //   if (filters.tags.length > 0 && 
    //       !filters.tags.some(tag => event.tags.includes(tag))) {
    //     return false;
    //   }

      // Фильтр по дате
      if (filters.dateRange.from && event.endDatetime < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && event.endDatetime > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const availableCategories = useMemo(() => 
    Array.from(new Set(events.map(event => event.status))), 
    [events]
  );

  const availableTags = useMemo(() => 
    Array.from(new Set(events.flatMap(event => event.purporse))), 
    [events]
  );

  return {
    filters,
    setFilters,
    filteredEvents,
    isFilterModalOpen,
    setIsFilterModalOpen,
    availableCategories,
    availableTags
  };
};