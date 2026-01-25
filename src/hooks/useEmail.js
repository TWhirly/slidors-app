import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useTelegram  } from './useTelegram';

export const useEmail = (companyId = null, contactId = null, isNewContact = false) => {
  const { chat_id } = useTelegram();
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

  const optimisticUpdateEmails = (companyEmails, isSaving = false) => {
    if(isSaving)
      return
    // const oldEmails = (queryClient.getQueriesData(['emails']) || [])
      console.log('company emails', companyEmails)
      queryClient.setQueryData(['emails'], (oldEmails) => {
        const companyEmailsIds = companyEmails.map(email => email.id)
        console.log('old emails', oldEmails)
        const oldFilteredEmails = oldEmails.filter(email => !companyEmailsIds.includes(email.id)) // in case when some mails have been changed during company/contact editing
        console.log('returned emails',[...oldFilteredEmails, companyEmails], 'old filtered emails', oldFilteredEmails)
        return ([...oldFilteredEmails, ...companyEmails])
      });

  }

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
      // console.log('mutationFn, emails', contact);
      // const params = {
      //   name: 'Ваше имя',
      //   contactId: contactId,
      //   companyId: companyId,
      //   contact: contact,
      //   api: 'getEmails'
      // };
      // const formData = JSON.stringify(params);
      // const response = await axios.post(
      //   process.env.REACT_APP_GOOGLE_SHEETS_URL,
      //   formData,
      // );
      // return response.data;
    },
    onMutate: async (companyEmails) => {
      await queryClient.cancelQueries({ queryKey: ['emails'] });
      
      // const previousEmails = queryClient.getQueryData(['emails']) || [];
      
      // Оптимистичное обновление
      optimisticUpdateEmails(companyEmails)
      
      return;
    },
    onError: (error, newEmails, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['emails', context.previousEmails]);
      console.error('Failed to update emails:', error);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    }
  });

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