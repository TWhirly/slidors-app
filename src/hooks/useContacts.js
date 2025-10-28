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
    return transformToRegionsWithContacts(response.data);
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

  const { data: regionsWithContacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 50,
    refetchIntervalInBackground: true
  });

  // Функция для оптимистичного обновления контакта
  const optimisticUpdateContact = (contactData, isNewContact = false) => {
    queryClient.setQueryData(['contacts'], (oldContacts = []) => {
      if (isNewContact) {
        // Для нового контакта - добавляем в соответствующий регион
        const contactRegion = contactData.region || '?';
        
        return oldContacts.map(regionGroup => {
          if (regionGroup.region === contactRegion) {
            // Добавляем контакт в существующий регион
            return {
              ...regionGroup,
              contacts: [...regionGroup.contacts, contactData],
              contacts_count: regionGroup.contacts_count + 1
            };
          }
          return regionGroup;
        });
      } else {
        // Для существующего контакта - обновляем
        // console.log('optimisticUpdateContact', oldContacts);
        return oldContacts.map(regionGroup => {
          // Ищем контакт в текущей группе региона
          const contactIndex = regionGroup.contacts.findIndex(
            contact => contact.id === contactData.id
          );
          
          if (contactIndex !== -1) {
            // Если контакт найден в этой группе
            const updatedContacts = [...regionGroup.contacts];
            updatedContacts[contactIndex] = contactData;
            
            return {
              ...regionGroup,
              contacts: updatedContacts
            };
          }
          return regionGroup;
        });
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
       showNotification(`Данные сохранены успешно!`, true);
      console.log('Contact updated successfully:', data);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  return {
    regionsWithContacts: regionsWithContacts || [],
    isLoading,
    updateContact: updateContactMutation.mutate,
    updateContactAsync: updateContactMutation.mutateAsync,
    isUpdating: updateContactMutation.isLoading,
    optimisticUpdateContact, // Экспортируем для ручного использования
    error
  };
};