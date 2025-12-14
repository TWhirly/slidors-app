import { useState, useMemo } from 'react';

export const useContactFilters = (contacts) => {
  console.log('contacts hook', contacts)
  console.log('local storage contact filters', localStorage.getItem('contactFilters'))
  const [filters, setFilters] = useState(localStorage.getItem('contactFilters') ? JSON.parse(localStorage.getItem('contactFilters')) : {
    snv: false,
    company: '',
    name: '',
    lastName: '',
    firstName: '',
    surname: '',
    region: '',
    position: []
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(contact => {
      // Фильтр по тексту (частичное совпадение)
      // if (filters.company &&
        
      //   !contact.company.includes(filters.company.toLowerCase())) {
      //   return false;
      // }

      if (filters.region &&
        !filters.region.includes(contact.region)) {
        return false;
      }

      if (filters.company && 
          !contact.companyName?.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }

      if (filters.name &&
        !contact.name?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      if (filters.lastName &&
        !contact.lastName?.toLowerCase().includes(filters.lastName.toLowerCase())) {
        return false;
      }

      if (filters.firstName &&
        !contact.firstName?.toLowerCase().includes(filters.firstName.toLowerCase())) {
        return false;
      }

      if (filters.surname &&
        !contact.surname?.toLowerCase().includes(filters.surname.toLowerCase())) {
        return false;
      }


      if (filters.snv && !contact.snv) {
        return false
      }

      if (filters.position?.length > 0 &&
        !filters.position.includes(contact.title)) {
        return false;
      }

      return true;
    });
  }, [contacts, filters]);

  const avialablePositions = useMemo(() => {

    const positionsSet = new Set(contacts.map(contact => contact.title));

    return Array.from(positionsSet).filter(title => title && title !== '').sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  },
    [contacts]
  );

  const avialableRegions = useMemo(() => {
    const set = new Set(contacts.map(contact => contact.region));
    return Array.from(set)
      .filter(region => region !== '' && region !== 'noRegion')
      .sort();
  }
    ,
    [contacts]
  );

  return {
    filters,
    setFilters,
    filteredContacts,
    isFilterModalOpen,
    setIsFilterModalOpen,
    avialablePositions,
    avialableRegions,
  };
};