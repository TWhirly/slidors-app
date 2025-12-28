import { useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DataContext } from '../DataContext'

export const useEmail = (companyId = null, contactId = null, isNewContact = false) => {
  const { chat_id } = useContext(DataContext);
  const queryClient = useQueryClient();

  const fetchMail = async () => {
    if (isNewContact) return [{ id: uuidv4(), mail: '' }];
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getEmailsbyRegions'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    return response.data || [];
  }

  const fetchContactMail = async () => {
    if (isNewContact) return [{ id: uuidv4(), mail: '' }];
    console.log('fetchContactMail');
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getEmailsbyRegions'
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
  const { data: emails, isLoading: isContactsMailsLoading, error: mailsFetchError } = useQuery({
    queryKey: ['emails'],
    queryFn: fetchMail,
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
      await queryClient.cancelQueries({ queryKey: ['emails'] });
      
      const previousEmails = queryClient.getQueryData(['emails']) || [];
      
      // Оптимистичное обновление
      queryClient.setQueryData(['emails'], newEmails);
      
      return { previousEmails };
    },
    onError: (error, newEmails, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['emails', context.previousEmails]);
      console.error('Failed to update emails:', error);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['emails', isNewContact] });
    }
  });

  const optimisticUpdateEmails = async (newEmails) => {
    queryClient.setQueryData(['emails'], newEmails);
  };

  return {
    emails: emails || [],
    isContactsMailsLoading,
    mailsFetchError,
    updateEmails: updateEmailsMutation.mutate,
    updateEmailsAsync: updateEmailsMutation.mutateAsync,
    isUpdating: updateEmailsMutation.isLoading,
    optimisticUpdateEmails
  };
};