import { useQuery , useQueryClient , useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useState } from 'react';

export const useCompanyUpdate = (chat_id) => {
  const [saving, setIsSaving] = useState(false)
  console.log('useRegions hook')
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  
  const optimisticUpdateCompany = (companyData, isNewComapny = false) => {
    if (saving)
    return
    console.log('optimisticUpdateCompany', companyData, isNewComapny)
    const oldComapnies = [...queryClient.getQueryData(['regions'])] || []
    queryClient.setQueryData(['regions'], () => {
      console.log('oldComapnies',oldComapnies)
      if (isNewComapny) {
        return ([...oldComapnies, companyData]);
      } else {
        const companyUpdIndex = oldComapnies.findIndex(contact => contact.id === companyData.id);
        oldComapnies[companyUpdIndex] = companyData;  
        return [...oldComapnies];
      }
    })
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
      setIsSaving(true)
      const isNewComapny = companyData.new || false
      queryClient.cancelQueries({ queryKey: ['regions'] });
      console.log('onMutate isNew', isNewComapny)
      optimisticUpdateCompany(companyData, isNewComapny)
      // const previousCompanies = queryClient.getQueryData(['regions']) || [];
      // return { previousCompanies };
    },
    onError: (error, companyData, context) => {
      // Откатываем изменения при ошибке
      setIsSaving(false)
      queryClient.setQueryData(['regions'], context.previousCompanies);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, companyData) => {
      setIsSaving(false)
      // Дополнительные действия при успехе
      showNotification(`Данные сохранены успешно!`);
      queryClient.invalidateQueries({ queryKey: ['regions'] })
      console.log('Contact updated successfully:', data);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      // queryClient.invalidateQueries({ queryKey: ['regions'] });
    }
  });

  return {
    updateCompany: updateCompanyMutation.mutate,
    updateCompanyAsync: updateCompanyMutation.mutateAsync,
    saving,
    optimisticUpdateCompany,
  };
};