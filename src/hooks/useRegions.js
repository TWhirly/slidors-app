import { useQuery , useQueryClient , useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export const useRegions = (chat_id) => {
  // console.log('useRegions hook')
  const queryClient = useQueryClient();
  const fetchRegions = async () => {

     const apiUrl = process.env.REACT_APP_DEV === "1" ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_GOOGLE_SHEETS_URL

        const headers = process.env.REACT_APP_DEV === "1" ?
            {
                'Content-Type': 'application/json'
            } :
            {
                'Content-Type': 'text/plain'
            }

    console.log('fetchRegions executed');
    let params = {
      chatID: chat_id,
      api: 'getCompanies'
    };

    params = process.env.REACT_APP_DEV === "1" ? params: JSON.stringify(params)

    const response = await axios.post(
      apiUrl,
      params,
      headers
    );
    return (response.data);
  };

 
  const transformToRegionsWithCompanies = useCallback((regionRows) => {
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
          recyclers: company.recyclers,
          tt: company.tt,
          dealers: company.dealers,
          url: company.url,
          logo: company.logo,
          firm: company.firm,
          turnover: +company.turnover || 0,
          wa_subscribe: company.wa_subscribe, 
          tg_subscribe: company.tg_subscribe,
          max_subscribe: company.max_subscribe
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
  },[]); // ← Пустой массив зависимостей, функция стабильна

  const optimisticUpdateCompany = useCallback(async (companyData, isNewCompany = false) => {

  // Обновляем данные в кэше
  await queryClient.setQueryData(['regions'], (oldData) => {
    if (!oldData) return isNewCompany ? [companyData] : [];

    if (isNewCompany) {
      // Возвращаем НОВЫЙ массив с добавленным объектом
      return [...oldData, companyData];
    } else {
      // Возвращаем НОВЫЙ массив, где заменен только нужный объект
      return oldData.map((company) => 
        company.id === companyData.id 
          ? { ...company, ...companyData } // Создаем новый объект компании
          : company // Возвращаем старую ссылку на объект, если это не он
      );
    }
  });
},[queryClient]);
    
  const { data, isLoading, error } = useQuery({
    queryKey: ['regions'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 30,
    // select: (data) => {return data},
    refetchIntervalInBackground: true,
    // refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 25,
    // cacheTime: 1000 * 60 * 60,
  });

  return {
    companies: data || [],
    // regionsWithCompanies: companies || [],
    isLoading,
    error,
    optimisticUpdateCompany,
    transformToRegionsWithCompanies
  };
};