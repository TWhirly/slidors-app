import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCompanyUpdate = (chat_id) => {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate)
  const [saving, setIsSaving] = useState(false)
  const { showNotification } = useNotification();
  const showNotificationRef = useRef(showNotification)
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const uploadingRef = useRef(false);

  useEffect(() => {
    navigateRef.current = navigate
    showNotificationRef.current = showNotification
    queryClientRef.current = queryClient
  }, [navigate, queryClient, showNotification])

  const optimisticUpdateCompany = useCallback(async (companyData) => {

    if (saving)
      return
    queryClientRef.current.cancelQueries(['regions'])
    const isNewCompany = companyData.new || false
    console.log('optimistic')

    // Обновляем данные в кэше
    const oldData = await queryClientRef.current.getQueryData(['regions']);
    await queryClientRef.current.setQueryData(['regions'], () => {


      if (!oldData) return isNewCompany ? [companyData] : [];

      if (isNewCompany) {
        // Возвращаем НОВЫЙ массив с добавленным объектом
        return [...oldData, companyData];
      } else {
        // Возвращаем НОВЫЙ массив, где заменен только нужный объект

        return oldData.map((company) => {
          if (company.id === companyData.id) {
            const newCompanyData = { ...company, ...companyData }
            delete newCompanyData.updateSubscribes
            return newCompanyData
          } // Создаем новый объект компании
          else {
            return company // Возвращаем старую ссылку на объект, если это не он
          }
        }
        );
      }
    });
    // navigateRef.current(`/companies/`)
    return (() => { })
    // await queryClient.invalidateQueries({ queryKey: ['regions'] })
  }, [saving]);

  const optimisticUpdateCompanyRef = useRef(optimisticUpdateCompany)

  useEffect(() => {
    optimisticUpdateCompanyRef.current = optimisticUpdateCompany
  }, [optimisticUpdateCompany])

  const upload = useCallback(async (companyData) => {
    if (uploadingRef.current || saving) return;
    uploadingRef.current = true;
    setIsSaving(true);
    try {
      await optimisticUpdateCompanyRef.current(companyData)
      const apiUrl = process.env.REACT_APP_DEV === "1" ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_GOOGLE_SHEETS_URL

      const headers = process.env.REACT_APP_DEV === "1" ?
        {
          'Content-Type': 'application/json'
        } :
        {
          'Content-Type': 'text/plain'
        }

      setIsSaving(true)
      console.log('upload')
      let params = {
        name: 'Ваше имя',
        chatID: chat_id,
        api: 'updateCompany',
        company: companyData
      };
      params = process.env.REACT_APP_DEV === "1" ? params : JSON.stringify(params)

      const response = await axios.post(
        apiUrl,
        params,
        headers
      );
      setIsSaving(false);
      showNotificationRef.current(`Данные сохранены успешно!`);
      console.log('response', response)
      await queryClientRef.current.invalidateQueries({ queryKey: ['regions'] })
      return response.data;
    }
    catch (err) {
      console.error(err)
    }
    finally {
      uploadingRef.current = false;
      setIsSaving(false);
    }
  }, [chat_id])

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