import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export const useContacts = (chat_id) => {
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
    return response.data;
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
  const transformToRegionsWithContacts = useCallback((regionRows) => {
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
  }, []); // ← Пустой массив зависимостей, функция стабильна

  const { data: regionsWithContacts, isLoading, error } = useQuery({
    queryKey: ['contacts'], // ← Убедитесь, что ключ стабилен
    queryFn: fetchContacts,
    select: transformToRegionsWithContacts, // ← Стабильная ссылка
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true
  });

  return {
    regionsWithContacts: regionsWithContacts || [],
    isLoading,
    error
  };
};