import { useQuery , useQueryClient , useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';
import { useNotification } from '../components/notifications/NotificationContext.jsx';

export const useRegions = (chat_id) => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
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
    return transformToRegionsWithCompanies(response.data);
  };

  // Выносим функцию преобразования с useCallback
  const transformToRegionsWithCompanies = (regionRows) => {
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
  }; // ← Пустой массив зависимостей, функция стабильна

  const optimisticUpdateCompany = (companyData, isNewComapny = false) => {
    queryClient.setQueryData(['regions'], (oldComapnies = []) => {
      if (isNewComapny) {
        // Для нового контакта - добавляем в соответствующий регион
        const companyRegion = companyData.region || '?';
        
        return oldComapnies.map(regionGroup => {
          if (regionGroup.region === companyRegion) {
            // Добавляем контакт в существующий регион
            return {
              ...regionGroup,
              companies: [...regionGroup.companies, companyData],
              companies_count: regionGroup.companies_count + 1
            };
          }
          return regionGroup;
        });
      } else {
        // Для существующего контакта - обновляем
         console.log('optimisticUpdateCompany', oldComapnies);
        return oldComapnies.map(regionGroup => {
         
          // Ищем контакт в текущей группе региона
          const companyIndex = regionGroup.companies.findIndex(
            company => company.id === companyData.id
          );
          
          if (companyIndex !== -1) {
            // Если контакт найден в этой группе
            const updatedCompanies = [...regionGroup.companies];
            updatedCompanies[companyIndex] = companyData;
            
            return {
              ...regionGroup,
              companies: updatedCompanies
            };
          }
          return regionGroup;
        });
      }
    });
  };

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
      );
      return response.data;
    },
    onMutate: async (companyData) => {
      await queryClient.cancelQueries({ queryKey: ['regions'] });
      const previousCompanies = queryClient.getQueryData(['regions']) || [];
      return { previousCompanies };
    },
    onError: (error, companyData, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['regions'], context.previousCompanies);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, companyData) => {
      // Дополнительные действия при успехе
       showNotification(`Данные сохранены успешно!`, true);
      console.log('Contact updated successfully:', data);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    }
  });

  const { data: regionsWithCompanies, isLoading, error } = useQuery({
    queryKey: ['regions'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchRegions,
    // select: transformToRegionsWithCompanies, // ← Стабильная ссылка
    staleTime: 1000 * 60 * 30,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 60 * 50
  });

  return {
    regionsWithCompanies: regionsWithCompanies || [],
    isLoading,
    updateCompany: updateCompanyMutation.mutate,
    updateCompanyAsync: updateCompanyMutation.mutateAsync,
    error,
    optimisticUpdateCompany
  };
};