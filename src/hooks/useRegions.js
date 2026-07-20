import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useCallback, useContext } from 'react';
import { DataContext } from '../DataContext.jsx'

export const useRegions = (chat_id) => {
  const { dev } = useContext(DataContext)
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const fetchRegions = async () => {
    
    const params = {
      chatID: chat_id,
      api: 'getCompanies'
    };
    const response =  await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      JSON.stringify(params),
      {
        headers: { 'Content-Type': dev ? 'application/json' : 'text/plain' }
      }
    ) 
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
  }, []); 

  const optimisticUpdateCompany = useCallback((companyData, isNewCompany = false) => {


    // Обновляем данные в кэше
    queryClient.setQueryData(['regions'], (oldData) => {
      if (!oldData) return isNewCompany ? [companyData] : [];

      if (isNewCompany) {
        return [...oldData, companyData];
      } else {
        return oldData.map((company) =>
          company.id === companyData.id
            ? { ...company, ...companyData } 
            : company 
        );
      }
    });
  }, [queryClient]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (companyData) => {

      const params = {
        name: 'Ваше имя',
        chatID: chat_id,
        api: 'updateCompany',
        company: companyData
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
         {
        headers: { 'Content-Type': dev ? 'application/json' : 'text/plain' }
      }
      );
      return response.data;
    },
    onMutate: async (companyData) => {

      const isNewComapny = companyData.new || false
      queryClient.cancelQueries({ queryKey: ['regions'] });
      optimisticUpdateCompany(companyData, isNewComapny)
    },
    onError: (error, companyData, context) => {

      queryClient.setQueryData(['regions'], context.previousCompanies);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, companyData) => {
      showNotification(`Данные сохранены успешно!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    }
  });

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['regions'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchRegions,
    select: (data) => { return data },
    refetchIntervalInBackground: true,
    // staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 15,
  });

  return {
    companies: rawData || [],
    isLoading,
    updateCompany: updateCompanyMutation.mutate,
    updateCompanyAsync: updateCompanyMutation.mutateAsync,
    error,
    optimisticUpdateCompany,
    transformToRegionsWithCompanies
  };
};