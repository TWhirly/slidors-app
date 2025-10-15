// useEventFilters.js
import { useState, useMemo } from 'react';

export const useEventFilters = (events) => {
   console.log('events', events)
  const [filters, setFilters] = useState({
    searchText: '',
    purpose: [],
    status: [],
    tags: [],
    region: [],
    dateRange: { from: '', to: '' }
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredEvents = useMemo(() => {
    return events.planned.filter(event => {
      // Фильтр по тексту (частичное совпадение)
      if (filters.searchText && 
          !event.companyName.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }
    
      if (filters.status.length > 0 && 
          !filters.status.includes(event.status)) {
        return false;
      }
      if (filters.purpose.length > 0 && 
          !filters.purpose.includes(event.purpose)) {
        return false;
      }

       if (filters.region.length > 0 && 
          !filters.region.includes(event.region)) {
        return false;
      }
   
      // Фильтр по дате
      if (filters.dateRange.from && formatDate(event.endDatetime) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && formatDate(event.endDatetime) > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

   const filteredOtherEvents = useMemo(() => {
    return events.other.filter(event => {
      // Фильтр по тексту (частичное совпадение)
      if (filters.searchText && 
          !event.companyName.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }

      // Фильтр по категориям (точное совпадение)
      // if (filters.categories.length > 0 && 
      //     !filters.categories.includes(event.status)) {
      //   return false;
      // }

      // Фильтр по статусу (точное совпадение)
      if (filters.status.length > 0 && 
          !filters.status.includes(event.status)) {
        return false;
      }
      if (filters.purpose.length > 0 && 
          !filters.purpose.includes(event.purpose)) {
        return false;
      }

       if (filters.region.length > 0 && 
          !filters.region.includes(event.region)) {
        return false;
      }

      // Фильтр по тегам (хотя бы один тег совпадает)
    //   if (filters.tags.length > 0 && 
    //       !filters.tags.some(tag => event.tags.includes(tag))) {
    //     return false;
    //   }

      // Фильтр по дате
      if (filters.dateRange.from && formatDate(event.endDatetime) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && formatDate(event.endDatetime) > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  


  const availableStatuses = useMemo(() =>{
    const plannedSet = new Set(events.planned.map(event => event.status));
    const otherSet = new Set(events.other.map(event => event.status));
    return Array.from(new Set([...plannedSet, ...otherSet])).filter(status => status !== '');
  }, 
    [events]
);

  const availablePurposes = useMemo(() => {
    const plannedSet = new Set(events.planned.map(event => event.purpose));
    const otherSet = new Set(events.other.map(event => event.purpose));
    return Array.from(new Set([...plannedSet, ...otherSet]));
  },
    [events]
  );

  const avialableRegions = useMemo(() => {
    const plannedSet = new Set(events.planned.map(event => event.region));
    const otherSet = new Set(events.other.map(event => event.region));
    return Array.from(new Set([...plannedSet, ...otherSet]));
  }
    , 
    [events]
  );

  return {
    filters,
    setFilters,
    filteredEvents,
    filteredOtherEvents,
    isFilterModalOpen,
    setIsFilterModalOpen,
    availableStatuses,
    availablePurposes,
    avialableRegions
  };
};