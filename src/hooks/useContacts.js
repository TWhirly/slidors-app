import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';

export const useContacts = (chat_id) => {
  const { showNotification } = useNotification();
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
    console.log('contacts from server', response.data)
    return (response.data);
  };

  const getContactFullNmae = (contact) => {
    const fullName = (contact.lastName ? contact.lastName + ' ' : '') + 
                (contact.firstName ? contact.firstName + ' ' : '') + 
                (contact.surname ? contact.surname + ' ' : '')
    if (fullName === '') {
      return contact.companyName
    }
    return fullName
  };

  const transformToRegionsWithContacts = (regionRows) => {
    // console.log('Contacts select function executed - TRANSFORMATION', regionRows);
    if (!regionRows) return [];

    const contactsByRegion = {};
    regionRows.forEach(contact => {
      if (!contactsByRegion[contact.region]) {
        contactsByRegion[contact.region] = [];
      }
      contactsByRegion[contact.region].push({...contact, fullName: getContactFullNmae(contact)});
    });
    // console.log('contactsByRegion', contactsByRegion);
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
  };

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 50,
    refetchIntervalInBackground: true
  });

  // Функция для оптимистичного обновления контакта
  const optimisticUpdateContact = (contactData, isNewContact = false) => {
    queryClient.setQueryData(['contacts'], (oldContacts = []) => {
      console.log('isNewContact', isNewContact)
      console.log('oldContacts h', oldContacts)
      if (isNewContact) {
        // Для нового контакта - добавляем в соответствующий регион
        
        return [...oldContacts, contactData];
      } else {
        const contactUpdIndex = oldContacts.findIndex(contact => contact.id === contactData.id);
        oldContacts[contactUpdIndex] = contactData;
        return [...oldContacts];
      
      }
    });
  };

  const updateContactMutation = useMutation({
    mutationFn: async (contactData) => {
      // console.log('mutationFn, contact', contactData);
      const params = {
        name: 'Ваше имя',
        chatID: chat_id,
        api: 'updateContact',
        contact: contactData
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      return response.data;
    },
    onMutate: async (contactData) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] });
      
      const previousContacts = queryClient.getQueryData(['contacts']) || [];
      
      // Оптимистичное обновление через функцию
      optimisticUpdateContact(contactData, contactData.isNew);
      
      return { previousContacts };
    },
    onError: (error, contactData, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['contacts'], context.previousContacts);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, contactData) => {
      // Дополнительные действия при успехе
       showNotification(`Данные сохранены успешно!`);
      console.log('Contact updated successfully:', data);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  return {
    contacts: contacts || [],
    isLoading,
    updateContact: updateContactMutation.mutate,
    updateContactAsync: updateContactMutation.mutateAsync,
    isUpdating: updateContactMutation.isLoading,
    transformToRegionsWithContacts,
    optimisticUpdateContact, // Экспортируем для ручного использования
    error
  };
};