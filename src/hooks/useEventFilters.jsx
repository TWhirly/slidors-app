// useEventFilters.js
import { useState, useMemo, useContext } from 'react';
import { DataContext } from '../DataContext.jsx';

export const useEventFilters = (events) => {
  const { email } = useContext(DataContext);
   // console.log('events', events)
  const [filters, setFilters] = useState(localStorage.getItem('eventFilters') ? JSON.parse(localStorage.getItem('eventFilters')) : {
    searchText: '',
    purpose: [],
    status: [],
    tags: [],
    manager: [],
    region: [],
    type: [],
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
    if (!events.planned) return [];
    return events.planned.filter(event => {
      // Фильтр по тексту (частичное совпадение)
      if (filters.searchText && 
          !event.companyName.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }
    
      if (filters.status?.length > 0 && 
          !filters.status.includes(event.status)) {
        return false;
      }
      if (filters.purpose?.length > 0 && 
          !filters.purpose.includes(event.purpose)) {
        return false;
      }

       if (filters.region?.length > 0 && 
          !filters.region.includes(event.region)) {
        return false;
      }

      if (filters.type?.length > 0 && 
          !filters.type.includes(event.type)) {
        return false;
      }

      if (filters.manager?.length > 0 && 
          !filters.manager.includes(event.manager) && 
          !filters.manager.includes(event.responsible)) {
        return false;
      }
   
      // Фильтр по дате
      if (filters.dateRange?.from && formatDate(event.endDatetime) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange?.to && formatDate(event.endDatetime) > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

   const filteredOtherEvents = useMemo(() => {
    if (!events.other) return [];
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
      if (filters.status?.length > 0 && 
          !filters.status.includes(event.status)) {
        return false;
      }
      if (filters.purpose?.length > 0 && 
          !filters.purpose.includes(event.purpose)) {
        return false;
      }

       if (filters.type?.length > 0 && 
          !filters.type.includes(event.type)) {
        return false;
      }

       if (filters.region?.length > 0 && 
          !filters.region.includes(event.region)) {
        return false;
      }

      if (filters.manager?.length > 0 && 
          !filters.manager.includes(event.manager)) {
        return false;
      }

      // Фильтр по тегам (хотя бы один тег совпадает)
    //   if (filters.tags.length > 0 && 
    //       !filters.tags.some(tag => event.tags.includes(tag))) {
    //     return false;
    //   }

      // Фильтр по дате
      if (filters.dateRange?.from && formatDate(event.endDatetime) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange?.to && formatDate(event.endDatetime) > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  


  const avialableStatuses = useMemo(() =>{
    
    const plannedSet = new Set(events.planned?.map(event => event.status));

    const otherSet = new Set(events.other?.map(event => event.status));
    return Array.from(new Set([...plannedSet, ...otherSet])).filter(status => status !== '');
  }, 
    [events]
);

  const avialablePurposes = useMemo(() => {
    const plannedSet = new Set(events.planned?.map(event => event.purpose));
    const otherSet = new Set(events.other?.map(event => event.purpose));
    return Array.from(new Set([...plannedSet, ...otherSet]));
  },
    [events]
  );

  const avialableRegions = useMemo(() => {
    const plannedSet = new Set(events.planned?.map(event => event.region));
    const otherSet = new Set(events.other?.map(event => event.region));
    return Array.from(new Set([...plannedSet, ...otherSet]))
    .filter(reg => reg !== '')
    .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  }
    , 
    [events]
  );

  const avialableManagers = useMemo(() => {
    const plannedSet = new Set(events.planned?.map(event => event.manager));
    const otherSet = new Set(events.other?.map(event => event.manager));
    return Array.from(new Set([email, ...plannedSet, ...otherSet])).filter(manager => manager !== '');
  }
    , 
    [email, events]
  );

   const avialableTypes = useMemo(() => {
    const plannedSet = new Set(events.planned?.map(event => event.type));
    const otherSet = new Set(events.other?.map(event => event.type));
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
    avialableStatuses,
    avialablePurposes,
    avialableRegions,
    avialableManagers,
    avialableTypes
  };
};