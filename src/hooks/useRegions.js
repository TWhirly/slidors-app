import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useRegions = (chat_id) => {
  // Функция для получения регионов
  const fetchRegions = async () => {
    console.log('fetchRegions');
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getCompanies'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    return response.data;
  };

  // Функция преобразования данных
  const transformToRegionsWithCompanies = (regionRows) => {
    const now = new Date();
    console.log('transformToRegionsWithCompanies ', now);
    if (!regionRows) return [];

    return regionRows.reduce((acc, company) => {
      const existingRegion = acc.find(r => r.region === company.region);
      if (existingRegion) {
        existingRegion.companies.push({
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
          turnover: company.turnover
        });
        existingRegion.companies.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        acc.push({
          region: company.region,
          companies: [{
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
            turnover: company.turnover
          }],
          company_count: regionRows.filter(r => r.region === company.region).length,
          regionTurnover: regionRows.filter(r => r.region === company.region)
            .reduce((acc, r) => acc + (Math.round(+r.turnover)), 0)
        });
      }
      return acc;
    }, []);
  };

  // Запрос для получения регионов с преобразованием
  const { data: regionsWithCompanies, isLoading, error } = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    select: transformToRegionsWithCompanies, // Преобразование данных после запроса
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return {
    regionsWithCompanies: regionsWithCompanies || [],
    isLoading,
    error
  };
};