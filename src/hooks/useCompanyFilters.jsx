import { useState, useMemo } from 'react';

export const useCompanyFilters = (companies) => {
  console.log('companies in hook', companies)
  console.log('local storage company filters', localStorage.getItem('companyFilters'))
  const [filters, setFilters] = useState(localStorage.getItem('companyFilters') ? JSON.parse(localStorage.getItem('companyFilters')) : {
    name: '',
    type: [],
    status: [],
    manager: [],
    city: [],
    region: [],
    handled: []
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const filteredCompanies = useMemo(() => {
    if (!companies || !filters) return [];
    return companies.filter(company => {
     
      if (filters.region.length > 0 &&
        !filters.region.includes(company.region)) {
        return false;
      }

      if (filters.name &&
        !company.name?.toLowerCase().includes(filters.name?.toLowerCase())) {
        return false;
      }

      if (filters.type.length > 0 &&
        !filters.type?.includes(company.type)) {
        return false;
      }

      if (filters.status.length > 0 &&
        !filters.status?.includes(company.status)) {
        return false;
      }

      if (filters.manager.length > 0 &&
        !filters.manager?.includes(company.manager)) {
        return false;
      }

      if (filters.handled?.includes('Проработан') && 
        !company.handled ) {
        return false
      }

      if (filters.handled?.includes('Не проработан') && 
        company.handled ) {
        return false
      }

      if (filters.city?.length > 0 && filters.region?.length > 0 &&
        !filters.city.includes(company.city)) {
        return false;
      }

      return true;
    });
  }, [companies, filters]);

  
  const avialableRegions = useMemo(() => {
    const set = new Set(companies.map(company => company.region));
    return Array.from(set)
      .filter(region => region !== '' && region !== 'noRegion')
      .sort();
  }, [companies]
  );

  const avialableTypes = useMemo(() => {
    const set = new Set(companies.map(company => company.type));
    return Array.from(set)
      .filter(type => type !== '')
      .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  }, [companies]
  );

  const avialableStatuses = useMemo(() => {
    const set = new Set(companies.map(company => company.status));
    return Array.from(set)
      .filter(status => status !== '')
      .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  }, [companies]
  );

  const avialableManagers = useMemo(() => {
    const set = new Set(companies.map(company => company.manager));
    return Array.from(set)
      .filter(manager => manager !== '')
      .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  }, [companies]
  );

   const avialableCities = useMemo(() => {
    const set = new Set(companies.map(company => company.city));
    return Array.from(set)
      .filter(city => city !== '')
      .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
  }, [companies]
  );

  const regionCities = useMemo(() => {
    const obj = companies.reduce((acc, company) => {
      if(company.city === '')
        return acc
      if (!acc[company.region]) {
        acc[company.region] = [company.city]
      return acc
    } 
        if (!acc[company.region].includes(company.city)) {
            acc[company.region].push(company.city)
        }
       return acc 
    }, {})
    return obj
  }, [companies])

  const avialableHandle =  ['Проработан', 'Не проработан']
  

  console.log('region cities in hook', regionCities)

  
  
  return {
    filters,
    setFilters,
    filteredCompanies,
    isFilterModalOpen,
    setIsFilterModalOpen,
    avialableTypes,
    avialableRegions,
    avialableCities,
    avialableStatuses,
    avialableManagers,
    avialableHandle,
    regionCities
  };
};