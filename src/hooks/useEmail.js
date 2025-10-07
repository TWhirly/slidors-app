import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const useEmail = (companyId = null, contactId = null, isNewContact = false) => {
  const queryClient = useQueryClient();

  const fetchContactMail = async () => {
    if (isNewContact) return [{ id: uuidv4(), mail: '' }];
    console.log('fetchContactMail');
    const params = {
      name: 'Ваше имя',
      contactId: contactId,
      api: 'getContactEmails'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    return response.data || [];
  };

  const fetchCompanyMail = async () => {
    if (isNewContact) return [{ id: uuidv4(), mail: '' }];
    console.log('fetchMail');
    const params = {
      name: 'Ваше имя',
      companyId: companyId,
      api: 'getEmails'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    return response.data || [];
  };

  // Получение данных
  const { data: contactMails, isLoading: isContactsMailsLoading, error: mailsFetchError } = useQuery({
    queryKey: ['emails', companyId, contactId, isNewContact],
    queryFn: contactId ? fetchContactMail : fetchCompanyMail,
    staleTime: 600000,
    refetchInterval: 1000 * 60 * 50,
  });

  // Мутация для обновления всех email
  const updateEmailsMutation = useMutation({
    mutationFn: async (contact) => {
      console.log('mutationFn, emails', contact);
      const params = {
        name: 'Ваше имя',
        contactId: contactId,
        companyId: companyId,
        contact: contact,
        api: 'getEmails'
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      return response.data;
    },
    onMutate: async (newEmails) => {
      await queryClient.cancelQueries({ queryKey: ['emails', companyId, contactId, isNewContact] });
      
      const previousEmails = queryClient.getQueryData(['emails', companyId, contactId, isNewContact]) || [];
      
      // Оптимистичное обновление
      queryClient.setQueryData(['emails', companyId, contactId, isNewContact], newEmails);
      
      return { previousEmails };
    },
    onError: (error, newEmails, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['emails', companyId, contactId, isNewContact], context.previousEmails);
      console.error('Failed to update emails:', error);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['emails', companyId, contactId, isNewContact] });
    }
  });

  const optimisticUpdateEmails = async (newEmails) => {
    queryClient.setQueryData(['emails', companyId, contactId, isNewContact], newEmails);
  };

  return {
    contactMails: contactMails || [],
    isContactsMailsLoading,
    mailsFetchError,
    updateEmails: updateEmailsMutation.mutate,
    updateEmailsAsync: updateEmailsMutation.mutateAsync,
    isUpdating: updateEmailsMutation.isLoading,
    optimisticUpdateEmails
  };
};