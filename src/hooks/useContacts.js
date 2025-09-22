import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export const useContacts = (chat_id) => {
  const queryClient = useQueryClient();
  const fetchContacts = async () => {
    console.log('getContactsList')
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getContactsList'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    return transformToRegionsWithContacts(response.data);
  };

  const getContactFullNmae = (contact) => {
        const fullName = (contact.lastName ? contact.lastName + ' ' : '') + 
                    (contact.firstName ? contact.firstName + ' ' : '') + 
                    (contact.surname ? contact.surname + ' ' : '')
                    if (fullName === '') {
                        return contact.companyName}
                        return fullName
    };


  // Выносим функцию преобразования с useCallback
  const transformToRegionsWithContacts = (regionRows) => {
    console.log('Contacts select function executed - TRANSFORMATION', regionRows);
    if (!regionRows) return [];

    const contactsByRegion = {};
    regionRows.forEach(contact => {
      if (!contactsByRegion[contact.region]) {
        contactsByRegion[contact.region] = [];
      }
      contactsByRegion[contact.region].push({...contact, fullName: getContactFullNmae(contact)});
    });
    console.log('contactsByRegion', contactsByRegion);
    return Object.entries(contactsByRegion).map(([region, contacts]) => {
      const sortedCompanies = contacts.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      );

      return {
        region,
        contacts: sortedCompanies,
        contacts_count: contacts.length,
      };
    });
  }; // ← Пустой массив зависимостей, функция стабильна

  const { data: regionsWithContacts, isLoading, error } = useQuery({
    queryKey: ['contacts'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchContacts,
    // select: transformToRegionsWithContacts, // ← Стабильная ссылка
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true
  });

   const updateContactMutation = useMutation({
    mutationFn: async (contact) => {
      console.log('mutationFn, emails', contact);
      const params = {
        name: 'Ваше имя',
        chatID: chat_id,
        api: 'updateContact1'
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      return response.data;
    },
    onMutate: async (newEmails) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] });
      
      const previousEmails = queryClient.getQueryData(['contacts']) || [];
      
      // Оптимистичное обновление
      queryClient.setQueryData(['contacts'], newEmails);
      
      return { previousEmails };
    },
    onError: (error, newEmails, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['contacts'], context.previousEmails);
      console.error('Failed to update contact:', error);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  return {
    regionsWithContacts: regionsWithContacts || [],
    isLoading,
    updateConatcts: updateContactMutation.mutate,
    error
  };
};