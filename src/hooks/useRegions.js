import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export const useRegions = (chat_id) => {
  const fetchRegions = async () => {
    console.log('fetchRegions executed');
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getCompanies'
    };
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      JSON.stringify(params),
    );
    return response.data;
  };

  // Выносим функцию преобразования с useCallback
  const transformToRegionsWithCompanies = useCallback((regionRows) => {
    console.log('select function executed - TRANSFORMATION');
    if (!regionRows) return [];
    
    const companiesByRegion = {};
    regionRows.forEach(company => {
      if (!companiesByRegion[company.region]) {
        companiesByRegion[company.region] = [];
      }
      companiesByRegion[company.region].push({
        id: company.id,
          name: company.name,
          type: company.type,
          status: company.status,
          handled: company.handled,
          wa: company.wa,
          tg: company.tg,
          city: company.city,
          address: company.address,
          region: company.region,
          description: company.description,
          phone1: company.phone1,
          phone2: company.phone2,
          manager: company.manager,
          whatsapp: company.whatsapp,
          telegram: company.telegram,
          recyclers: company.recyclers ? company.recyclers.split(',').filter(Boolean) : [],
          tt: company.tt,
          dealers: company.dealers,
          url: company.url,
          logo: company.logo,
          firm: company.firm,
          turnover: +company.turnover || 0
      });
    });

    return Object.entries(companiesByRegion).map(([region, companies]) => {
      const sortedCompanies = companies.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      const regionTurnover = companies.reduce(
        (sum, company) => sum + (Math.round(company.turnover)),
        0
      );

      return {
        region,
        companies: sortedCompanies,
        company_count: companies.length,
        regionTurnover
      };
    });
  }, []); // ← Пустой массив зависимостей, функция стабильна

  const { data: regionsWithCompanies, isLoading, error } = useQuery({
    queryKey: ['regions'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchRegions,
    select: transformToRegionsWithCompanies, // ← Стабильная ссылка
    staleTime: 700000,
    refetchInterval: 600000
  });

  return {
    regionsWithCompanies: regionsWithCompanies || [],
    isLoading,
    error
  };
};