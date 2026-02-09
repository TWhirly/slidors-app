import { useQuery , useQueryClient , useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCompanyUpdate = (chat_id) => {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate)
  const [saving, setIsSaving] = useState(false)
  console.log('useCompanyUpdate hook', saving)
  const { showNotification } = useNotification();
  const showNotificationRef = useRef(showNotification)
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    navigateRef.current = navigate
    showNotificationRef.current = showNotification
    queryClientRef.current = queryClient
  },[])
 
  const optimisticUpdateCompany = useCallback(async (companyData) => {
    
    if (saving)
      return
    queryClientRef.current.cancelQueries(['regions'])
     const isNewCompany = companyData.new || false
    console.log('optimistic')
    
  // Обновляем данные в кэше
  const oldData = await queryClientRef.current.getQueryData(['regions']);
  await queryClientRef.current.setQueryData(['regions'], () => {
    
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
  navigateRef.current(`/companies/`)
  return(() => {})
  // await queryClient.invalidateQueries({ queryKey: ['regions'] })
  },[saving]);

  const optimisticUpdateCompanyRef = useRef(optimisticUpdateCompany)

  useEffect(() => {
    optimisticUpdateCompanyRef.current = optimisticUpdateCompany
  })

    const upload = useCallback(async (companyData) => {
      await optimisticUpdateCompanyRef.current(companyData)
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
      setIsSaving(false);
      showNotificationRef.current(`Данные сохранены успешно!`);
      console.log('response', response)
      await queryClientRef.current.invalidateQueries({ queryKey: ['regions'] })
      return response.data;
    },[chat_id])
    
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