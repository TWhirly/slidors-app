import { useQuery , useQueryClient , useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useCallback, useState } from 'react';

export const useCompanyUpdate = (chat_id) => {
  const [saving, setIsSaving] = useState(false)
  console.log('useCompanyUpdate hook', saving)
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
 
  const optimisticUpdateCompany = useCallback(async (companyData) => {
    
    if(saving)
      return
    queryClient.cancelQueries(['regions'])
     const isNewCompany = companyData.new || false
    console.log('optimistic')
    
  // Обновляем данные в кэше
  const oldData = await queryClient.getQueryData(['regions']);
  await queryClient.setQueryData(['regions'], () => {
    
    console.log('old data', oldData)
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
  // await queryClient.invalidateQueries({ queryKey: ['regions'] })
  },[queryClient, saving]);

    const upload = useCallback(async (companyData) => {
      await optimisticUpdateCompany(companyData)
      setIsSaving(true)
      console.log('upload')
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
      )
      if(!saving)
      showNotification(`Данные сохранены успешно!`);
    
      // await queryClient.invalidateQueries({ queryKey: ['regions'] })
      return response.data;
    },[chat_id, optimisticUpdateCompany, saving, showNotification])
    
//   const {
//   data,
//   error,
//   isError,
//   isIdle,
//   isPending,
//   isPaused,
//   isSuccess,
//   failureCount,
//   failureReason,
//   mutate,
//   mutateAsync,
//   reset,
//   status,
//   submittedAt,
//   variables,
// } = useMutation({
    
//     mutationFn: async (companyData) => {
//       if (isPending)
//       return
//       const params = {
//         name: 'Ваше имя',
//         chatID: chat_id,
//         api: 'updateCompany',
//         company: companyData
//       };
//       const formData = JSON.stringify(params);
//       const response = await axios.post(
//         process.env.REACT_APP_GOOGLE_SHEETS_URL,
//         formData,
//       );
//       return response.data;
//     },
//     onMutate: async (companyData) => {
     
      
//       const isNewComapny = companyData.new || false
//       await queryClient.cancelQueries({ queryKey: ['regions'] });
//       console.log('onMutate isNew', isNewComapny, status)
//       optimisticUpdateCompany(companyData, isNewComapny)
//       // const previousCompanies = queryClient.getQueryData(['regions']) || [];
//       // return { previousCompanies };
//     },
//     onError: (error, companyData, context) => {
//       // Откатываем изменения при ошибке
//       setIsSaving(false)
//       queryClient.setQueryData(['regions'], context.previousCompanies);
//       console.error('Failed to update contact:', error);
//     },
//     onSuccess: async (data, companyData) => {
       
//       await queryClient.invalidateQueries({ queryKey: ['regions'] })
//       console.log('Contact updated successfully:', data, 'status', status);
//     },
//     onSettled: async () => {
      
//       if(submittedAt === 0 || undefined)
//         return
//       console.log('settled', submittedAt, 'status', status, 'mut key', mutate)
//       showNotification(`Данные сохранены успешно!`);
//       // reset();
//       // await queryClient.invalidateQueries({ queryKey: ['regions'] });
//     }
   

    
//   });
  //  reset();

return {
    upload,
    // updateCompany: mutate,
    // reset,
    // updateCompanyAsync: updateCompanyMutation.mutateAsync,
    // data,
    saving,
    optimisticUpdateCompany,
    // submittedAt,
    // status
  };
};